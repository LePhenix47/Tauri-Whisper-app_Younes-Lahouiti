use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::path::Path;
use whisper_rs::{FullParams, SamplingStrategy, WhisperContext, WhisperContextParameters};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SamplingStrategyConfig {
    #[serde(rename = "type")]
    pub strategy_type: String, // "greedy" or "beam_search"
    #[serde(skip_serializing_if = "Option::is_none")]
    pub best_of: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub beam_size: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub patience: Option<f32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TranscriptionSettings {
    pub preset: String,
    pub sampling_strategy: SamplingStrategyConfig,
    pub temperature: f32,
    pub thread_count: Option<String>, // "auto" or number as string (not used, always use all cores)
    pub no_context: bool,
    pub initial_prompt: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_text_context: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub entropy_threshold: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub no_speech_threshold: Option<f32>,
}

/// Transcribe a single WAV audio file using whisper_rs.
///
/// Requirements:
/// - WAV must be 16kHz, 16-bit PCM.
/// - Automatically converts stereo to mono if needed.
/// - Model must be a `ggml-*.bin` file.
///
/// Parameters:
/// - `auto_detect_language`: If true, uses "auto" for language detection. If false, uses "en".
/// - `settings`: Optional transcription settings (sampling strategy, temperature, etc.)
///
/// Returns: (language, segments) where segments = Vec<(start_time, end_time, text)>
///
/// This function follows the whisper_rs example closely for maximum CPU efficiency.
pub fn transcribe_single_pass(
    model_path: &Path,
    wav_path: &Path,
    auto_detect_language: bool,
    settings: Option<TranscriptionSettings>,
) -> Result<(String, Vec<(f64, f64, String)>)> {
    // --- 1️⃣ Load audio ---
    let mut reader = hound::WavReader::open(wav_path).context("Failed to open WAV file")?;
    let spec = reader.spec();

    // Validate sample rate (must be 16kHz for Whisper)
    if spec.sample_rate != 16_000 {
        anyhow::bail!("Expected 16kHz sample rate, got {}", spec.sample_rate);
    }

    // Validate bit depth (must be 16-bit PCM)
    if spec.bits_per_sample != 16 {
        anyhow::bail!(
            "Expected 16-bit PCM audio, got {} bits",
            spec.bits_per_sample
        );
    }

    // Read samples as i16
    let samples_i16: Vec<i16> = reader.samples::<i16>().filter_map(Result::ok).collect();

    // Convert i16 PCM to f32 audio samples
    let mut samples_f32 = vec![0.0f32; samples_i16.len()];
    whisper_rs::convert_integer_to_float_audio(&samples_i16, &mut samples_f32)
        .context("Failed to convert PCM samples")?;

    // Convert stereo to mono if needed (whisper requires mono)
    let samples_mono = if spec.channels == 2 {
        // Stereo: convert to mono (output will be half the size)
        let mut mono_samples = vec![0.0f32; samples_f32.len() / 2];
        whisper_rs::convert_stereo_to_mono_audio(&samples_f32, &mut mono_samples)
            .context("Failed to convert stereo to mono")?;
        mono_samples
    } else if spec.channels == 1 {
        samples_f32 // Already mono, use as-is
    } else {
        anyhow::bail!(
            "Unsupported channel count: {}. Only mono (1) and stereo (2) are supported.",
            spec.channels
        );
    };

    // --- 2️⃣ Load Whisper model ---
    let ctx = WhisperContext::new_with_params(
        model_path.to_str().context("Invalid model path")?,
        WhisperContextParameters::default(),
    )
    .context("Failed to load Whisper model")?;

    // --- 3️⃣ Create state (once) ---
    let mut state = ctx
        .create_state()
        .context("Failed to create Whisper state")?;

    // --- 4️⃣ Configure decoding ---
    // Create default settings if none provided
    let default_settings = TranscriptionSettings {
        preset: "balanced".to_string(),
        sampling_strategy: SamplingStrategyConfig {
            strategy_type: "greedy".to_string(),
            best_of: Some(5),
            beam_size: None,
            patience: None,
        },
        temperature: 0.0,
        thread_count: Some("auto".to_string()),
        no_context: true,
        initial_prompt: None,
        max_text_context: None,
        entropy_threshold: None,
        no_speech_threshold: None,
    };
    let config = settings.unwrap_or(default_settings);

    // Apply sampling strategy
    let mut params = match config.sampling_strategy.strategy_type.as_str() {
        "beam_search" => {
            let beam_size = config.sampling_strategy.beam_size.unwrap_or(5);
            let patience = config.sampling_strategy.patience.unwrap_or(-1.0);
            println!("🔍 [Whisper] Using BeamSearch strategy with beam_size: {}, patience: {}", beam_size, patience);
            FullParams::new(SamplingStrategy::BeamSearch {
                beam_size,
                patience,
            })
        }
        _ => {
            let best_of = config.sampling_strategy.best_of.unwrap_or(5);
            println!("🔍 [Whisper] Using Greedy strategy with best_of: {}", best_of);
            FullParams::new(SamplingStrategy::Greedy { best_of })
        }
    };

    // Set language: "auto" for detection or "en" for English
    let language_code = if auto_detect_language { "auto" } else { "en" };
    params.set_language(Some(language_code));

    // Performance: Use all available CPU cores for faster transcription
    // Default is min(4, hardware_concurrency) - we override to use all cores
    let num_threads = num_cpus::get() as i32;
    params.set_n_threads(num_threads);

    // Silent mode for production (no console output)
    params.set_print_progress(false);
    params.set_print_special(false);
    params.set_print_realtime(false);
    params.set_print_timestamps(false);

    // Apply user-configurable settings
    println!("🔍 [Whisper] Temperature: {}", config.temperature);
    println!("🔍 [Whisper] No Context: {}", config.no_context);
    params.set_temperature(config.temperature);
    params.set_no_context(config.no_context);

    // Set initial prompt if provided
    if let Some(prompt) = &config.initial_prompt {
        if !prompt.is_empty() {
            println!("🔍 [Whisper] Initial Prompt: '{}'", prompt);
            params.set_initial_prompt(prompt);
        }
    }

    // --- 5️⃣ Run transcription ---
    state
        .full(params, &samples_mono)
        .context("Transcription failed")?;

    // --- 6️⃣ Collect results ---
    let num_segments = state.full_n_segments();
    let mut segments = Vec::new();

    for i in 0..num_segments {
        if let Some(segment) = state.get_segment(i) {
            let start = segment.start_timestamp() as f64 / 100.0; // Convert to seconds
            let end = segment.end_timestamp() as f64 / 100.0;

            if let Ok(text_cow) = segment.to_str_lossy() {
                let text = text_cow.trim().to_string();
                if !text.is_empty() {
                    segments.push((start, end, text));
                }
            }
        }
    }

    // --- 7️⃣ Get detected language ---
    let detected_language = if auto_detect_language {
        // Retrieve the detected language ID from the state
        let lang_id = state.full_lang_id_from_state();
        // Convert language ID to language code (e.g., "en", "fr", "es")
        whisper_rs::get_lang_str(lang_id)
            .unwrap_or("unknown")
            .to_string()
    } else {
        language_code.to_string()
    };

    Ok((detected_language, segments))
}
