import { invoke } from "@tauri-apps/api/tauri";
import { ResultAsync } from "neverthrow";

/**
 * Wraps Tauri invoke calls with neverthrow Result type
 * Returns ResultAsync<T, Error> instead of throwing
 */
export function invokeCommand<T>(
  command: string,
  args?: Record<string, unknown>
): ResultAsync<T, Error> {
  return ResultAsync.fromPromise(
    invoke<T>(command, args),
    (error) => new Error(String(error))
  );
}
