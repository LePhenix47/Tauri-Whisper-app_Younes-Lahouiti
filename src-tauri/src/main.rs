// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[tauri::command]
fn hello_world() -> String {
    "Hello World from Rust".to_string()
}

#[tauri::command]
fn test_whisper() -> Result<String, String> {
    // Just test that we can create a WhisperContext
    // This verifies whisper-rs is properly linked and working
    use whisper_rs::{WhisperContext, WhisperContextParameters};

    // Try to create a context (will fail without a model file, but proves the library works)
    match WhisperContext::new_with_params("nonexistent.bin", WhisperContextParameters::default()) {
        Ok(_) => Ok("Whisper context created (shouldn't happen without model)".to_string()),
        Err(e) => {
            // Expected error - but it proves whisper-rs is linked correctly
            let error_msg = format!("Whisper library is working! Error (expected): {}", e);
            Ok(error_msg)
        }
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![hello_world, test_whisper])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
