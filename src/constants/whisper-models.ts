/**
 * Centralized Whisper model definitions
 * Used for downloads, validation, and UI display
 */

export type WhisperModelName = "tiny" | "base" | "small" | "medium" | "large-v3-turbo";

export type WhisperModelMetadata = {
  name: WhisperModelName;
  displayName: string;
  filename: string;
  url: string;
  sizeBytes: number;
  sizeMB: string;
  description: string;
};

const BASE_URL = "https://huggingface.co/ggerganov/whisper.cpp/resolve/main";

export const WHISPER_MODELS: Record<WhisperModelName, WhisperModelMetadata> = {
  tiny: {
    name: "tiny",
    displayName: "Tiny",
    filename: "ggml-tiny.bin",
    url: `${BASE_URL}/ggml-tiny.bin`,
    sizeBytes: 75 * 1024 * 1024,
    sizeMB: "75 MB",
    description: "Fastest, lowest accuracy. Good for testing.",
  },
  base: {
    name: "base",
    displayName: "Base",
    filename: "ggml-base.bin",
    url: `${BASE_URL}/ggml-base.bin`,
    sizeBytes: 142 * 1024 * 1024,
    sizeMB: "142 MB",
    description: "Balanced speed and accuracy. Recommended for most users.",
  },
  small: {
    name: "small",
    displayName: "Small",
    filename: "ggml-small.bin",
    url: `${BASE_URL}/ggml-small.bin`,
    sizeBytes: 466 * 1024 * 1024,
    sizeMB: "466 MB",
    description: "Better accuracy, slower than base.",
  },
  medium: {
    name: "medium",
    displayName: "Medium",
    filename: "ggml-medium.bin",
    url: `${BASE_URL}/ggml-medium.bin`,
    sizeBytes: 1500 * 1024 * 1024,
    sizeMB: "1.5 GB",
    description: "High accuracy, requires good hardware.",
  },
  "large-v3-turbo": {
    name: "large-v3-turbo",
    displayName: "Large V3 Turbo",
    filename: "ggml-large-v3-turbo.bin",
    url: `${BASE_URL}/ggml-large-v3-turbo.bin`,
    sizeBytes: 1600 * 1024 * 1024,
    sizeMB: "1.6 GB",
    description: "Highest accuracy, very slow. Requires powerful GPU.",
  },
} as const;

/**
 * Regex pattern to match Whisper model filenames
 */
export const WHISPER_MODEL_FILENAME_REGEX = /^ggml-.*\.bin$/;

/**
 * Get model metadata by name
 */
export function getWhisperModel(name: WhisperModelName): WhisperModelMetadata {
  return WHISPER_MODELS[name];
}

/**
 * Get all model names as array
 */
export function getWhisperModelNames(): WhisperModelName[] {
  return Object.keys(WHISPER_MODELS) as WhisperModelName[];
}

/**
 * Check if filename matches Whisper model pattern
 */
export function isWhisperModelFilename(filename: string): boolean {
  return WHISPER_MODEL_FILENAME_REGEX.test(filename);
}

/**
 * Extract model name from filename (e.g., "ggml-base.bin" -> "base")
 */
export function extractModelName(filename: string): WhisperModelName | null {
  if (!isWhisperModelFilename(filename)) {
    return null;
  }

  const match = filename.match(/^ggml-(.*)\.bin$/);
  if (!match) {
    return null;
  }

  const modelName = match[1];
  return modelName in WHISPER_MODELS ? (modelName as WhisperModelName) : null;
}
