#![cfg(any(target_os = "windows", target_os = "linux"))]

use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::Arc;
use vosk::{Model, Recognizer};

/// Result of Vosk real-time transcription
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VoskTranscriptionResult {
    pub text: String,
    pub is_partial: bool,
}

/// Live Vosk session - maintains recognizer AND model state across audio chunks
/// Model and Recognizer must live together (recognizer borrows from model)
pub struct VoskLiveSession {
    model: Arc<Model>,       // Model must stay alive for recognizer
    recognizer: Recognizer,  // Recognizer borrows from model
    sample_rate: f32,
}

impl VoskLiveSession {
    /// Create new Vosk session with model and sample rate
    pub fn new(model_path: &PathBuf, sample_rate: f32) -> Result<Self> {
        println!("🔄 [Vosk] Creating session with model: {:?}", model_path);

        let model_path_str = model_path
            .to_str()
            .context("Invalid model path encoding")?;

        // Load model
        let model = Model::new(model_path_str)
            .ok_or_else(|| anyhow::anyhow!("Failed to load Vosk model from path: {}", model_path_str))?;

        let model_arc = Arc::new(model);

        // Create recognizer (borrows from model)
        // Safety: We keep model alive in the struct, so recognizer reference is valid
        let recognizer = unsafe {
            let model_ptr = Arc::as_ptr(&model_arc);
            let model_ref = &*model_ptr;
            Recognizer::new(model_ref, sample_rate)
                .ok_or_else(|| anyhow::anyhow!("Failed to create Vosk recognizer for sample rate: {}", sample_rate))?
        };

        println!("✅ [Vosk] Session created successfully");

        Ok(Self {
            model: model_arc,
            recognizer,
            sample_rate,
        })
    }

    /// Process audio chunk and return transcription result
    /// Follows vosk-rs example pattern: check speech detection, use result() or partial_result()
    pub fn process_chunk(&mut self, pcm_data: &[i16]) -> VoskTranscriptionResult {
        // Feed audio to recognizer
        // accept_waveform returns Result<DecodingState, AcceptWaveformError>
        // DecodingState::Finalized means speech segment ended
        match self.recognizer.accept_waveform(pcm_data) {
            Ok(vosk::DecodingState::Finalized) => {
                // Speech segment ended - get FINAL result
                let result = self.recognizer.result();
                if let Some(single) = result.single() {
                    let text = single.text.to_string();
                    println!("✅ [Vosk] Final: {}", text);
                    VoskTranscriptionResult {
                        text,
                        is_partial: false,
                    }
                } else {
                    VoskTranscriptionResult {
                        text: String::new(),
                        is_partial: false,
                    }
                }
            }
            Ok(vosk::DecodingState::Running) => {
                // Still speaking - get PARTIAL result
                let partial = self.recognizer.partial_result();
                let text = partial.partial.to_string();

                if !text.is_empty() {
                    println!("📝 [Vosk] Partial: {}", text);
                }

                VoskTranscriptionResult {
                    text,
                    is_partial: true,
                }
            }
            Ok(vosk::DecodingState::Failed) | Err(_) => {
                // Decoding failed or error - return empty partial
                println!("⚠️ [Vosk] Decoding failed or error");
                VoskTranscriptionResult {
                    text: String::new(),
                    is_partial: true,
                }
            }
        }
    }

    /// Finalize session and get final transcription
    /// Call this when recording is complete
    pub fn finalize(&mut self) -> String {
        println!("🔚 [Vosk] Finalizing session");
        let final_result = self.recognizer.final_result();

        if let Some(single) = final_result.single() {
            let text = single.text.to_string();
            println!("✅ [Vosk] Final result: {}", text);
            text
        } else {
            println!("⚠️ [Vosk] No final result");
            String::new()
        }
    }
}

/// Global session manager - maintains active Vosk sessions
pub struct VoskSessionManager {
    sessions: HashMap<String, VoskLiveSession>,
    next_id: u64,
}

impl VoskSessionManager {
    pub fn new() -> Self {
        Self {
            sessions: HashMap::new(),
            next_id: 1,
        }
    }

    /// Start new Vosk session
    pub fn start_session(&mut self, model_path: &PathBuf, sample_rate: f32) -> Result<String> {
        let session = VoskLiveSession::new(model_path, sample_rate)?;
        let session_id = format!("vosk-{}", self.next_id);
        self.next_id += 1;

        self.sessions.insert(session_id.clone(), session);
        println!("🎙️ [Vosk] Session started: {}", session_id);

        Ok(session_id)
    }

    /// Process chunk in existing session
    pub fn process_chunk(&mut self, session_id: &str, pcm_data: &[i16]) -> Result<VoskTranscriptionResult> {
        let session = self.sessions
            .get_mut(session_id)
            .ok_or_else(|| anyhow::anyhow!("Session not found: {}", session_id))?;

        Ok(session.process_chunk(pcm_data))
    }

    /// End session and get final result
    pub fn end_session(&mut self, session_id: &str) -> Result<String> {
        let mut session = self.sessions
            .remove(session_id)
            .ok_or_else(|| anyhow::anyhow!("Session not found: {}", session_id))?;

        let final_text = session.finalize();
        println!("🛑 [Vosk] Session ended: {}", session_id);

        Ok(final_text)
    }

    /// Get active session count
    pub fn active_sessions(&self) -> usize {
        self.sessions.len()
    }
}
