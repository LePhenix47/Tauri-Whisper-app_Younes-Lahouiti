import { invoke } from "@tauri-apps/api/core";
import type { WhisperModelName } from "@constants/whisper-models";

export type ModelName = WhisperModelName;

export async function downloadModel(modelName: ModelName): Promise<string> {
  return invoke<string>("download_model", { modelName });
}

export async function getModelsDir(): Promise<string> {
  return invoke<string>("get_models_dir");
}

export async function listDownloadedModels(): Promise<string[]> {
  return invoke<string[]>("list_downloaded_models");
}

export async function testWhisper(modelName: ModelName): Promise<string> {
  return invoke<string>("test_whisper", { modelName });
}

export async function helloWorld(): Promise<string> {
  return invoke<string>("hello_world");
}

/**
 * Download a Vosk model for live transcription
 * @param modelName - Full model name (e.g., "vosk-model-small-en-us-0.15")
 * @returns Success or error message
 */
export async function downloadVoskModel(modelName: string): Promise<string> {
  return invoke<string>("download_vosk_model", { modelName });
}

/**
 * List all downloaded Vosk models
 * @returns Array of Vosk model folder names
 */
export async function listVoskModels(): Promise<string[]> {
  return invoke<string[]>("list_vosk_models");
}
