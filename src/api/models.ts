import { invoke } from "@tauri-apps/api/core";

export type ModelName = "tiny" | "base" | "small" | "medium" | "large-v3-turbo";

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
