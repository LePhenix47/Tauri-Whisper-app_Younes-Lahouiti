import { exists } from "@tauri-apps/plugin-fs";

/**
 * Validation result for file checks
 */
export type FileValidationResult = {
  isValid: boolean;
  error?: string;
};

/**
 * Validate that a file exists and is accessible
 * @param filePath - Absolute path to the file
 * @returns Validation result with error message if invalid
 */
export async function validateFileExists(
  filePath: string
): Promise<FileValidationResult> {
  if (!filePath || filePath.trim() === "") {
    return {
      isValid: false,
      error: "File path is empty",
    };
  }

  try {
    const fileExists = await exists(filePath);

    if (!fileExists) {
      return {
        isValid: false,
        error: "File no longer exists. It may have been moved or deleted.",
      };
    }

    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: `Cannot access file: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Validate file before transcription (existence + extension)
 * @param filePath - Absolute path to the file
 * @returns Validation result with error message if invalid
 */
export async function validateFileForTranscription(
  filePath: string
): Promise<FileValidationResult> {
  // First check if file exists
  const existsCheck = await validateFileExists(filePath);
  if (!existsCheck.isValid) {
    return existsCheck;
  }

  // Validate file extension
  const validExtensions = [
    ".mp3",
    ".wav",
    ".m4a",
    ".flac",
    ".ogg",
    ".aac",
    ".wma",
    ".mp4",
    ".avi",
    ".mov",
    ".mkv",
    ".webm",
    ".flv",
  ];

  const extension = filePath.split(".").pop()?.toLowerCase();
  if (!extension || !validExtensions.some((ext) => ext === `.${extension}`)) {
    return {
      isValid: false,
      error: "Unsupported file format. Please select an audio or video file.",
    };
  }

  return { isValid: true };
}
