import { createFileRoute } from "@tanstack/react-router";
import { Select, SelectItem } from "@heroui/react";
import { FileDropzone } from "@components/common/drag-and-drop/FileDropzone";
import { FilePreview } from "@components/common/drag-and-drop/FilePreview";
import { TranscriptionResult } from "@components/common/transcription/TranscriptionResult";
import { TranscriptionPresetSelector } from "@app/components/settings/TranscriptionPresetSelector";
import {
  transcribeFileAdvanced,
  type TranscriptionProgress,
} from "@api/endpoints/transcription";
import { useTranscriptionStore } from "@app/stores/useTranscriptionStore";
import { useTranscriptionSettingsStore } from "@app/stores/useTranscriptionSettingsStore";
import { useListModels } from "@app/hooks/useModels";
import { validateFileForTranscription } from "@app/utils/fileValidation";
import type { ModelName } from "@api/models";
import "./index.scss";

const AVAILABLE_MODELS: Array<{
  name: ModelName;
  label: string;
  size: string;
}> = [
  { name: "tiny", label: "Tiny", size: "77 MB" },
  { name: "base", label: "Base", size: "148 MB" },
  { name: "small", label: "Small", size: "488 MB" },
  { name: "medium", label: "Medium", size: "1.5 GB" },
  { name: "large-v3-turbo", label: "Large V3 Turbo", size: "1.6 GB" },
];

function TranscribePage() {
  // Get state from Zustand store (persisted across route changes)
  const selectedFilePath = useTranscriptionStore(
    (state) => state.selectedFilePath
  );
  const selectedModel = useTranscriptionStore((state) => state.selectedModel);
  const isTranscribing = useTranscriptionStore((state) => state.isTranscribing);
  const error = useTranscriptionStore((state) => state.error);
  const progress = useTranscriptionStore((state) => state.progress);
  const result = useTranscriptionStore((state) => state.result);
  const startTime = useTranscriptionStore((state) => state.startTime);
  const endTime = useTranscriptionStore((state) => state.endTime);

  // Get actions from store
  const setSelectedFile = useTranscriptionStore(
    (state) => state.setSelectedFile
  );
  const setSelectedModel = useTranscriptionStore(
    (state) => state.setSelectedModel
  );
  const setTranscribing = useTranscriptionStore(
    (state) => state.setTranscribing
  );
  const setProgress = useTranscriptionStore((state) => state.setProgress);
  const setError = useTranscriptionStore((state) => state.setError);
  const setResult = useTranscriptionStore((state) => state.setResult);
  const setStartTime = useTranscriptionStore((state) => state.setStartTime);
  const setEndTime = useTranscriptionStore((state) => state.setEndTime);
  const clearAll = useTranscriptionStore((state) => state.clearAll);
  const clearResultsOnly = useTranscriptionStore(
    (state) => state.clearResultsOnly
  );

  // Get transcription settings
  const transcriptionSettings = useTranscriptionSettingsStore(
    (state) => state.settings
  );

  // Get downloaded models
  const { data: downloadedModelsRaw = [] } = useListModels();

  const handleFileSelect = (filePath: string) => {
    setSelectedFile(filePath);
    clearResultsOnly(); // Clear previous results but keep file
  };

  const handleClear = () => {
    clearAll(); // Clear everything including file
  };

  const handleTranscribe = async () => {
    if (!selectedFilePath) return;

    setTranscribing(true);
    setError(null);
    setResult(null);
    setProgress(null);
    setStartTime(new Date().toISOString());
    setEndTime(null);

    try {
      // Validate file exists before starting transcription
      const validation = await validateFileForTranscription(selectedFilePath);
      if (!validation.isValid) {
        setError(validation.error || "File validation failed");
        setTranscribing(false);
        return;
      }

      const transcriptionResult = await transcribeFileAdvanced(
        selectedFilePath,
        selectedModel,
        true,
        transcriptionSettings,
        (progressUpdate: TranscriptionProgress) => {
          setProgress(progressUpdate);
        }
      );

      setResult(transcriptionResult);
      setEndTime(new Date().toISOString());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to start transcription"
      );
    } finally {
      setTranscribing(false);
      setProgress(null);
    }
  };

  const isModelDownloaded = (modelName: ModelName) => {
    return downloadedModelsRaw.some((model) =>
      model.toLowerCase().includes(modelName)
    );
  };

  const downloadedModels = AVAILABLE_MODELS.filter((model) =>
    isModelDownloaded(model.name)
  );

  // Helper: Get model selector description
  const getModelDescription = (): string => {
    if (downloadedModels.length === 0) {
      return "No models downloaded. Visit the Models page to download one.";
    }

    const modelWord = downloadedModels.length === 1 ? "model" : "models";
    return `${downloadedModels.length} ${modelWord} available`;
  };

  // Helper: Get error message if no models
  const getModelErrorMessage = (): string | null => {
    if (downloadedModels.length === 0 && selectedFilePath) {
      return "Please download a model first";
    }
    return null;
  };

  // Helper: Render main content based on state
  const renderContent = () => {
    // Show results if transcription is complete
    if (result) {
      return (
        <TranscriptionResult
          text={result.text}
          subtitlesSrt={result.subtitles_srt}
          subtitlesVtt={result.subtitles_vtt}
          language={result.language}
          startTime={startTime || "N/A"}
          endTime={endTime || "N/A"}
          mediaFilePath={selectedFilePath || undefined}
          onReset={handleClear}
        />
      );
    }

    // Show dropzone if no file selected
    if (!selectedFilePath) {
      return (
        <FileDropzone
          onFileSelect={handleFileSelect}
          disabled={isTranscribing}
        />
      );
    }

    // Show file preview with transcribe button
    return (
      <FilePreview
        filePath={selectedFilePath}
        onClear={handleClear}
        onTranscribe={handleTranscribe}
        isTranscribing={isTranscribing}
        error={error}
        progress={progress}
        startTime={startTime}
      />
    );
  };

  return (
    <section className="transcribe-page">
      <h1 className="transcribe-page__title">Transcribe Audio</h1>

      {/* Show dropzone/file preview/results */}
      {renderContent()}

      {/* Model & Quality Settings - only show when file selected but not transcribing */}
      {selectedFilePath && !result && (
        <>
          <div className="transcribe-page__model-selector">
            <Select
              label="Whisper Model"
              placeholder="Select a model"
              selectedKeys={[selectedModel]}
              onChange={(e) => setSelectedModel(e.target.value as ModelName)}
              isDisabled={isTranscribing}
              description={getModelDescription()}
              errorMessage={getModelErrorMessage()}
            >
              {downloadedModels.map((model) => (
                <SelectItem key={model.name} textValue={model.label}>
                  <div className="transcribe-page__model-item">
                    <span>{model.label}</span>
                    <span className="transcribe-page__model-size">
                      {model.size}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </Select>
          </div>

          <div className="transcribe-page__preset-selector">
            <TranscriptionPresetSelector isDisabled={isTranscribing} />
          </div>
        </>
      )}
    </section>
  );
}

export const Route = createFileRoute("/transcribe/")({
  component: TranscribePage,
});
