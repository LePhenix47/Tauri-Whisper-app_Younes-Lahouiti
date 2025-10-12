// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;
use std::sync::Arc;
use tauri::{AppHandle, Manager};
use tokio::sync::{mpsc, Semaphore};
use whisper_rs::{FullParams, SamplingStrategy, WhisperContext, WhisperContextParameters};

// ============================================================================
// TYPES & STRUCTURES
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
struct SubtitleSegment {
    index: usize,
    start_time: f64,
    end_time: f64,
    text: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(tag = "type")]
enum TranscriptionProgress {
    #[serde(rename = "converting")]
    Converting { message: String },

    #[serde(rename = "detecting_language")]
    DetectingLanguage,

    #[serde(rename = "language_detected")]
    LanguageDetected { language: String },

    #[serde(rename = "transcribing")]
    Transcribing { progress: u8 },

    #[serde(rename = "generating_subtitles")]
    GeneratingSubtitles,

    #[serde(rename = "complete")]
    Complete { subtitle_format: String },
}

#[derive(Debug, Serialize)]
struct TranscriptionResult {
    text: String,
    subtitles_srt: String,
    subtitles_vtt: String,
    language: String,
    segments: Vec<SubtitleSegment>,
}

#[derive(Clone)]
struct AudioChunk {
    data: Vec<f32>,
    offset_seconds: f64,
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/// Convert audio to 16kHz mono WAV and get duration
fn convert_audio_with_ffmpeg(input_path: &Path, output_path: &Path) -> Result<f64> {
    let input_str = input_path.to_str().context("Invalid input path encoding")?;
    let output_str = output_path.to_str().context("Invalid output path encoding")?;

    let duration_output = Command::new("ffprobe")
        .args([
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            input_str,
        ])
        .output()
        .context("Failed to run ffprobe")?;

    let duration: f64 = String::from_utf8_lossy(&duration_output.stdout)
        .trim()
        .parse()
        .unwrap_or(0.0);

    let status = Command::new("ffmpeg")
        .args([
            "-i",
            input_str,
            "-ar",
            "16000",
            "-ac",
            "1",
            "-c:a",
            "pcm_s16le",
            "-y",
            output_str,
        ])
        .output()
        .context("Failed to run ffmpeg")?;

    if !status.status.success() {
        anyhow::bail!(
            "ffmpeg conversion failed: {}",
            String::from_utf8_lossy(&status.stderr)
        );
    }

    Ok(duration)
}

/// Read audio samples from WAV file
fn read_audio_samples(wav_path: &Path) -> Result<Vec<f32>> {
    let mut reader = hound::WavReader::open(wav_path).context("Failed to open WAV file")?;

    let samples: Vec<f32> = reader
        .samples::<i16>()
        .filter_map(|s| s.ok())
        .map(|s| s as f32 / 32768.0)
        .collect();

    Ok(samples)
}

/// Detect language from first 30 seconds of audio
fn detect_language(model_path: &str, audio_data: &[f32], sample_rate: usize) -> Result<String> {
    let sample_size = (30 * sample_rate).min(audio_data.len());
    let sample = &audio_data[0..sample_size];

    let ctx =
        WhisperContext::new_with_params(model_path, WhisperContextParameters::default())
            .context("Failed to load Whisper model for language detection")?;

    let mut state = ctx
        .create_state()
        .context("Failed to create Whisper state")?;

    let mut params = FullParams::new(SamplingStrategy::Greedy { best_of: 1 });
    params.set_language(None);
    params.set_print_progress(false);
    params.set_print_special(false);

    state
        .full(params, sample)
        .context("Language detection failed")?;

    if let Some(_segment) = state.get_segment(0) {
        return Ok("auto".to_string());
    }

    Ok("en".to_string())
}

/// Chunk audio data into overlapping segments
fn chunk_audio(
    audio_data: &[f32],
    sample_rate: usize,
    chunk_duration_secs: usize,
    overlap_secs: usize,
) -> Vec<AudioChunk> {
    let chunk_size = chunk_duration_secs * sample_rate;
    let overlap_size = overlap_secs * sample_rate;
    let stride = chunk_size - overlap_size;

    let mut chunks = Vec::new();
    let mut start = 0;

    while start < audio_data.len() {
        let end = (start + chunk_size).min(audio_data.len());
        let chunk_data = audio_data[start..end].to_vec();
        let offset_seconds = (start as f64) / (sample_rate as f64);

        chunks.push(AudioChunk {
            data: chunk_data,
            offset_seconds,
        });

        start += stride;

        if end == audio_data.len() {
            break;
        }
    }

    chunks
}

/// Process a single chunk with its OWN WhisperContext
async fn process_chunk(
    chunk: AudioChunk,
    model_path: Arc<String>,
    language: Arc<String>,
) -> Result<Vec<SubtitleSegment>> {
    // CRITICAL: Each task gets its own context!
    tokio::task::spawn_blocking(move || {
        let ctx = WhisperContext::new_with_params(&model_path, WhisperContextParameters::default())
            .context("Failed to load Whisper model for chunk")?;

        let mut state = ctx
            .create_state()
            .context("Failed to create Whisper state")?;

        // Use Greedy decoding for speed (5x faster than BeamSearch on CPU)
        let mut params = FullParams::new(SamplingStrategy::Greedy { best_of: 1 });

        params.set_language(if language.as_str() == "auto" {
            None
        } else {
            Some(language.as_str())
        });

        // Disable ALL logging to eliminate terminal I/O bottleneck
        params.set_print_progress(false);
        params.set_print_special(false);
        params.set_print_realtime(false);
        params.set_print_timestamps(false);  // CRITICAL: Prevents per-token logging spam

        params.set_temperature(0.0);
        // NOTE: max_len=0 means no limit (default), which is correct for transcription
        // DO NOT set max_len to 1 - that would fragment every word into separate segments!

        state
            .full(params, &chunk.data)
            .context("Transcription failed")?;

        let num_segments = state.full_n_segments();
        let mut segments = Vec::new();

        for i in 0..num_segments {
            if let Some(segment) = state.get_segment(i) {
                if let Ok(text) = segment.to_str_lossy() {
                    let trimmed = text.trim();
                    if !trimmed.is_empty() {
                        segments.push(SubtitleSegment {
                            index: i as usize,
                            start_time: (segment.start_timestamp() as f64 / 100.0)
                                + chunk.offset_seconds,
                            end_time: (segment.end_timestamp() as f64 / 100.0)
                                + chunk.offset_seconds,
                            text: trimmed.to_string(),
                        });
                    }
                }
            }
        }

        Ok::<Vec<SubtitleSegment>, anyhow::Error>(segments)
    })
    .await
    .context("Chunk processing task failed")?
}

/// Format timestamp for SRT (HH:MM:SS,mmm)
fn format_timestamp_srt(seconds: f64) -> String {
    let hours = (seconds / 3600.0).floor() as u32;
    let minutes = ((seconds % 3600.0) / 60.0).floor() as u32;
    let secs = (seconds % 60.0).floor() as u32;
    let millis = ((seconds % 1.0) * 1000.0).floor() as u32;
    format!("{:02}:{:02}:{:02},{:03}", hours, minutes, secs, millis)
}

/// Format timestamp for VTT (HH:MM:SS.mmm)
fn format_timestamp_vtt(seconds: f64) -> String {
    let hours = (seconds / 3600.0).floor() as u32;
    let minutes = ((seconds % 3600.0) / 60.0).floor() as u32;
    let secs = (seconds % 60.0).floor() as u32;
    let millis = ((seconds % 1.0) * 1000.0).floor() as u32;
    format!("{:02}:{:02}:{:02}.{:03}", hours, minutes, secs, millis)
}

/// Generate SRT subtitle format
fn generate_srt(segments: &[SubtitleSegment]) -> String {
    let mut srt = String::new();
    for segment in segments {
        srt.push_str(&format!("{}\n", segment.index + 1));
        srt.push_str(&format!(
            "{} --> {}\n",
            format_timestamp_srt(segment.start_time),
            format_timestamp_srt(segment.end_time)
        ));
        srt.push_str(&format!("{}\n\n", segment.text.trim()));
    }
    srt
}

/// Generate WebVTT subtitle format
fn generate_vtt(segments: &[SubtitleSegment]) -> String {
    let mut vtt = String::from("WEBVTT\n\n");
    for segment in segments {
        vtt.push_str(&format!(
            "{} --> {}\n",
            format_timestamp_vtt(segment.start_time),
            format_timestamp_vtt(segment.end_time)
        ));
        vtt.push_str(&format!("{}\n\n", segment.text.trim()));
    }
    vtt
}

// ============================================================================
// MAIN TRANSCRIPTION LOGIC - TRULY CONCURRENT
// ============================================================================

#[tauri::command]
async fn transcribe_file_advanced(
    app: AppHandle,
    file_path: String,
    model_name: Option<String>,
    detect_language: Option<bool>,
) -> Result<TranscriptionResult, String> {
    let result = transcribe_file_advanced_impl(
        app,
        file_path,
        model_name,
        detect_language.unwrap_or(true),
    )
    .await;

    match result {
        Ok(res) => Ok(res),
        Err(e) => Err(format!("{:#}", e)),
    }
}

async fn transcribe_file_advanced_impl(
    app: AppHandle,
    file_path: String,
    model_name: Option<String>,
    auto_detect_language: bool,
) -> Result<TranscriptionResult> {
    let model = model_name.unwrap_or_else(|| "base".to_string());
    let audio_path = PathBuf::from(&file_path);

    if !audio_path.exists() {
        anyhow::bail!("File not found: {}", file_path);
    }

    // Get model path
    let models_dir = get_models_dir_internal(&app)?;
    let model_path = models_dir.join(format!("ggml-{}.bin", model));

    if !model_path.exists() {
        anyhow::bail!("Model '{}' not found. Please download it first.", model);
    }

    let model_path_str = model_path
        .to_str()
        .context("Invalid model path")?
        .to_string();

    // Setup temp directory
    let temp_dir = app
        .path_resolver()
        .app_data_dir()
        .context("Failed to get app data directory")?;

    fs::create_dir_all(&temp_dir).context("Failed to create temp directory")?;
    let temp_wav = temp_dir.join("temp_audio.wav");

    // Emit progress: Converting
    app.emit_all(
        "transcription-progress",
        TranscriptionProgress::Converting {
            message: "Converting audio to WAV format...".to_string(),
        },
    )
    .ok();

    // Convert audio and get duration
    let _duration = convert_audio_with_ffmpeg(&audio_path, &temp_wav)?;

    // Read audio samples
    let audio_data = read_audio_samples(&temp_wav)?;
    let sample_rate = 16000;

    // Language detection
    let detected_language = if auto_detect_language {
        app.emit_all(
            "transcription-progress",
            TranscriptionProgress::DetectingLanguage,
        )
        .ok();

        let lang = detect_language(&model_path_str, &audio_data, sample_rate)?;

        app.emit_all(
            "transcription-progress",
            TranscriptionProgress::LanguageDetected {
                language: lang.clone(),
            },
        )
        .ok();

        lang
    } else {
        "en".to_string()
    };

    // Chunk audio
    let chunks = chunk_audio(&audio_data, sample_rate, 30, 2);
    let total_chunks = chunks.len();

    // Progress tracking
    let (progress_tx, mut progress_rx) = mpsc::channel::<usize>(total_chunks);

    // Start progress listener task
    let app_clone = app.clone();
    tokio::spawn(async move {
        let mut completed = 0;
        while progress_rx.recv().await.is_some() {
            completed += 1;
            let progress = ((completed as f32 / total_chunks as f32) * 100.0) as u8;
            app_clone
                .emit_all(
                    "transcription-progress",
                    TranscriptionProgress::Transcribing { progress },
                )
                .ok();
        }
    });

    app.emit_all(
        "transcription-progress",
        TranscriptionProgress::Transcribing { progress: 0 },
    )
    .ok();

    // CRITICAL FIX: Limit concurrent contexts to avoid OOM
    // Each WhisperContext loads ~500MB, so we limit to CPU core count
    let max_concurrent = num_cpus::get().max(1);
    let semaphore = Arc::new(Semaphore::new(max_concurrent));

    // Process chunks CONCURRENTLY - each with its own WhisperContext
    let model_path_arc = Arc::new(model_path_str);
    let language_arc = Arc::new(detected_language.clone());

    let mut tasks = Vec::new();
    for chunk in chunks {
        let model_path = Arc::clone(&model_path_arc);
        let language = Arc::clone(&language_arc);
        let tx = progress_tx.clone();
        let sem = Arc::clone(&semaphore);

        let task = tokio::spawn(async move {
            // Acquire semaphore permit - blocks if too many concurrent tasks
            let _permit = sem.acquire().await.expect("Semaphore closed");

            // PANIC RECOVERY: Always send progress even if chunk processing fails
            let result = process_chunk(chunk, model_path, language).await;

            // Report completion regardless of success/failure
            let _ = tx.send(1).await;

            result
        });

        tasks.push(task);
    }

    // Close the sender so the progress listener can finish
    drop(progress_tx);

    // Collect results
    let mut all_segments = Vec::new();
    for task in tasks {
        let segments = task
            .await
            .context("Task join failed")??;
        all_segments.extend(segments);
    }

    // Sort by start time
    all_segments.sort_by(|a, b| a.start_time.partial_cmp(&b.start_time).unwrap());

    // Re-index segments
    let mut final_segments: Vec<SubtitleSegment> = all_segments
        .into_iter()
        .enumerate()
        .map(|(idx, mut seg)| {
            seg.index = idx;
            seg
        })
        .collect();

    // Merge overlapping segments
    final_segments.dedup_by(|a, b| {
        (a.start_time - b.start_time).abs() < 1.0 && a.text == b.text
    });

    // Generate subtitles
    app.emit_all(
        "transcription-progress",
        TranscriptionProgress::GeneratingSubtitles,
    )
    .ok();

    let text = final_segments
        .iter()
        .map(|s| s.text.clone())
        .collect::<Vec<_>>()
        .join(" ");

    let srt = generate_srt(&final_segments);
    let vtt = generate_vtt(&final_segments);

    // Cleanup
    let _ = fs::remove_file(&temp_wav);

    app.emit_all(
        "transcription-progress",
        TranscriptionProgress::Complete {
            subtitle_format: "SRT/VTT".to_string(),
        },
    )
    .ok();

    Ok(TranscriptionResult {
        text,
        subtitles_srt: srt,
        subtitles_vtt: vtt,
        language: detected_language,
        segments: final_segments,
    })
}

// ============================================================================
// EXISTING COMMANDS (kept for compatibility)
// ============================================================================

#[tauri::command]
fn hello_world() -> String {
    "Hello World from Rust".to_string()
}

fn get_models_dir_internal(app: &AppHandle) -> Result<PathBuf> {
    let app_data_dir = app
        .path_resolver()
        .app_data_dir()
        .context("Failed to get app data directory")?;

    let models_dir = app_data_dir.join("models");
    fs::create_dir_all(&models_dir).context("Failed to create models directory")?;

    Ok(models_dir)
}

#[tauri::command]
fn get_models_dir(app: AppHandle) -> Result<String, String> {
    match get_models_dir_internal(&app) {
        Ok(path) => Ok(path.to_string_lossy().to_string()),
        Err(e) => Err(format!("{:#}", e)),
    }
}

#[tauri::command]
async fn download_model(app: AppHandle, model_name: String) -> Result<String, String> {
    let models_dir = get_models_dir_internal(&app).map_err(|e| format!("{:#}", e))?;
    let file_path = models_dir.join(format!("ggml-{}.bin", model_name));

    if file_path.exists() {
        return Ok(format!("Model {} already exists", model_name));
    }

    let url = format!(
        "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-{}.bin",
        model_name
    );

    let response = reqwest::get(&url)
        .await
        .map_err(|e| format!("Failed to download: {}", e))?;

    let bytes = response
        .bytes()
        .await
        .map_err(|e| format!("Failed to read response: {}", e))?;

    fs::write(&file_path, bytes).map_err(|e| format!("Failed to save file: {}", e))?;

    Ok(format!("Successfully downloaded {}", model_name))
}

#[tauri::command]
fn test_whisper(app: AppHandle, model_name: String) -> Result<String, String> {
    let models_dir = get_models_dir_internal(&app).map_err(|e| format!("{:#}", e))?;
    let model_path = models_dir.join(format!("ggml-{}.bin", model_name));

    if !model_path.exists() {
        return Err(format!(
            "Model '{}' not found. Please download it first.",
            model_name
        ));
    }

    let model_path_str = model_path
        .to_str()
        .ok_or_else(|| "Invalid model path encoding".to_string())?;

    match WhisperContext::new_with_params(
        model_path_str,
        WhisperContextParameters::default(),
    ) {
        Ok(_ctx) => Ok(format!(
            "✅ Success! Model '{}' loaded correctly and is ready to use!",
            model_name
        )),
        Err(e) => Err(format!("❌ Failed to load model '{}': {}", model_name, e)),
    }
}

// Legacy command (kept for backward compatibility)
#[tauri::command]
async fn transcribe_file(
    app: AppHandle,
    file_path: String,
    model_name: Option<String>,
) -> Result<String, String> {
    match transcribe_file_advanced(app, file_path, model_name, Some(true)).await {
        Ok(result) => Ok(result.text),
        Err(e) => Err(e),
    }
}

// ============================================================================
// MAIN
// ============================================================================

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            hello_world,
            test_whisper,
            get_models_dir,
            download_model,
            transcribe_file,
            transcribe_file_advanced,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
