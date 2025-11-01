import { convertFileSrc } from "@tauri-apps/api/core";

/**
 * Detect if file is video or audio based on extension
 */
export function getMediaType(filePath: string): "video" | "audio" {
  const extension = filePath.split(".").pop()?.toLowerCase() || "";
  const videoExtensions = ["mp4", "webm", "ogg", "mov", "avi", "mkv"];

  if (videoExtensions.includes(extension)) {
    return "video";
  }

  return "audio";
}

/**
 * Convert a local file path to a browser-usable streaming URL
 * @param path - Absolute path to the media file
 * @returns Secure URL that streams the file without loading it into memory
 */
export async function pathToMediaUrl(path: string): Promise<string> {
  try {
    // Use Tauri's convertFileSrc to create a streaming URL
    // This avoids loading the entire file into memory (critical for large videos)
    return convertFileSrc(path);
  } catch (error) {
    throw new Error(
      `Failed to convert file path: ${error instanceof Error ? error.message : "Unknown error"}`
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
 * Note: Tauri streaming URLs (from convertFileSrc) don't need to be revoked
 * @param urls - Array of blob URLs to revoke
 */
export function revokeBlobUrls(urls: string[]): void {
  urls.forEach((url) => {
    if (url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
    // convertFileSrc URLs (asset://) don't need cleanup
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
