// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, Emitter, Manager};
use whisper_rs::{WhisperContext, WhisperContextParameters};
use once_cell::sync::Lazy;

mod whisper_rs_imp; // tells Rust to load src/whisper_rs_imp/mod.rs
mod vosk_live_transcriber; // Vosk real-time transcription

use whisper_rs_imp::transcriber::{transcribe_single_pass, TranscriptionSettings};
use whisper_rs_imp::live_transcriber::{
    transcribe_live_chunk, LiveTranscriptionContext, LiveTranscriptionResult,
};
use vosk_live_transcriber::{
    VoskSessionManager, VoskTranscriptionResult,
};

// Global context manager for live transcription (Whisper)
static LIVE_CONTEXT: Lazy<Arc<Mutex<LiveTranscriptionContext>>> =
    Lazy::new(|| Arc::new(Mutex::new(LiveTranscriptionContext::new())));

// Global session manager for Vosk
static VOSK_SESSION_MANAGER: Lazy<Arc<Mutex<VoskSessionManager>>> =
    Lazy::new(|| Arc::new(Mutex::new(VoskSessionManager::new())));

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
// LIVE TRANSCRIPTION COMMANDS - VOSK (SESSION-BASED)
// ============================================================================

/// Start a new Vosk live transcription session
/// Returns session ID to use in subsequent chunk calls
#[tauri::command]
async fn start_vosk_session(
    app: AppHandle,
    model_name: String,
    sample_rate: f32,
) -> Result<String, String> {
    let models_dir = get_models_dir_internal(&app).map_err(|e| format!("{:#}", e))?;
    let model_path = models_dir.join(&model_name);

    if !model_path.exists() {
        return Err(format!("Vosk model '{}' not found. Please download it first.", model_name));
    }

    // Create session in blocking task
    let session_id = tokio::task::spawn_blocking(move || {
        let mut manager = VOSK_SESSION_MANAGER.lock()
            .map_err(|e| anyhow::anyhow!("Failed to lock session manager: {}", e))?;

        manager.start_session(&model_path, sample_rate)
    })
    .await
    .map_err(|e| format!("Failed to spawn task: {}", e))?
    .map_err(|e| format!("Failed to start Vosk session: {:#}", e))?;

    Ok(session_id)
}

/// Process audio chunk in existing Vosk session
/// Returns transcription result (partial or final)
#[tauri::command]
async fn process_vosk_chunk(
    session_id: String,
    pcm_audio: Vec<i16>,
) -> Result<VoskTranscriptionResult, String> {
    // Process chunk in blocking task
    let result = tokio::task::spawn_blocking(move || {
        let mut manager = VOSK_SESSION_MANAGER.lock()
            .map_err(|e| anyhow::anyhow!("Failed to lock session manager: {}", e))?;

        manager.process_chunk(&session_id, &pcm_audio)
    })
    .await
    .map_err(|e| format!("Failed to spawn task: {}", e))?
    .map_err(|e| format!("Vosk chunk processing failed: {:#}", e))?;

    Ok(result)
}

/// End Vosk session and get final transcription
#[tauri::command]
async fn end_vosk_session(
    session_id: String,
) -> Result<String, String> {
    // End session in blocking task
    let final_text = tokio::task::spawn_blocking(move || {
        let mut manager = VOSK_SESSION_MANAGER.lock()
            .map_err(|e| anyhow::anyhow!("Failed to lock session manager: {}", e))?;

        manager.end_session(&session_id)
    })
    .await
    .map_err(|e| format!("Failed to spawn task: {}", e))?
    .map_err(|e| format!("Failed to end Vosk session: {:#}", e))?;

    Ok(final_text)
}

// ============================================================================
// LIVE TRANSCRIPTION COMMANDS - WHISPER (LEGACY)
// ============================================================================

