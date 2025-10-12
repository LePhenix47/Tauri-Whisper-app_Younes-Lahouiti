use anyhow::{Context, Result};
use std::path::Path;
use whisper_rs::{FullParams, SamplingStrategy, WhisperContext, WhisperContextParameters};

/// Transcribe a single WAV audio file using whisper_rs.
///
/// Requirements:
/// - WAV must be 16kHz, mono, 16-bit PCM.
/// - Model must be a `ggml-*.bin` file.
///
/// Returns: (language, segments) where segments = Vec<(start_time, end_time, text)>
///
/// This function follows the whisper_rs example closely for maximum CPU efficiency.
pub fn transcribe_single_pass(
    model_path: &Path,
    wav_path: &Path,
) -> Result<(String, Vec<(f64, f64, String)>)> {
    // --- 1️⃣ Load audio ---
    let mut reader = hound::WavReader::open(wav_path).context("Failed to open WAV file")?;
    let spec = reader.spec();
    if spec.channels != 1 {
        anyhow::bail!("Expected mono (1 channel) WAV file, got {}", spec.channels);
    }
    if spec.sample_rate != 16_000 {
        anyhow::bail!("Expected 16kHz sample rate, got {}", spec.sample_rate);
    }
    if spec.bits_per_sample != 16 {
        anyhow::bail!(
            "Expected 16-bit PCM audio, got {} bits",
            spec.bits_per_sample
        );
    }

    let samples_i16: Vec<i16> = reader.samples::<i16>().filter_map(Result::ok).collect();
    let mut samples_f32 = vec![0.0f32; samples_i16.len()];

    whisper_rs::convert_integer_to_float_audio(&samples_i16, &mut samples_f32)
        .context("Failed to convert PCM samples")?;

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
    let mut params = FullParams::new(SamplingStrategy::BeamSearch {
        beam_size: 5,
        patience: -1.0,
    });

    params.set_language(Some("auto")); // auto-detect language
    params.set_print_progress(false); // Silent mode for production
    params.set_print_special(false);
    params.set_print_realtime(false);
    params.set_print_timestamps(false);
    params.set_temperature(0.0);
    params.set_no_context(true);

    // --- 5️⃣ Run transcription ---
    state
        .full(params, &samples_f32)
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

    // Language detection (fallback to "en" if not available)
    let language = "en".to_string(); // whisper_rs doesn't expose detected language easily

    Ok((language, segments))
}
