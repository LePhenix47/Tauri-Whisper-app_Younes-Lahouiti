import { invoke } from "@tauri-apps/api/core";

export interface VoskTranscriptionResult {
  text: string;
  is_partial: boolean;
}

/**
 * Start a new Vosk live transcription session
 * @param modelName - Vosk model name (e.g., "vosk-model-small-en-us-0.15")
 * @param sampleRate - Audio sample rate (typically 16000 Hz)
 * @returns Session ID for use in subsequent chunk calls
 */
export async function startVoskSession(
  modelName: string,
  sampleRate: number
): Promise<string> {
  return invoke<string>("start_vosk_session", { modelName, sampleRate });
}

/**
 * Process audio chunk in existing Vosk session
 * @param sessionId - Session ID from startVoskSession()
 * @param pcmAudio - PCM audio samples (signed 16-bit, mono)
 * @returns Transcription result (partial or final)
 */
export async function processVoskChunk(
  sessionId: string,
  pcmAudio: number[]
): Promise<VoskTranscriptionResult> {
  return invoke<VoskTranscriptionResult>("process_vosk_chunk", {
    sessionId,
    pcmAudio,
  });
}

/**
 * End Vosk session and get final transcription
 * @param sessionId - Session ID from startVoskSession()
 * @returns Final transcription text
 */
export async function endVoskSession(sessionId: string): Promise<string> {
  return invoke<string>("end_vosk_session", { sessionId });
}
