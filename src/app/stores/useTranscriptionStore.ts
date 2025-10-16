import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type {
  TranscriptionProgress,
  TranscribeAdvancedResponse,
} from "@api/endpoints/transcription";

/**
 * Transcription state store
 *
 * Persists transcription state across route changes and app reloads.
 * This ensures users don't lose their uploaded file, progress, or results
 * when navigating away from the transcribe page.
 */

interface TranscriptionState {
  // File state
  selectedFilePath: string | null;

  // Transcription state
  isTranscribing: boolean;
  progress: TranscriptionProgress | null;
  error: string | null;

  // Results
  result: TranscribeAdvancedResponse | null;
  startTime: string | null;
  endTime: string | null;

  // Actions
  setSelectedFile: (filePath: string | null) => void;
  setTranscribing: (isTranscribing: boolean) => void;
  setProgress: (progress: TranscriptionProgress | null) => void;
  setError: (error: string | null) => void;
  setResult: (result: TranscribeAdvancedResponse | null) => void;
  setStartTime: (time: string | null) => void;
  setEndTime: (time: string | null) => void;
  clearAll: () => void;
  clearResultsOnly: () => void;
}

const initialState = {
  selectedFilePath: null,
  isTranscribing: false,
  progress: null,
  error: null,
  result: null,
  startTime: null,
  endTime: null,
};

export const useTranscriptionStore = create<TranscriptionState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        // Actions
        setSelectedFile: (filePath) =>
          set({ selectedFilePath: filePath, error: null }),

        setTranscribing: (isTranscribing) => set({ isTranscribing }),

        setProgress: (progress) => set({ progress }),

        setError: (error) => set({ error }),

        setResult: (result) => set({ result }),

        setStartTime: (time) => set({ startTime: time }),

        setEndTime: (time) => set({ endTime: time }),

        clearAll: () => set(initialState),

        clearResultsOnly: () =>
          set({
            result: null,
            error: null,
            progress: null,
            startTime: null,
            endTime: null,
          }),
      }),
      {
        name: "transcription-storage", // localStorage key
        partialize: (state) => ({
          // Persist everything except transient states
          selectedFilePath: state.selectedFilePath,
          result: state.result,
          startTime: state.startTime,
          endTime: state.endTime,
          // Don't persist: isTranscribing, progress, error (these are transient)
        }),
      }
    ),
    { name: "TranscriptionStore" } // DevTools name
  )
);
