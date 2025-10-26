import type { ReactNode } from "react";

/**
 * Configuration for advanced settings UI
 * Defines all sections, controls, tooltips, and metadata
 */

// ============================================================================
// TYPES
// ============================================================================

export type SliderMark = {
  value: number;
  label: string;
};

export type SliderConfig = {
  id: string;
  label: string;
  minValue: number;
  maxValue: number;
  step: number;
  marks: SliderMark[];
  hint?: string;
};

export type SelectOption = {
  key: string;
  label: string;
};

export type SelectConfig = {
  id: string;
  label: string;
  options: SelectOption[];
};

export type SwitchConfig = {
  id: string;
  label: string;
  hint?: string;
};

export type InputConfig = {
  id: string;
  label: string;
  placeholder?: string;
};

export type TooltipConfig = {
  content: ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
};

export type SectionConfig = {
  id: string;
  title: string;
  hint?: string;
  tooltip?: TooltipConfig;
  controls: (SliderConfig | SelectConfig | SwitchConfig | InputConfig)[];
};

// ============================================================================
// TOOLTIP CONTENT
// ============================================================================

export const TOOLTIPS = {
  samplingStrategy: (
    <div className="advanced-settings__tooltip-content">
      <p>
        <strong>Greedy:</strong> Picks the most likely token at each step. Fast,
        but may miss alternative interpretations.
      </p>
      <p>
        <strong>Beam Search:</strong> Explores multiple token sequences
        simultaneously. Slower but more accurate.
      </p>
    </div>
  ),
  temperature: (
    <div className="advanced-settings__tooltip-content">
      <p>
        Controls how "creative" token choices are. Lower values make the model
        more deterministic (same input → same output). Higher values introduce
        more variation.
      </p>
      <p>
        <strong>0.0:</strong> Fully deterministic
        <br />
        <strong>0.5:</strong> Balanced (recommended)
        <br />
        <strong>1.0:</strong> Maximum variation
      </p>
    </div>
  ),
  contextSettings: (
    <div className="advanced-settings__tooltip-content">
      <p>
        <strong>Enabled (No Context):</strong> Each segment is transcribed
        independently. Faster, but segments may lack continuity.
      </p>
      <p>
        <strong>Disabled (Use Context):</strong> Uses previous text to inform
        current segment. Better for continuous speech, slightly slower.
      </p>
    </div>
  ),
  initialPrompt: (
    <div className="advanced-settings__tooltip-content">
      <p>
        Provide starting text to guide transcription. Useful for:
      </p>
      <ul>
        <li>Domain-specific terminology</li>
        <li>Speaker names or context</li>
        <li>Expected vocabulary</li>
      </ul>
      <p>
        <strong>Example:</strong> "This is a technical interview about React
        and TypeScript with Sarah Chen."
      </p>
    </div>
  ),
};

// ============================================================================
// SLIDER CONFIGURATIONS
// ============================================================================

export const SLIDER_CONFIGS: Record<string, SliderConfig> = {
  bestOf: {
    id: "bestOf",
    label: "Best Of",
    minValue: 1,
    maxValue: 8,
    step: 1,
    marks: [
      { value: 1, label: "1" },
      { value: 5, label: "5" },
      { value: 8, label: "8" },
    ],
    hint: "Number of candidate sequences to consider. Higher = better quality but slower.",
  },
  beamSize: {
    id: "beamSize",
    label: "Beam Size",
    minValue: 2,
    maxValue: 8,
    step: 1,
    marks: [
      { value: 2, label: "2" },
      { value: 5, label: "5" },
      { value: 8, label: "8" },
    ],
    hint: "Number of parallel beams. Higher = more thorough exploration, much slower.",
  },
  patience: {
    id: "patience",
    label: "Patience",
    minValue: -1,
    maxValue: 2,
    step: 0.5,
    marks: [
      { value: -1, label: "-1.0" },
      { value: 0, label: "0.0" },
      { value: 1, label: "1.0" },
      { value: 2, label: "2.0" },
    ],
    hint: "Controls beam search early termination. -1.0 = disabled, higher values = stops earlier when quality plateaus.",
  },
  temperature: {
    id: "temperature",
    label: "Temperature",
    minValue: 0,
    maxValue: 1,
    step: 0.1,
    marks: [
      { value: 0, label: "0.0" },
      { value: 0.5, label: "0.5" },
      { value: 1, label: "1.0" },
    ],
  },
};

// ============================================================================
// SELECT CONFIGURATIONS
// ============================================================================

const SELECT_CONFIGS: Record<string, SelectConfig> = {
  strategyType: {
    id: "strategyType",
    label: "Strategy Type",
    options: [
      { key: "greedy", label: "Greedy (Fast)" },
      { key: "beam_search", label: "Beam Search (Accurate)" },
    ],
  },
};

// ============================================================================
// SWITCH CONFIGURATIONS
// ============================================================================

const SWITCH_CONFIGS: Record<string, SwitchConfig> = {
  noContext: {
    id: "noContext",
    label: "No Context",
    hint: "Transcribe each segment independently (faster, less continuity)",
  },
};

// ============================================================================
// INPUT CONFIGURATIONS
// ============================================================================

const INPUT_CONFIGS: Record<string, InputConfig> = {
  initialPrompt: {
    id: "initialPrompt",
    label: "Initial Prompt (Optional)",
    placeholder: "e.g., This is a technical interview about React...",
  },
};

// ============================================================================
// SECTION CONFIGURATIONS
// ============================================================================

export const SECTIONS: SectionConfig[] = [
  {
    id: "sampling_strategy",
    title: "Sampling Strategy",
    hint: "How the model chooses tokens during transcription",
    tooltip: {
      content: TOOLTIPS.samplingStrategy,
      placement: "right",
    },
    controls: [SELECT_CONFIGS.strategyType],
  },
  {
    id: "temperature",
    title: "Temperature",
    hint: "Controls randomness of token selection",
    tooltip: {
      content: TOOLTIPS.temperature,
      placement: "right",
    },
    controls: [SLIDER_CONFIGS.temperature],
  },
  {
    id: "context_settings",
    title: "Context Settings",
    tooltip: {
      content: TOOLTIPS.contextSettings,
      placement: "right",
    },
    controls: [SWITCH_CONFIGS.noContext],
  },
  {
    id: "initial_prompt",
    title: "Initial Prompt",
    hint: "Optional context to guide the model",
    tooltip: {
      content: TOOLTIPS.initialPrompt,
      placement: "right",
    },
    controls: [INPUT_CONFIGS.initialPrompt],
  },
];
