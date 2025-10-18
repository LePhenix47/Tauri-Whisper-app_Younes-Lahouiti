/**
 * Transcription Settings Types
 *
 * Maps to whisper-rs FullParams configuration.
 * See: src-tauri/src/whisper_rs_imp/transcriber.rs
 */

// Sampling strategy types
export type SamplingStrategyType = "greedy" | "beam_search";

export type GreedySettings = {
  type: "greedy";
  best_of: number; // 1-10, how many candidates to consider
};

export type BeamSearchSettings = {
  type: "beam_search";
  beam_size: number; // 2-10, number of beams
  patience: number; // -1.0 or positive float
};

export type SamplingStrategy = GreedySettings | BeamSearchSettings;

// Quality preset types
export type QualityPreset = "fast" | "balanced" | "best" | "custom";

// Complete settings type
export type TranscriptionSettings = {
  // Preset selection (null when using custom/advanced)
  preset: QualityPreset;

  // Core settings
  sampling_strategy: SamplingStrategy;
  temperature: number; // 0.0 - 1.0

  // Performance
  thread_count: number | "auto"; // Number of CPU threads or "auto"

  // Advanced settings
  no_context: boolean; // Don't use previous text as context
  initial_prompt: string | null; // Context/vocabulary hint
  max_text_context: number | null; // Max tokens from past text
  entropy_threshold: number | null; // Reject low-confidence segments
  no_speech_threshold: number | null; // Silence detection sensitivity
};

// Default preset configurations
export const PRESET_CONFIGS: Record<Exclude<QualityPreset, "custom">, TranscriptionSettings> = {
  fast: {
    preset: "fast",
    sampling_strategy: {
      type: "greedy",
      best_of: 1,
    },
    temperature: 0.0,
    thread_count: "auto",
    no_context: true,
    initial_prompt: null,
    max_text_context: null,
    entropy_threshold: null,
    no_speech_threshold: null,
  },
  balanced: {
    preset: "balanced",
    sampling_strategy: {
      type: "greedy",
      best_of: 5,
    },
    temperature: 0.5,
    thread_count: "auto",
    no_context: true,
    initial_prompt: null,
    max_text_context: null,
    entropy_threshold: null,
    no_speech_threshold: null,
  },
  best: {
    preset: "best",
    sampling_strategy: {
      type: "beam_search",
      beam_size: 5,
      patience: -1.0,
    },
    temperature: 0.0,
    thread_count: "auto",
    no_context: false,
    initial_prompt: null,
    max_text_context: null,
    entropy_threshold: null,
    no_speech_threshold: null,
  },
};

// Preset metadata for UI
export type PresetMetadata = {
  label: string;
  description: string;
  speedLabel: string; // "Fastest", "Fast", "Slow"
  qualityLabel: string; // "Good", "Better", "Best"
};

export const PRESET_METADATA: Record<Exclude<QualityPreset, "custom">, PresetMetadata> = {
  fast: {
    label: "Fast",
    description: "Quick transcription with good quality",
    speedLabel: "Fastest",
    qualityLabel: "Good",
  },
  balanced: {
    label: "Balanced",
    description: "Recommended for most use cases",
    speedLabel: "Fast",
    qualityLabel: "Better",
  },
  best: {
    label: "Best Quality",
    description: "Slowest but most accurate transcription",
    speedLabel: "Slow",
    qualityLabel: "Best",
  },
};

// Helper functions
export function getPresetBySettings(settings: TranscriptionSettings): QualityPreset {
  // Check if settings match any preset
  for (const [preset, config] of Object.entries(PRESET_CONFIGS)) {
    if (isSettingsEqual(settings, config)) {
      return preset as Exclude<QualityPreset, "custom">;
    }
  }
  return "custom";
}

function isSettingsEqual(a: TranscriptionSettings, b: TranscriptionSettings): boolean {
  // Compare keys excluding 'preset' and 'thread_count' (not relevant for preset matching)
  const keysToCompare: Array<keyof TranscriptionSettings> = [
    'sampling_strategy',
    'temperature',
    'no_context',
    'initial_prompt',
    'max_text_context',
    'entropy_threshold',
    'no_speech_threshold',
  ];

  return keysToCompare.every((key) => {
    const valueA = a[key];
    const valueB = b[key];

    // Deep comparison for objects (sampling_strategy)
    if (typeof valueA === 'object' && typeof valueB === 'object') {
      return JSON.stringify(valueA) === JSON.stringify(valueB);
    }

    // Direct comparison for primitives
    return valueA === valueB;
  });
}

export function isCustomPreset(preset: QualityPreset): boolean {
  return preset === "custom";
}
