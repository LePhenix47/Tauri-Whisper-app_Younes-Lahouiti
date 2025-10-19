use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::io::Write;
use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use whisper_rs::{FullParams, SamplingStrategy, WhisperContext, WhisperContextParameters};

/// Result of a live transcription chunk
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LiveTranscriptionResult {
    pub text: String,
    pub language: String,
    pub segments: Vec<TranscriptionSegment>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TranscriptionSegment {
    pub start: f64,
    pub end: f64,
    pub text: String,
}

/// Global context manager for live transcription
/// Keeps the Whisper model loaded in memory for fast chunk processing
pub struct LiveTranscriptionContext {
    context: Option<WhisperContext>,
    model_path: Option<PathBuf>,
}

impl LiveTranscriptionContext {
    pub fn new() -> Self {
        Self {
            context: None,
            model_path: None,
        }
    }

    /// Load or reuse the Whisper context
    pub fn get_or_load(&mut self, model_path: &PathBuf) -> Result<&WhisperContext> {
        // If context exists and model path matches, reuse it
        if let Some(existing_path) = &self.model_path {
            if existing_path == model_path && self.context.is_some() {
                println!("🔄 [LiveTranscription] Reusing existing Whisper context");
                return Ok(self.context.as_ref().unwrap());
            }
        }

        // Load new context
        println!("🔄 [LiveTranscription] Loading Whisper model from: {:?}", model_path);
        let ctx = WhisperContext::new_with_params(
            model_path.to_str().context("Invalid model path")?,
            WhisperContextParameters::default(),
        )
        .context("Failed to load Whisper model")?;

        self.context = Some(ctx);
        self.model_path = Some(model_path.clone());

        Ok(self.context.as_ref().unwrap())
    }
}

/// Convert WebM/Opus audio bytes to WAV 16kHz mono
/// Uses ffmpeg to handle browser audio formats
pub fn convert_webm_to_wav(webm_data: &[u8], output_path: &PathBuf) -> Result<()> {
    use std::process::Command;

    // Create temp input file for WebM data
    let temp_dir = std::env::temp_dir();
    let input_path = temp_dir.join("live_chunk.webm");

    std::fs::write(&input_path, webm_data).context("Failed to write temp WebM file")?;

    // Run ffmpeg to convert WebM → WAV 16kHz mono
    println!("🎵 [LiveTranscription] Converting WebM to WAV 16kHz mono");

    let output = Command::new("ffmpeg")
        .args([
            "-y", // Overwrite output file
            "-i",
            input_path.to_str().unwrap(),
            "-ar",
            "16000", // Sample rate: 16kHz
            "-ac",
            "1", // Channels: mono
            "-c:a",
            "pcm_s16le", // Codec: 16-bit PCM
            output_path.to_str().unwrap(),
        ])
        .output()
        .context("Failed to run ffmpeg")?;

    // Clean up temp input file
    let _ = std::fs::remove_file(&input_path);

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        anyhow::bail!("FFmpeg conversion failed: {}", stderr);
    }

    println!("✅ [LiveTranscription] Audio conversion successful");
    Ok(())
}

/// Transcribe a live audio chunk (Stage 1: Chunked Processing)
///
/// This function:
/// 1. Converts WebM audio to WAV 16kHz mono
/// 2. Loads/reuses Whisper context (tiny model)
/// 3. Runs transcription with greedy sampling (best_of: 1 for speed)
/// 4. Returns transcription result
pub fn transcribe_live_chunk(
    webm_data: &[u8],
    context_manager: &Arc<Mutex<LiveTranscriptionContext>>,
    model_path: &PathBuf,
) -> Result<LiveTranscriptionResult> {
    let temp_dir = std::env::temp_dir();
    let wav_path = temp_dir.join("live_chunk.wav");

    // Step 1: Convert WebM to WAV
    convert_webm_to_wav(webm_data, &wav_path)?;

    // Step 2: Load WAV audio
    let mut reader = hound::WavReader::open(&wav_path).context("Failed to open WAV file")?;
    let spec = reader.spec();

    if spec.sample_rate != 16_000 {
        anyhow::bail!("Expected 16kHz sample rate, got {}", spec.sample_rate);
    }

    // Read samples as i16
    let samples_i16: Vec<i16> = reader.samples::<i16>().filter_map(Result::ok).collect();

    // Convert i16 PCM to f32 audio samples
    let mut samples_f32 = vec![0.0f32; samples_i16.len()];
    whisper_rs::convert_integer_to_float_audio(&samples_i16, &mut samples_f32)
        .context("Failed to convert PCM samples")?;

    // Convert stereo to mono if needed
    let samples_mono = if spec.channels == 2 {
        let mut mono_samples = vec![0.0f32; samples_f32.len() / 2];
        whisper_rs::convert_stereo_to_mono_audio(&samples_f32, &mut mono_samples)
            .context("Failed to convert stereo to mono")?;
        mono_samples
    } else {
        samples_f32
    };

    // Check if we have enough audio data (at least 0.5 seconds)
    let duration_seconds = samples_mono.len() as f64 / 16000.0;
    if duration_seconds < 0.5 {
        anyhow::bail!(
            "Audio chunk too short: {:.2}s (minimum 0.5s required)",
            duration_seconds
        );
    }

    println!(
        "🎤 [LiveTranscription] Processing {:.2}s of audio",
        duration_seconds
    );

    // Step 3: Get or load Whisper context
    let mut ctx_manager = context_manager
        .lock()
        .map_err(|e| anyhow::anyhow!("Failed to lock context: {}", e))?;
    let ctx = ctx_manager.get_or_load(model_path)?;

    // Step 4: Create state for this chunk
    let mut state = ctx.create_state().context("Failed to create Whisper state")?;

    // Step 5: Configure parameters for live transcription (FAST)
    let mut params = FullParams::new(SamplingStrategy::Greedy { best_of: 1 });

    // Auto-detect language
    params.set_language(Some("auto"));

    // Use all CPU cores
    let num_threads = num_cpus::get() as i32;
    params.set_n_threads(num_threads);

    // Silent mode (no console output)
    params.set_print_progress(false);
    params.set_print_special(false);
    params.set_print_realtime(false);
    params.set_print_timestamps(false);

    // Speed optimizations
    params.set_temperature(0.0); // Deterministic, faster
    params.set_no_context(true); // Don't use past text as context

    // Step 6: Run transcription
    state.full(params, &samples_mono).context("Transcription failed")?;

    // Step 7: Collect segments
    let num_segments = state.full_n_segments();
    let mut segments = Vec::new();
    let mut full_text = String::new();

    for i in 0..num_segments {
        if let Some(segment) = state.get_segment(i) {
            let start = segment.start_timestamp() as f64 / 100.0;
            let end = segment.end_timestamp() as f64 / 100.0;

            if let Ok(text_cow) = segment.to_str_lossy() {
                let text = text_cow.trim().to_string();
                if !text.is_empty() {
                    full_text.push_str(&text);
                    full_text.push(' ');
                    segments.push(TranscriptionSegment { start, end, text });
                }
            }
        }
    }

    // Step 8: Get detected language
    let lang_id = state.full_lang_id_from_state();
    let language = whisper_rs::get_lang_str(lang_id)
        .unwrap_or("unknown")
        .to_string();

    // Clean up temp WAV file
    let _ = std::fs::remove_file(&wav_path);

    println!(
        "✅ [LiveTranscription] Transcribed {} segments (language: {})",
        segments.len(),
        language
    );

    Ok(LiveTranscriptionResult {
        text: full_text.trim().to_string(),
        language,
        segments,
    })
}
