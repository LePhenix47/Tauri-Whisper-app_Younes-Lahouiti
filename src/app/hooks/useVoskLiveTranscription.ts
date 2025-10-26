import { useState, useCallback, useEffect, useRef } from "react";
import {
  startVoskSession,
  processVoskChunk,
  endVoskSession,
} from "@api/vosk";

interface UseVoskLiveTranscriptionOptions {
  modelName: string;
  sampleRate?: number; // Default: 16000
  onPartialResult?: (text: string) => void;
  onFinalResult?: (text: string) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for managing Vosk live transcription sessions
 * Handles session lifecycle: start → process chunks → end
 */
export function useVoskLiveTranscription({
  modelName,
  sampleRate = 16000,
  onPartialResult,
  onFinalResult,
  onError,
}: UseVoskLiveTranscriptionOptions) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [partialText, setPartialText] = useState("");
  const [finalText, setFinalText] = useState("");
  const [error, setError] = useState<Error | null>(null);

  // Use ref to hold session ID for immediate access in processChunk
  const sessionIdRef = useRef<string | null>(null);

  /**
   * Start transcription session
   */
  const startSession = useCallback(async () => {
    try {
      setError(null);
      const id = await startVoskSession(modelName, sampleRate);
      sessionIdRef.current = id; // Set ref immediately
      setSessionId(id);
      setIsActive(true);
      setPartialText("");
      setFinalText("");
      console.log(`[Vosk] Session started: ${id}`);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
    }
  }, [modelName, sampleRate, onError]);

  /**
   * Process audio chunk (call this repeatedly with microphone data)
   */
  const processChunk = useCallback(
    async (pcmData: Int16Array) => {
      // Use ref instead of state to avoid race condition
      const currentSessionId = sessionIdRef.current;

      if (!currentSessionId) {
        console.warn("[Vosk] No active session, cannot process chunk");
        return;
      }

      try {
        const pcmArray = Array.from(pcmData);
        const result = await processVoskChunk(currentSessionId, pcmArray);

        if (result.is_partial) {
          setPartialText(result.text);
          onPartialResult?.(result.text);
        } else {
          // Final result for this segment
          setFinalText((prev) => (prev ? prev + " " + result.text : result.text));
          setPartialText("");
          onFinalResult?.(result.text);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        onError?.(error);
      }
    },
    [onPartialResult, onFinalResult, onError]
  );

  /**
   * End transcription session
   */
  const endSession = useCallback(async () => {
    const currentSessionId = sessionIdRef.current;
    if (!currentSessionId) return;

    try {
      const final = await endVoskSession(currentSessionId);
      if (final) {
        setFinalText((prev) => (prev ? prev + " " + final : final));
        onFinalResult?.(final);
      }
      sessionIdRef.current = null; // Clear ref
      setSessionId(null);
      setIsActive(false);
      setPartialText("");
      console.log(`[Vosk] Session ended: ${currentSessionId}`);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
    }
  }, [onFinalResult, onError]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      const currentSessionId = sessionIdRef.current;
      if (currentSessionId) {
        endVoskSession(currentSessionId).catch(console.error);
      }
    };
  }, []);

  return {
    sessionId,
    isActive,
    partialText,
    finalText,
    error,
    startSession,
    processChunk,
    endSession,
  };
}
