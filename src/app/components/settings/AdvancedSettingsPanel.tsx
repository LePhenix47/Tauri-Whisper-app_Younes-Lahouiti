import { Select, SelectItem, Slider, Switch, Input, Tooltip } from "@heroui/react";
import { IoInformationCircleOutline } from "react-icons/io5";
import {
  useTranscriptionSettings,
  useSetSamplingStrategy,
  useSetTemperature,
  useSetNoContext,
  useSetInitialPrompt,
} from "@app/stores/useTranscriptionSettingsStore";
import {
  SECTIONS,
  SLIDER_CONFIGS,
  type SliderConfig,
  type SelectConfig,
  type SwitchConfig,
  type InputConfig,
} from "./advancedSettingsConfig";
import type { GreedySettings, BeamSearchSettings } from "@app/types/transcriptionSettings";
import "./AdvancedSettingsPanel.scss";

type AdvancedSettingsPanelProps = {
  isDisabled?: boolean;
};

export function AdvancedSettingsPanel({ isDisabled = false }: AdvancedSettingsPanelProps) {
  // Use custom hooks for stable selectors
  const settings = useTranscriptionSettings();
  const setSamplingStrategy = useSetSamplingStrategy();
  const setTemperature = useSetTemperature();
  const setNoContext = useSetNoContext();
  const setInitialPrompt = useSetInitialPrompt();

  // Type-safe extraction of sampling strategy values
  const isSamplingGreedy = settings.sampling_strategy.type === "greedy";
  const bestOf = isSamplingGreedy ? (settings.sampling_strategy as GreedySettings).best_of : 5;
  const beamSize = !isSamplingGreedy ? (settings.sampling_strategy as BeamSearchSettings).beam_size : 5;
  const patience = !isSamplingGreedy ? (settings.sampling_strategy as BeamSearchSettings).patience : -1.0;

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSamplingTypeChange = (type: string) => {
    switch (type) {
      case "greedy":
        setSamplingStrategy({ type: "greedy", best_of: 5 });
        break;
      case "beam_search":
        setSamplingStrategy({ type: "beam_search", beam_size: 5, patience: -1.0 });
        break;
      default:
        console.warn(`Unknown sampling type: ${type}`);
    }
  };

  const handleBestOfChange = (value: number | number[]) => {
    const numValue = Array.isArray(value) ? value[0] : value;
    setSamplingStrategy({ type: "greedy", best_of: numValue });
  };

  const handleBeamSizeChange = (value: number | number[]) => {
    const numValue = Array.isArray(value) ? value[0] : value;
    setSamplingStrategy({
      type: "beam_search",
      beam_size: numValue,
      patience: patience,
    });
  };

  const handlePatienceChange = (value: number | number[]) => {
    const numValue = Array.isArray(value) ? value[0] : value;
    setSamplingStrategy({
      type: "beam_search",
      beam_size: beamSize,
      patience: numValue,
    });
  };

  const handleTemperatureChange = (value: number | number[]) => {
    const numValue = Array.isArray(value) ? value[0] : value;
    setTemperature(numValue);
  };

  // ============================================================================
  // VALUE GETTERS (Using Map for O(1) lookup instead of switch)
  // ============================================================================

  const sliderValueMap = new Map<string, number>([
    ["bestOf", bestOf],
    ["beamSize", beamSize],
    ["patience", patience],
    ["temperature", settings.temperature],
  ]);

  const sliderHandlerMap = new Map<string, (value: number | number[]) => void>([
    ["bestOf", handleBestOfChange],
    ["beamSize", handleBeamSizeChange],
    ["patience", handlePatienceChange],
    ["temperature", handleTemperatureChange],
  ]);

  const getSliderValue = (sliderId: string): number => {
    return sliderValueMap.get(sliderId) ?? 0;
  };

  const getSliderHandler = (sliderId: string) => {
    return sliderHandlerMap.get(sliderId) ?? (() => {});
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderSlider = (config: SliderConfig) => (
    <div key={config.id}>
      <Slider
        label={config.label}
        minValue={config.minValue}
        maxValue={config.maxValue}
        step={config.step}
        value={getSliderValue(config.id)}
        onChange={getSliderHandler(config.id)}
        isDisabled={isDisabled}
        className="advanced-settings__slider"
        showSteps
        marks={config.marks}
      />
      {config.hint && (
        <p className="advanced-settings__param-hint">{config.hint}</p>
      )}
    </div>
  );

  const renderSelect = (config: SelectConfig) => (
    <Select
      key={config.id}
      label={config.label}
      selectedKeys={[settings.sampling_strategy.type]}
      onChange={(e) => handleSamplingTypeChange(e.target.value)}
      isDisabled={isDisabled}
      className="advanced-settings__input"
    >
      {config.options.map((option) => (
        <SelectItem key={option.key}>{option.label}</SelectItem>
      ))}
    </Select>
  );

  const renderSwitch = (config: SwitchConfig) => (
    <div key={config.id}>
      <Switch
        isSelected={settings.no_context}
        onValueChange={setNoContext}
        isDisabled={isDisabled}
        className="advanced-settings__switch"
      >
        {config.label}
      </Switch>
      {config.hint && (
        <p className="advanced-settings__hint">{config.hint}</p>
      )}
    </div>
  );

  const renderInput = (config: InputConfig) => (
    <Input
      key={config.id}
      label={config.label}
      placeholder={config.placeholder}
      value={settings.initial_prompt || ""}
      onChange={(e) => setInitialPrompt(e.target.value || null)}
      isDisabled={isDisabled}
      className="advanced-settings__input"
    />
  );

  // Type guards for better discrimination
  const isSliderConfig = (control: SliderConfig | SelectConfig | SwitchConfig | InputConfig): control is SliderConfig => {
    return "marks" in control;
  };

  const isSelectConfig = (control: SliderConfig | SelectConfig | SwitchConfig | InputConfig): control is SelectConfig => {
    return "options" in control;
  };

  const isInputConfig = (control: SliderConfig | SelectConfig | SwitchConfig | InputConfig): control is InputConfig => {
    return "placeholder" in control;
  };

  const renderControl = (control: SliderConfig | SelectConfig | SwitchConfig | InputConfig) => {
    // Use guard clauses for early returns
    if (isSliderConfig(control)) {
      return renderSlider(control);
    }

    if (isSelectConfig(control)) {
      return renderSelect(control);
    }

    if (isInputConfig(control)) {
      return renderInput(control);
    }

    // Default to switch (remaining type)
    return renderSwitch(control as SwitchConfig);
  };

  const renderSection = (section: typeof SECTIONS[0]) => (
    <div key={section.id} className="advanced-settings__section">
      {/* Section Header */}
      <div className="advanced-settings__title-row">
        <h4 className="advanced-settings__section-title">{section.title}</h4>
        {section.tooltip && (
          <Tooltip
            content={section.tooltip.content}
            placement={section.tooltip.placement || "right"}
            showArrow
          >
            <button type="button" className="advanced-settings__info-button">
              <IoInformationCircleOutline size={18} className="advanced-settings__info-icon" />
            </button>
          </Tooltip>
        )}
      </div>

      {/* Section Hint */}
      {section.hint && (
        <p className="advanced-settings__hint">{section.hint}</p>
      )}

      {/* Section Controls */}
      {section.controls.map(renderControl)}

      {/* Conditional Sliders for Sampling Strategy */}
      {section.id === "sampling_strategy" && (
        <>
          {isSamplingGreedy ? (
            renderSlider(SLIDER_CONFIGS.bestOf)
          ) : (
            <>
              {renderSlider(SLIDER_CONFIGS.beamSize)}
              {renderSlider(SLIDER_CONFIGS.patience)}
            </>
          )}
        </>
      )}
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="advanced-settings">
      {SECTIONS.map(renderSection)}
    </div>
  );
}
