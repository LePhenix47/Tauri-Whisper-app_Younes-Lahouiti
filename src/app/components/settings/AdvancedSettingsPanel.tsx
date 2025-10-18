import { Select, SelectItem, Slider, Switch, Input, Tooltip } from "@heroui/react";
import { IoInformationCircleOutline } from "react-icons/io5";
import { useTranscriptionSettingsStore } from "@app/stores/useTranscriptionSettingsStore";
import type { SamplingStrategy } from "@app/types/transcriptionSettings";
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

  return (
    <div className="advanced-settings">
      {/* Sampling Strategy */}
      <div className="advanced-settings__section">
        <div className="advanced-settings__title-row">
          <h4 className="advanced-settings__section-title">Sampling Strategy</h4>
          <Tooltip
            content={
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
            }
            placement="right"
            showArrow
          >
            <button type="button" className="advanced-settings__info-button">
              <IoInformationCircleOutline size={18} className="advanced-settings__info-icon" />
            </button>
          </Tooltip>
        </div>
        <p className="advanced-settings__hint">
          How the model chooses tokens during transcription
        </p>

        <Select
          label="Strategy Type"
          selectedKeys={[settings.sampling_strategy.type]}
          onChange={(e) => handleSamplingTypeChange(e.target.value)}
          isDisabled={isDisabled}
          className="advanced-settings__input"
        >
          <SelectItem key="greedy">Greedy (Fast)</SelectItem>
          <SelectItem key="beam_search">Beam Search (Accurate)</SelectItem>
        </Select>

        {isSamplingGreedy ? (
          <>
            <Slider
              label="Best Of"
              minValue={1}
              maxValue={8}
              step={1}
              value={bestOf}
              onChange={handleBestOfChange}
              isDisabled={isDisabled}
              className="advanced-settings__slider"
              showSteps
              marks={[
                { value: 1, label: "1" },
                { value: 5, label: "5" },
                { value: 8, label: "8" },
              ]}
            />
            <p className="advanced-settings__param-hint">
              Number of candidate sequences to consider. Higher = better quality but slower.
            </p>
          </>
        ) : (
          <>
            <Slider
              label="Beam Size"
              minValue={2}
              maxValue={8}
              step={1}
              value={beamSize}
              onChange={handleBeamSizeChange}
              isDisabled={isDisabled}
              className="advanced-settings__slider"
              showSteps
              marks={[
                { value: 2, label: "2" },
                { value: 5, label: "5" },
                { value: 8, label: "8" },
              ]}
            />
            <p className="advanced-settings__param-hint">
              Number of parallel beams. Higher = more thorough exploration, much slower.
            </p>

            <Slider
              label="Patience"
              minValue={-1}
              maxValue={2}
              step={0.5}
              value={patience}
              onChange={handlePatienceChange}
              isDisabled={isDisabled}
              className="advanced-settings__slider"
              showSteps
              marks={[
                { value: -1, label: "-1.0" },
                { value: 0, label: "0.0" },
                { value: 1, label: "1.0" },
                { value: 2, label: "2.0" },
              ]}
            />
            <p className="advanced-settings__param-hint">
              Controls beam search early termination. -1.0 = disabled, higher values = stops
              earlier when quality plateaus.
            </p>
          </>
        )}
      </div>

      {/* Temperature */}
      <div className="advanced-settings__section">
        <div className="advanced-settings__title-row">
          <h4 className="advanced-settings__section-title">Temperature</h4>
          <Tooltip
            content={
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
            }
            placement="right"
            showArrow
          >
            <button type="button" className="advanced-settings__info-button">
              <IoInformationCircleOutline size={18} className="advanced-settings__info-icon" />
            </button>
          </Tooltip>
        </div>
        <p className="advanced-settings__hint">
          Controls randomness of token selection
        </p>

        <Slider
          label="Temperature"
          minValue={0}
          maxValue={1}
          step={0.1}
          value={settings.temperature}
          onChange={handleTemperatureChange}
          isDisabled={isDisabled}
          className="advanced-settings__slider"
          showSteps
          marks={[
            { value: 0, label: "0.0" },
            { value: 0.5, label: "0.5" },
            { value: 1, label: "1.0" },
          ]}
        />
      </div>

      {/* Context Options */}
      <div className="advanced-settings__section">
        <div className="advanced-settings__title-row">
          <h4 className="advanced-settings__section-title">Context Settings</h4>
          <Tooltip
            content={
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
            }
            placement="right"
            showArrow
          >
            <button type="button" className="advanced-settings__info-button">
              <IoInformationCircleOutline size={18} className="advanced-settings__info-icon" />
            </button>
          </Tooltip>
        </div>

        <Switch
          isSelected={settings.no_context}
          onValueChange={setNoContext}
          isDisabled={isDisabled}
          className="advanced-settings__switch"
        >
          No Context
        </Switch>
        <p className="advanced-settings__hint">
          Transcribe each segment independently (faster, less continuity)
        </p>
      </div>

      {/* Initial Prompt */}
      <div className="advanced-settings__section">
        <div className="advanced-settings__title-row">
          <h4 className="advanced-settings__section-title">Initial Prompt</h4>
          <Tooltip
            content={
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
            }
            placement="right"
            showArrow
          >
            <button type="button" className="advanced-settings__info-button">
              <IoInformationCircleOutline size={18} className="advanced-settings__info-icon" />
            </button>
          </Tooltip>
        </div>
        <p className="advanced-settings__hint">
          Optional context to guide the model
        </p>

        <Input
          label="Initial Prompt (Optional)"
          placeholder="e.g., This is a technical interview about React..."
          value={settings.initial_prompt || ""}
          onChange={(e) => setInitialPrompt(e.target.value || null)}
          isDisabled={isDisabled}
          className="advanced-settings__input"
        />
      </div>
    </div>
  );
}
