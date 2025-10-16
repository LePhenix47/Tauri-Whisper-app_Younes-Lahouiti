// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;
use tauri::{AppHandle, Manager};
use whisper_rs::{WhisperContext, WhisperContextParameters};

mod whisper_rs_imp; // tells Rust to load src/whisper_rs_imp/mod.rs

use whisper_rs_imp::transcriber::transcribe_single_pass;

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

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/// Convert audio to 16kHz mono WAV and get duration
fn convert_audio_with_ffmpeg(input_path: &Path, output_path: &Path) -> Result<f64> {
    let input_str = input_path.to_str().context("Invalid input path encoding")?;
    let output_str = output_path
        .to_str()
        .context("Invalid output path encoding")?;

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
// MAIN TRANSCRIPTION LOGIC - SINGLE-PASS IMPLEMENTATION
// ============================================================================

#[tauri::command]
async fn transcribe_file_advanced(
    app: AppHandle,
    file_path: String,
    model_name: Option<String>,
    detect_language: Option<bool>,
) -> Result<TranscriptionResult, String> {
    let result =
        transcribe_file_advanced_impl(app, file_path, model_name, detect_language.unwrap_or(true))
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
    _auto_detect_language: bool,
) -> Result<TranscriptionResult> {
    let model = model_name.unwrap_or_else(|| "base".to_string());
    let audio_path = PathBuf::from(&file_path);

    if !audio_path.exists() {
        anyhow::bail!("File not found: {}", file_path);
    }

    let models_dir = get_models_dir_internal(&app)?;
    let model_path = models_dir.join(format!("ggml-{}.bin", model));
    if !model_path.exists() {
        anyhow::bail!("Model '{}' not found. Please download it first.", model);
    }

    let temp_dir = app
        .path_resolver()
        .app_data_dir()
        .context("Failed to get app data directory")?;
    fs::create_dir_all(&temp_dir).context("Failed to create temp directory")?;
    let temp_wav = temp_dir.join("temp_audio.wav");

    // Step 1: Convert audio to 16kHz mono WAV
    app.emit_all(
        "transcription-progress",
        TranscriptionProgress::Converting {
            message: "Converting audio to WAV format...".to_string(),
        },
    )
    .ok();

    let _duration = convert_audio_with_ffmpeg(&audio_path, &temp_wav)?;

    // Step 2: Run single-pass transcription
    app.emit_all(
        "transcription-progress",
        TranscriptionProgress::Transcribing { progress: 50 },
    )
    .ok();

    let (language, segments) = tokio::task::spawn_blocking({
        let model_path = model_path.clone();
        let temp_wav = temp_wav.clone();
        move || transcribe_single_pass(&model_path, &temp_wav)
    })
    .await
    .context("Failed to spawn blocking Whisper task")??;

    // Step 3: Format results
    app.emit_all(
        "transcription-progress",
        TranscriptionProgress::GeneratingSubtitles,
    )
    .ok();

    let final_segments: Vec<SubtitleSegment> = segments
        .iter()
        .enumerate()
        .map(|(idx, (start, end, text))| SubtitleSegment {
            index: idx,
            start_time: *start,
            end_time: *end,
            text: text.clone(),
        })
        .collect();

    let text = final_segments
        .iter()
        .map(|s| s.text.clone())
        .collect::<Vec<_>>()
        .join(" ");
    let srt = generate_srt(&final_segments);
    let vtt = generate_vtt(&final_segments);

    // Step 4: Cleanup
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
        language,
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
fn list_downloaded_models(app: AppHandle) -> Result<Vec<String>, String> {
    let models_dir = get_models_dir_internal(&app).map_err(|e| format!("{:#}", e))?;

    let entries = fs::read_dir(&models_dir)
        .map_err(|e| format!("Failed to read models directory: {}", e))?;

    let mut models = Vec::new();
    for entry in entries {
        if let Ok(entry) = entry {
            let path = entry.path();
            if path.is_file() {
                if let Some(filename) = path.file_name() {
                    if let Some(name) = filename.to_str() {
                        // Only include .bin files that match the ggml-*.bin pattern
                        if name.starts_with("ggml-") && name.ends_with(".bin") {
                            models.push(name.to_string());
                        }
                    }
                }
            }
        }
    }

    models.sort();
    Ok(models)
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

    match WhisperContext::new_with_params(model_path_str, WhisperContextParameters::default()) {
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
            list_downloaded_models,
            transcribe_file,
            transcribe_file_advanced,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
