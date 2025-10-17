import { readFile } from "@tauri-apps/plugin-fs";

/**
 * MIME type map for common media extensions
 */
const MIME_TYPES: Record<string, string> = {
  // Video formats
  mp4: "video/mp4",
  webm: "video/webm",
  ogg: "video/ogg",
  mov: "video/quicktime",
  avi: "video/x-msvideo",
  mkv: "video/x-matroska",

  // Audio formats
  mp3: "audio/mpeg",
  wav: "audio/wav",
  m4a: "audio/mp4",
  aac: "audio/aac",
  flac: "audio/flac",
  opus: "audio/opus",

  // Subtitle formats
  vtt: "text/vtt",
  srt: "text/srt",
};

/**
 * Get MIME type from file extension
 */
function getMimeType(filePath: string): string {
  const extension = filePath.split(".").pop()?.toLowerCase();
  return MIME_TYPES[extension || ""] || "application/octet-stream";
}

/**
 * Detect if file is video or audio based on extension
 */
export function getMediaType(filePath: string): "video" | "audio" {
  const extension = filePath.split(".").pop()?.toLowerCase() || "";
  const videoExtensions = ["mp4", "webm", "ogg", "mov", "avi", "mkv"];
  return videoExtensions.includes(extension) ? "video" : "audio";
}

/**
 * Convert a local file path to a browser-usable Blob URL
 * @param path - Absolute path to the media file
 * @returns Blob URL that can be used in <video> or <audio> elements
 */
export async function pathToMediaUrl(path: string): Promise<string> {
  try {
    // Read file as bytes using Tauri FS plugin
    const bytes = await readFile(path);

    // Determine MIME type from extension
    const mimeType = getMimeType(path);

    // Create blob and return object URL
    const blob = new Blob([new Uint8Array(bytes)], { type: mimeType });
    return URL.createObjectURL(blob);
  } catch (error) {
    throw new Error(
      `Failed to load media file: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Convert subtitle text (VTT/SRT) to a browser-usable Blob URL
 * @param subtitleText - The subtitle content (VTT or SRT format)
 * @param format - Subtitle format ('vtt' or 'srt')
 * @returns Blob URL that can be used in <track> elements
 */
export function subtitleTextToUrl(
  subtitleText: string,
  format: "vtt" | "srt"
): string {
  const mimeType = format === "vtt" ? "text/vtt" : "text/srt";
  const blob = new Blob([subtitleText], { type: mimeType });
  return URL.createObjectURL(blob);
}

/**
 * Clean up blob URLs to prevent memory leaks
 * @param urls - Array of blob URLs to revoke
 */
export function revokeBlobUrls(urls: string[]): void {
  urls.forEach((url) => {
    if (url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  });
}

/**
 * Download text content as a file
 * @param content - Text content to download
 * @param filename - Desired filename
 * @param mimeType - MIME type of the file
 */
export function downloadTextFile(
  content: string,
  filename: string,
  mimeType = "text/plain"
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
