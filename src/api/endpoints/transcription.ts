import { invoke } from "@tauri-apps/api/tauri";
import { listen } from "@tauri-apps/api/event";
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

// Advanced response schema
export const TranscribeAdvancedResponseSchema = z.object({
  text: z.string(),
  subtitles_srt: z.string(),
  subtitles_vtt: z.string(),
  language: z.string(),
  segments: z.array(
    z.object({
      index: z.number(),
      start_time: z.number(),
      end_time: z.number(),
      text: z.string(),
    })
  ),
});

export type TranscribeAdvancedResponse = z.infer<
  typeof TranscribeAdvancedResponseSchema
>;

// Progress event types
export type TranscriptionProgress =
  | { type: "converting"; message: string }
  | { type: "detecting_language" }
  | { type: "language_detected"; language: string }
  | { type: "transcribing"; progress: number }
  | { type: "generating_subtitles" }
  | { type: "complete"; subtitle_format: string };

export type ProgressCallback = (progress: TranscriptionProgress) => void;

/**
 * Transcribe an audio/video file using Whisper (simple version)
 * @param filePath - Absolute path to the audio/video file
 * @param modelName - Whisper model name (defaults to "base" in Rust)
 * @returns Transcription result (text only)
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

/**
 * Transcribe an audio/video file using Whisper (advanced version with progress)
 * @param filePath - Absolute path to the audio/video file
 * @param modelName - Whisper model name (defaults to "base" in Rust)
 * @param detectLanguage - Auto-detect language (defaults to true)
 * @param onProgress - Callback for progress updates
 * @returns Full transcription result with subtitles and metadata
 */
export async function transcribeFileAdvanced(
  filePath: string,
  modelName?: string,
  detectLanguage: boolean = true,
  onProgress?: ProgressCallback
): Promise<TranscribeAdvancedResponse> {
  // Validate request
  const request = TranscribeRequestSchema.parse({
    filePath,
    modelName,
  });

  // Setup progress listener
  let unlisten: (() => void) | undefined;

  if (onProgress) {
    unlisten = await listen<TranscriptionProgress>(
      "transcription-progress",
      (event) => {
        onProgress(event.payload);
      }
    );
  }

  try {
    // Invoke Tauri command
    const result = await invoke<TranscribeAdvancedResponse>(
      "transcribe_file_advanced",
      {
        filePath: request.filePath,
        modelName: request.modelName,
        detectLanguage,
      }
    );

    // Validate response
    return TranscribeAdvancedResponseSchema.parse(result);
  } catch (error) {
    // Handle Tauri invoke errors
    if (typeof error === "string") {
      throw new Error(error);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error occurred during transcription");
  } finally {
    // Cleanup listener
    if (unlisten) {
      unlisten();
    }
  }
}
