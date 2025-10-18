import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type {
  TranscriptionSettings,
  QualityPreset,
  SamplingStrategy,
} from "@app/types/transcriptionSettings";
import {
  PRESET_CONFIGS,
  getPresetBySettings,
} from "@app/types/transcriptionSettings";

/**
 * Transcription Settings Store
 *
 * Manages user preferences for Whisper transcription parameters.
 * Persists across sessions and automatically detects preset vs custom mode.
 */

type TranscriptionSettingsState = {
  // Current settings
  settings: TranscriptionSettings;

  // UI state
  showAdvanced: boolean;

  // Actions
  setPreset: (preset: Exclude<QualityPreset, "custom">) => void;
  updateSettings: (partial: Partial<TranscriptionSettings>) => void;
  setSamplingStrategy: (strategy: SamplingStrategy) => void;
  setTemperature: (temperature: number) => void;
  setThreadCount: (count: number | "auto") => void;
  setNoContext: (noContext: boolean) => void;
  setInitialPrompt: (prompt: string | null) => void;
  setMaxTextContext: (maxContext: number | null) => void;
  setEntropyThreshold: (threshold: number | null) => void;
  setNoSpeechThreshold: (threshold: number | null) => void;
  toggleAdvanced: () => void;
  resetToDefaults: () => void;
};

const DEFAULT_SETTINGS: TranscriptionSettings = PRESET_CONFIGS.balanced;

export const useTranscriptionSettingsStore = create<TranscriptionSettingsState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        settings: DEFAULT_SETTINGS,
        showAdvanced: false,

        // Set preset (Fast/Balanced/Best)
        setPreset: (preset) =>
          set({
            settings: { ...PRESET_CONFIGS[preset], preset },
          }),

        // Update multiple settings at once
        updateSettings: (partial) =>
          set((state) => {
            const newSettings = { ...state.settings, ...partial };
            // Auto-detect if settings still match a preset
            const detectedPreset = getPresetBySettings(newSettings);
            return {
              settings: { ...newSettings, preset: detectedPreset },
            };
          }),

        // Individual setters (auto-switch to custom when changed)
        setSamplingStrategy: (strategy) =>
          set((state) => {
            const newSettings = { ...state.settings, sampling_strategy: strategy };
            return {
              settings: {
                ...newSettings,
                preset: getPresetBySettings(newSettings),
              },
            };
          }),

        setTemperature: (temperature) =>
          set((state) => {
            const newSettings = { ...state.settings, temperature };
            return {
              settings: {
                ...newSettings,
                preset: getPresetBySettings(newSettings),
              },
            };
          }),

        setThreadCount: (count) =>
          set((state) => ({
            settings: { ...state.settings, thread_count: count },
            // Thread count doesn't affect preset detection
          })),

        setNoContext: (noContext) =>
          set((state) => {
            const newSettings = { ...state.settings, no_context: noContext };
            return {
              settings: {
                ...newSettings,
                preset: getPresetBySettings(newSettings),
              },
            };
          }),

        setInitialPrompt: (prompt) =>
          set((state) => {
            const newSettings = { ...state.settings, initial_prompt: prompt };
            return {
              settings: {
                ...newSettings,
                preset: getPresetBySettings(newSettings),
              },
            };
          }),

        setMaxTextContext: (maxContext) =>
          set((state) => {
            const newSettings = { ...state.settings, max_text_context: maxContext };
            return {
              settings: {
                ...newSettings,
                preset: getPresetBySettings(newSettings),
              },
            };
          }),

        setEntropyThreshold: (threshold) =>
          set((state) => {
            const newSettings = { ...state.settings, entropy_threshold: threshold };
            return {
              settings: {
                ...newSettings,
                preset: getPresetBySettings(newSettings),
              },
            };
          }),

        setNoSpeechThreshold: (threshold) =>
          set((state) => {
            const newSettings = { ...state.settings, no_speech_threshold: threshold };
            return {
              settings: {
                ...newSettings,
                preset: getPresetBySettings(newSettings),
              },
            };
          }),

        // UI controls
        toggleAdvanced: () =>
          set((state) => ({ showAdvanced: !state.showAdvanced })),

        resetToDefaults: () =>
          set({
            settings: DEFAULT_SETTINGS,
            showAdvanced: false,
          }),
      }),
      {
        name: "transcription-settings-storage",
        partialize: (state) => ({
          settings: state.settings,
          showAdvanced: state.showAdvanced,
        }),
      }
    ),
    { name: "TranscriptionSettingsStore" }
  )
);
