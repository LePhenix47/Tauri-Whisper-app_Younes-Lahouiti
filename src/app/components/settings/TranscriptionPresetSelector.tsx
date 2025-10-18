import { RadioGroup, Switch } from "@heroui/react";
import { useTranscriptionSettingsStore } from "@app/stores/useTranscriptionSettingsStore";
import { PRESET_METADATA, type QualityPreset } from "@app/types/transcriptionSettings";
import { AdvancedSettingsPanel } from "./AdvancedSettingsPanel";
import "./TranscriptionPresetSelector.scss";

type TranscriptionPresetSelectorProps = {
  isDisabled?: boolean;
};

export function TranscriptionPresetSelector({
  isDisabled = false,
}: TranscriptionPresetSelectorProps) {
  const preset = useTranscriptionSettingsStore((state) => state.settings.preset);
  const setPreset = useTranscriptionSettingsStore((state) => state.setPreset);
  const showAdvanced = useTranscriptionSettingsStore((state) => state.showAdvanced);
  const toggleAdvanced = useTranscriptionSettingsStore((state) => state.toggleAdvanced);

  const presets: Array<Exclude<QualityPreset, "custom">> = ["fast", "balanced", "best"];

  const handleChange = (value: string) => {
    if (value !== "custom") {
      setPreset(value as Exclude<QualityPreset, "custom">);
    }
  };

  return (
    <div className="preset-selector">
      <div className="preset-selector__header">
        <div>
          <h3 className="preset-selector__title">
            {showAdvanced ? "Advanced Settings" : "Quality Preset"}
          </h3>
          <p className="preset-selector__description">
            {showAdvanced
              ? "Manually configure all transcription parameters"
              : "Choose a preset for your transcription quality"}
          </p>
        </div>
        <Switch
          isSelected={showAdvanced}
          onValueChange={toggleAdvanced}
          isDisabled={isDisabled}
          classNames={{
            wrapper: "preset-selector__mode-toggle",
          }}
        >
          Advanced Mode
        </Switch>
      </div>

      {/* Preset Mode */}
      {!showAdvanced && (
        <RadioGroup
          value={preset}
          onChange={(e) => handleChange(e.target.value)}
          classNames={{
            wrapper: "preset-selector__radio-group",
          }}
        >
        {presets.map((presetKey) => {
          const metadata = PRESET_METADATA[presetKey];
          return (
            <div key={presetKey} className="preset-selector__option">
              <label className="preset-selector__label">
                <input
                  type="radio"
                  name="preset"
                  value={presetKey}
                  checked={preset === presetKey}
                  onChange={() => handleChange(presetKey)}
                  disabled={isDisabled}
                  className="preset-selector__radio"
                />
                <div className="preset-selector__content">
                  <div className="preset-selector__header">
                    <span className="preset-selector__name">{metadata.label}</span>
                    <div className="preset-selector__badges">
                      <span className="preset-selector__badge preset-selector__badge--speed">
                        {metadata.speedLabel}
                      </span>
                      <span className="preset-selector__badge preset-selector__badge--quality">
                        {metadata.qualityLabel}
                      </span>
                    </div>
                  </div>
                  <p className="preset-selector__preset-description">
                    {metadata.description}
                  </p>
                </div>
              </label>
            </div>
          );
        })}

        {preset === "custom" && (
          <div className="preset-selector__option preset-selector__option--custom">
            <div className="preset-selector__content">
              <div className="preset-selector__header">
                <span className="preset-selector__name">Custom</span>
                <span className="preset-selector__badge preset-selector__badge--custom">
                  Advanced
                </span>
              </div>
              <p className="preset-selector__preset-description">
                Using custom advanced settings
              </p>
            </div>
          </div>
        )}
        </RadioGroup>
      )}

      {/* Advanced Mode */}
      {showAdvanced && (
        <div className="preset-selector__advanced-panel">
          <AdvancedSettingsPanel isDisabled={isDisabled} />
        </div>
      )}
    </div>
  );
}
