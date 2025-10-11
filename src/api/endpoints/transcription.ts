import { invoke } from "@tauri-apps/api/tauri";
import { z } from "zod";

// Request schema
export const TranscribeRequestSchema = z.object({
  filePath: z.string().min(1, "File path is required"),
  modelName: z.string().optional(),
});

export type TranscribeRequest = z.infer<typeof TranscribeRequestSchema>;

// Response schema
export const TranscribeResponseSchema = z.string();

export type TranscribeResponse = z.infer<typeof TranscribeResponseSchema>;

/**
 * Transcribe an audio/video file using Whisper
 * @param filePath - Absolute path to the audio/video file
 * @param modelName - Whisper model name (defaults to "base" in Rust)
 * @returns Transcription result
 */
export async function transcribeFile(
  filePath: string,
  modelName?: string
): Promise<TranscribeResponse> {
  // Validate request
  const request = TranscribeRequestSchema.parse({
    filePath,
    modelName,
  });

  try {
    // Invoke Tauri command
    const result = await invoke<string>("transcribe_file", {
      filePath: request.filePath,
      modelName: request.modelName,
    });

    // Validate response
    return TranscribeResponseSchema.parse(result);
  } catch (error) {
    // Handle Tauri invoke errors
    if (typeof error === "string") {
      throw new Error(error);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error occurred during transcription");
  }
}
