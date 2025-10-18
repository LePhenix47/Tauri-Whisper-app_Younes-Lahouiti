import { Select, SelectItem, Slider, Switch, Input, Tooltip } from "@heroui/react";
import { IoInformationCircleOutline } from "react-icons/io5";
import { useTranscriptionSettingsStore } from "@app/stores/useTranscriptionSettingsStore";
import {
  SECTIONS,
  SLIDER_CONFIGS,
  SELECT_CONFIGS,
  SWITCH_CONFIGS,
  INPUT_CONFIGS,
  type SliderConfig,
  type SelectConfig,
  type SwitchConfig,
  type InputConfig,
} from "./advancedSettingsConfig";
import "./AdvancedSettingsPanel.scss";

type AdvancedSettingsPanelProps = {
  isDisabled?: boolean;
};

export function AdvancedSettingsPanel({ isDisabled = false }: AdvancedSettingsPanelProps) {
  const settings = useTranscriptionSettingsStore((state) => state.settings);
  const setSamplingStrategy = useTranscriptionSettingsStore(
    (state) => state.setSamplingStrategy
  );
  const setTemperature = useTranscriptionSettingsStore((state) => state.setTemperature);
  const setNoContext = useTranscriptionSettingsStore((state) => state.setNoContext);
  const setInitialPrompt = useTranscriptionSettingsStore((state) => state.setInitialPrompt);

  const isSamplingGreedy = settings.sampling_strategy.type === "greedy";
  const bestOf = isSamplingGreedy ? settings.sampling_strategy.best_of : 5;
  const beamSize = !isSamplingGreedy ? settings.sampling_strategy.beam_size : 5;
  const patience = !isSamplingGreedy ? settings.sampling_strategy.patience : -1.0;

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSamplingTypeChange = (type: string) => {
    if (type === "greedy") {
      setSamplingStrategy({ type: "greedy", best_of: 5 });
    } else {
      setSamplingStrategy({ type: "beam_search", beam_size: 5, patience: -1.0 });
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
  // VALUE GETTERS
  // ============================================================================

  const getSliderValue = (sliderId: string): number => {
    switch (sliderId) {
      case "bestOf":
        return bestOf;
      case "beamSize":
        return beamSize;
      case "patience":
        return patience;
      case "temperature":
        return settings.temperature;
      default:
        return 0;
    }
  };

  const getSliderHandler = (sliderId: string) => {
    switch (sliderId) {
      case "bestOf":
        return handleBestOfChange;
      case "beamSize":
        return handleBeamSizeChange;
      case "patience":
        return handlePatienceChange;
      case "temperature":
        return handleTemperatureChange;
      default:
        return () => {};
    }
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

  const renderControl = (control: SliderConfig | SelectConfig | SwitchConfig | InputConfig) => {
    if ("marks" in control) {
      return renderSlider(control as SliderConfig);
    }
    if ("options" in control) {
      return renderSelect(control as SelectConfig);
    }
    if ("hint" in control && !("placeholder" in control)) {
      return renderSwitch(control as SwitchConfig);
    }
    if ("placeholder" in control) {
      return renderInput(control as InputConfig);
    }
    return null;
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
