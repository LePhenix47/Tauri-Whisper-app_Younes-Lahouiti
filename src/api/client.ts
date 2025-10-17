import { invoke } from "@tauri-apps/api/core";

/**
 * Wraps Tauri invoke calls with neverthrow Result type
 * Returns ResultAsync<T, Error> instead of throwing
 */
export async function invokeCommand<T>(
  command: string,
  args?: Record<string, unknown>
): Promise<T> {
  try {
    return await invoke<T>(command, args);
  } catch (error) {
    throw new Error(String(error));
  }
}
