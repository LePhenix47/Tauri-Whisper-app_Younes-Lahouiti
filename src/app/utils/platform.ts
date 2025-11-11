import { platform } from '@tauri-apps/plugin-os';

/**
 * Get the current platform
 * @returns The platform name: 'linux', 'macos', 'windows', etc.
 */
export function getPlatform(): string {
  return platform();
}

/**
 * Check if Vosk live transcription is supported on the current platform
 * Vosk is only supported on Windows and Linux (no macOS binaries available)
 * @returns true if vosk is supported, false otherwise
 */
export function isVoskSupported(): boolean {
  const currentPlatform = platform();
  return currentPlatform === 'windows' || currentPlatform === 'linux';
}