/// Whisper live transcription (SLOW, high-quality)
#[tauri::command]
async fn transcribe_audio_chunk(
    app: AppHandle,
    audio_data: Vec<u8>,
    model_name: Option<String>,
) -> Result<LiveTranscriptionResult, String> {
    let model = model_name.unwrap_or_else(|| "tiny".to_string());

    // Get model path
    let models_dir = get_models_dir_internal(&app).map_err(|e| format!("{:#}", e))?;
    let model_path = models_dir.join(format!("ggml-{}.bin", model));

    if !model_path.exists() {
        return Err(format!("Model '{}' not found. Please download it first.", model));
    }

    // Run transcription in blocking task
    let result = tokio::task::spawn_blocking(move || {
        transcribe_live_chunk(&audio_data, &LIVE_CONTEXT, &model_path)
    })
    .await
    .map_err(|e| format!("Failed to spawn task: {}", e))?
    .map_err(|e| format!("Transcription failed: {:#}", e))?;

    Ok(result)
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
    settings: Option<TranscriptionSettings>,
) -> Result<TranscriptionResult, String> {
    let result = transcribe_file_advanced_impl(
        app,
        file_path,
        model_name,
        detect_language.unwrap_or(true),
        settings,
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
    settings: Option<TranscriptionSettings>,
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
        .path()
        .app_data_dir()
        .context("Failed to get app data directory")?;
    fs::create_dir_all(&temp_dir).context("Failed to create temp directory")?;
    let temp_wav = temp_dir.join("temp_audio.wav");

    // Step 1: Convert audio to 16kHz mono WAV
    app.emit(
        "transcription-progress",
        TranscriptionProgress::Converting {
            message: "Converting audio to WAV format...".to_string(),
        },
    )
    .ok();

    let _duration = convert_audio_with_ffmpeg(&audio_path, &temp_wav)?;

    // Step 2: Run single-pass transcription
    app.emit(
        "transcription-progress",
        TranscriptionProgress::Transcribing { progress: 50 },
    )
    .ok();

    let (language, segments) = tokio::task::spawn_blocking({
        let model_path = model_path.clone();
        let temp_wav = temp_wav.clone();
        move || transcribe_single_pass(&model_path, &temp_wav, auto_detect_language, settings)
    })
    .await
    .context("Failed to spawn blocking Whisper task")??;

    // Emit language detection result
    app.emit(
        "transcription-progress",
        TranscriptionProgress::LanguageDetected {
            language: language.clone(),
        },
    )
    .ok();

    // Step 3: Format results
    app.emit(
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

    app.emit(
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
// VOSK MODEL MANAGEMENT
// ============================================================================

#[tauri::command]
async fn download_vosk_model(app: AppHandle, model_name: String) -> Result<String, String> {
    let models_dir = get_models_dir_internal(&app).map_err(|e| format!("{:#}", e))?;
    let model_dir = models_dir.join(&model_name);

    if model_dir.exists() {
        return Ok(format!("Vosk model '{}' already exists", model_name));
    }

    // Download ZIP from alphacephei.com/vosk/models
    let url = format!("https://alphacephei.com/vosk/models/{}.zip", model_name);

    println!("📥 Downloading Vosk model from: {}", url);

    let response = reqwest::get(&url)
        .await
        .map_err(|e| format!("Failed to download Vosk model: {}", e))?;

    let bytes = response
        .bytes()
        .await
        .map_err(|e| format!("Failed to read response: {}", e))?;

    // Save ZIP to temp file
    let temp_zip = models_dir.join(format!("{}.zip", model_name));
    fs::write(&temp_zip, bytes).map_err(|e| format!("Failed to save ZIP: {}", e))?;

    // Extract ZIP
    println!("📦 Extracting Vosk model...");
    let file = fs::File::open(&temp_zip).map_err(|e| format!("Failed to open ZIP: {}", e))?;
    let mut archive = zip::ZipArchive::new(file).map_err(|e| format!("Failed to read ZIP: {}", e))?;

    archive
        .extract(&models_dir)
        .map_err(|e| format!("Failed to extract ZIP: {}", e))?;

    // Clean up ZIP file
    let _ = fs::remove_file(&temp_zip);

    println!("✅ Vosk model '{}' downloaded successfully", model_name);
    Ok(format!("Successfully downloaded Vosk model '{}'", model_name))
}

#[tauri::command]
fn list_vosk_models(app: AppHandle) -> Result<Vec<String>, String> {
    let models_dir = get_models_dir_internal(&app).map_err(|e| format!("{:#}", e))?;

    let entries =
        fs::read_dir(&models_dir).map_err(|e| format!("Failed to read models directory: {}", e))?;

    let mut models = Vec::new();
    for entry in entries {
        if let Ok(entry) = entry {
            let path = entry.path();
            if path.is_dir() {
                if let Some(filename) = path.file_name() {
                    if let Some(name) = filename.to_str() {
                        // Only include directories starting with "vosk-model-"
                        if name.starts_with("vosk-model-") {
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

// ============================================================================
// EXISTING COMMANDS (kept for compatibility)
// ============================================================================

#[tauri::command]
fn hello_world() -> String {
    "Hello World from Rust".to_string()
}

fn get_models_dir_internal(app: &AppHandle) -> Result<PathBuf> {
    let app_data_dir = app
        .path()
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

    let entries =
        fs::read_dir(&models_dir).map_err(|e| format!("Failed to read models directory: {}", e))?;

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
    match transcribe_file_advanced(app, file_path, model_name, Some(true), None).await {
        Ok(result) => Ok(result.text),
        Err(e) => Err(e),
    }
}
// ============================================================================
// MAIN
// ============================================================================

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            hello_world,
            test_whisper,
            get_models_dir,
            download_model,
            list_downloaded_models,
            download_vosk_model,
            list_vosk_models,
            transcribe_file,
            transcribe_file_advanced,
            transcribe_audio_chunk,
            start_vosk_session,
            process_vosk_chunk,
            end_vosk_session,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
