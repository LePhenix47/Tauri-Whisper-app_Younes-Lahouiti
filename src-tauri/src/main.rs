// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::path::PathBuf;
use tauri::AppHandle;

#[tauri::command]
fn hello_world() -> String {
    "Hello World from Rust".to_string()
}

#[tauri::command]
fn get_models_dir(app: AppHandle) -> Result<String, String> {
    let app_data_dir = app
        .path_resolver()
        .app_data_dir()
        .ok_or("Failed to get app data directory")?;

    let models_dir = app_data_dir.join("models");

    // Create the directory if it doesn't exist
    fs::create_dir_all(&models_dir).map_err(|e| e.to_string())?;

    Ok(models_dir.to_string_lossy().to_string())
}

#[tauri::command]
async fn download_model(app: AppHandle, model_name: String) -> Result<String, String> {
    let models_dir = get_models_dir(app)?;
    let models_path = PathBuf::from(&models_dir);
    let file_path = models_path.join(format!("ggml-{}.bin", model_name));

    // Check if already downloaded
    if file_path.exists() {
        return Ok(format!("Model {} already exists", model_name));
    }

    // Download from Hugging Face
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

    // Save to file
    fs::write(&file_path, bytes).map_err(|e| format!("Failed to save file: {}", e))?;

    Ok(format!("Successfully downloaded {}", model_name))
}

#[tauri::command]
fn test_whisper(app: AppHandle, model_name: String) -> Result<String, String> {
    use whisper_rs::{WhisperContext, WhisperContextParameters};

    // Get the model path
    let models_dir = get_models_dir(app)?;
    let model_path = PathBuf::from(&models_dir).join(format!("ggml-{}.bin", model_name));

    // Check if model exists
    if !model_path.exists() {
        return Err(format!(
            "Model '{}' not found. Please download it first.",
            model_name
        ));
    }

    // Try to load the model
    match WhisperContext::new_with_params(
        model_path.to_str().unwrap(),
        WhisperContextParameters::default(),
    ) {
        Ok(_ctx) => Ok(format!(
            "✅ Success! Model '{}' loaded correctly and is ready to use!",
            model_name
        )),
        Err(e) => Err(format!("❌ Failed to load model '{}': {}", model_name, e)),
    }
}

#[tauri::command]
async fn transcribe_file(
    app: AppHandle,
    file_path: String,
    model_name: Option<String>,
) -> Result<String, String> {
    use whisper_rs::{WhisperContext, WhisperContextParameters, FullParams, SamplingStrategy};

    // Use default model if none specified
    let model = model_name.unwrap_or_else(|| "base".to_string());

    // Get the model path
    let models_dir = get_models_dir(app)?;
    let model_path = PathBuf::from(&models_dir).join(format!("ggml-{}.bin", model));

    // Check if model exists
    if !model_path.exists() {
        return Err(format!(
            "Model '{}' not found. Please download it first.",
            model
        ));
    }

    // Check if file exists
    let audio_path = PathBuf::from(&file_path);
    if !audio_path.exists() {
        return Err(format!("File not found: {}", file_path));
    }

    // TODO: Implement actual transcription
    // For now, return placeholder response
    Ok(format!(
        "Transcription started for: {}\nUsing model: {}\n(Implementation pending)",
        audio_path.display(),
        model
    ))
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            hello_world,
            test_whisper,
            get_models_dir,
            download_model,
            transcribe_file,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
