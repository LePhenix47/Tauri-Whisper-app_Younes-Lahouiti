import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Select,
  SelectItem,
  Chip,
  Divider,
  Accordion,
  AccordionItem,
} from "@heroui/react";
import { IoDownloadOutline, IoCheckmarkCircle, IoClose } from "react-icons/io5";
import { MdScience, MdAudioFile, MdMic } from "react-icons/md";
import {
  useDownloadModel,
  useModelsDir,
  useListModels,
  useTestWhisper,
  useDownloadVoskModel,
  useListVoskModels,
} from "@app/hooks/useModels";
import type { ModelName } from "@api/models";

const AVAILABLE_MODELS: Array<{
  name: ModelName;
  label: string;
  size: string;
  description: string;
}> = [
  {
    name: "tiny",
    label: "Tiny",
    size: "77 MB",
    description: "Fastest, lowest accuracy. Good for testing.",
  },
  {
    name: "base",
    label: "Base",
    size: "148 MB",
    description: "Balanced speed and accuracy. Recommended for most users.",
  },
  {
    name: "small",
    label: "Small",
    size: "488 MB",
    description: "Better accuracy, slower processing.",
  },
  {
    name: "medium",
    label: "Medium",
    size: "1.5 GB",
    description: "High accuracy, requires more resources.",
  },
  {
    name: "large-v3-turbo",
    label: "Large V3 Turbo",
    size: "1.6 GB",
    description: "Best accuracy, slowest processing. Requires powerful hardware.",
  },
];

const AVAILABLE_VOSK_MODELS: Array<{
  name: string;
  label: string;
  flag: string;
  size: string;
  description: string;
}> = [
  {
    name: "vosk-model-small-en-us-0.15",
    label: "English (US)",
    flag: "🇺🇸",
    size: "40 MB",
    description: "American English, optimized for real-time",
  },
  {
    name: "vosk-model-small-en-in-0.4",
    label: "English (India)",
    flag: "🇮🇳",
    size: "31 MB",
    description: "Indian English accent",
  },
  {
    name: "vosk-model-small-fr-0.22",
    label: "French",
    flag: "🇫🇷",
    size: "41 MB",
    description: "Français - Fast, good accuracy",
  },
  {
    name: "vosk-model-small-de-0.15",
    label: "German",
    flag: "🇩🇪",
    size: "45 MB",
    description: "Deutsch - Real-time transcription",
  },
  {
    name: "vosk-model-small-es-0.42",
    label: "Spanish",
    flag: "🇪🇸",
    size: "39 MB",
    description: "Español - Fast model",
  },
  {
    name: "vosk-model-small-pt-0.3",
    label: "Portuguese",
    flag: "🇵🇹",
    size: "31 MB",
    description: "Português - Brazilian accent",
  },
  {
    name: "vosk-model-small-ru-0.22",
    label: "Russian",
    flag: "🇷🇺",
    size: "45 MB",
    description: "Русский - Fast model",
  },
  {
    name: "vosk-model-small-it-0.22",
    label: "Italian",
    flag: "🇮🇹",
    size: "48 MB",
    description: "Italiano - Real-time",
  },
  {
    name: "vosk-model-small-cn-0.22",
    label: "Chinese",
    flag: "🇨🇳",
    size: "42 MB",
    description: "中文 - Mandarin Chinese",
  },
  {
    name: "vosk-model-small-ja-0.22",
    label: "Japanese",
    flag: "🇯🇵",
    size: "48 MB",
    description: "日本語 - Japanese language",
  },
];

function ModelsPage() {
  const [selectedModel, setSelectedModel] = useState<ModelName>("base");
  const [selectedVoskModel, setSelectedVoskModel] = useState<string>(
    "vosk-model-small-en-us-0.15"
  );

  // Queries
  const { data: modelsDir } = useModelsDir();
  const { data: downloadedModels = [], isLoading: isLoadingModels } =
    useListModels();
  const { data: voskModels = [], isLoading: isLoadingVoskModels } =
    useListVoskModels();

  // Mutations
  const downloadModelMutation = useDownloadModel();
  const testWhisperMutation = useTestWhisper();
  const downloadVoskModelMutation = useDownloadVoskModel();

  const handleDownload = () => {
    downloadModelMutation.mutate(selectedModel);
  };

  const handleTestModel = (modelName: ModelName) => {
    testWhisperMutation.mutate(modelName);
  };

  const getModelInfo = (modelName: string) => {
    return AVAILABLE_MODELS.find((m) => m.name === modelName);
  };

  const isModelDownloaded = (modelName: ModelName) => {
    return downloadedModels.some((model) =>
      model.toLowerCase().includes(modelName)
    );
  };

  const selectedModelInfo = AVAILABLE_MODELS.find(
    (m) => m.name === selectedModel
  );

  const handleDownloadVosk = () => {
    downloadVoskModelMutation.mutate(selectedVoskModel);
  };

  const isVoskModelDownloaded = (modelName: string) => {
    return voskModels.some((model) => model === modelName);
  };

  const getVoskModelInfo = (modelName: string) => {
    return AVAILABLE_VOSK_MODELS.find((m) => m.name === modelName);
  };

  const selectedVoskModelInfo = AVAILABLE_VOSK_MODELS.find(
    (m) => m.name === selectedVoskModel
  );

  return (
    <div className="models-page">
      {/* Header */}
      <section className="models-page__header">
        <h1 className="models-page__title">Model Management</h1>
        <p className="models-page__subtitle">
          Manage transcription models for both offline file processing and live speech recognition
        </p>
      </section>

      {/* Accordion for Whisper and Vosk Models */}
      <Accordion
        variant="shadow"
        defaultExpandedKeys={["whisper"]}
        selectionMode="multiple"
      >
        {/* ==================== WHISPER MODELS ==================== */}
        <AccordionItem
          key="whisper"
          aria-label="Whisper Models"
          startContent={<MdAudioFile size={24} />}
          title="Whisper Models"
          subtitle="Offline transcription for audio/video files"
        >
          {/* Downloaded Whisper Models Card */}
          <section className="models-page__section">
            <Card>
              <CardHeader>
                <h2 className="models-page__card-title">Downloaded Whisper Models</h2>
              </CardHeader>
              <CardBody>
                {isLoadingModels ? (
                  <p className="models-page__loading">Loading models...</p>
                ) : downloadedModels.length > 0 ? (
                  <div className="models-page__models-list">
                    {downloadedModels.map((modelFile) => {
                      const modelNameMatch = modelFile.match(
                        /ggml-(tiny|base|small|medium|large-v3-turbo)/
                      );
                      const modelName = modelNameMatch
                        ? (modelNameMatch[1] as ModelName)
                        : null;
                      const modelInfo = modelName
                        ? getModelInfo(modelName)
                        : null;

                      return (
                        <div key={modelFile} className="models-page__model-item">
                          <div className="models-page__model-info">
                            <div className="models-page__model-header">
                              <h3 className="models-page__model-name">
                                {modelInfo?.label || modelFile}
                              </h3>
                              <Chip
                                size="sm"
                                color="success"
                                variant="flat"
                                startContent={<IoCheckmarkCircle size={16} />}
                              >
                                Installed
                              </Chip>
                            </div>
                            {modelInfo && (
                              <div className="models-page__model-details">
                                <span className="models-page__model-size">
                                  {modelInfo.size}
                                </span>
                                <span className="models-page__model-separator">
                                  •
                                </span>
                                <span className="models-page__model-description">
                                  {modelInfo.description}
                                </span>
                              </div>
                            )}
                            <p className="models-page__model-file">{modelFile}</p>
                          </div>
                          {modelName && (
                            <Button
                              size="sm"
                              variant="flat"
                              color="secondary"
                              startContent={<MdScience size={18} />}
                              onPress={() => handleTestModel(modelName)}
                              isLoading={
                                testWhisperMutation.isPending &&
                                testWhisperMutation.variables === modelName
                              }
                              isDisabled={testWhisperMutation.isPending}
                            >
                              Test
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="models-page__empty-state">
                    <p className="models-page__empty-text">
                      No Whisper models downloaded yet
                    </p>
                    <p className="models-page__empty-hint">
                      Download a model below to start offline transcriptions
                    </p>
                  </div>
                )}

                {/* Test Results */}
                {testWhisperMutation.isSuccess && (
                  <div className="models-page__test-result">
                    <Chip color="success" variant="flat" size="lg">
                      ✓ {testWhisperMutation.data}
                    </Chip>
                  </div>
                )}
                {testWhisperMutation.isError && (
                  <div className="models-page__test-result">
                    <Chip
                      color="danger"
                      variant="flat"
                      size="lg"
                      startContent={<IoClose size={18} />}
                    >
                      Test failed: {testWhisperMutation.error.message}
                    </Chip>
                  </div>
                )}
              </CardBody>
            </Card>
          </section>

          {/* Download New Whisper Model Card */}
          <section className="models-page__section">
            <Card>
              <CardHeader>
                <h2 className="models-page__card-title">Download New Whisper Model</h2>
              </CardHeader>
              <CardBody>
                <div className="models-page__download-form">
                  <Select
                    label="Select Model"
                    placeholder="Choose a model to download"
                    selectedKeys={[selectedModel]}
                    onChange={(e) => setSelectedModel(e.target.value as ModelName)}
                    isDisabled={downloadModelMutation.isPending}
                    className="models-page__select"
                  >
                    {AVAILABLE_MODELS.map((model) => (
                      <SelectItem
                        key={model.name}
                        textValue={`${model.label} (${model.size})`}
                      >
                        <div className="models-page__select-item">
                          <span className="models-page__select-label">
                            {model.label}
                            {isModelDownloaded(model.name) && (
                              <Chip size="sm" color="success" variant="dot">
                                Downloaded
                              </Chip>
                            )}
                          </span>
                          <span className="models-page__select-size">
                            {model.size}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </Select>

                  {selectedModelInfo && (
                    <div className="models-page__model-preview">
                      <Divider className="models-page__divider" />
                      <div className="models-page__preview-content">
                        <div className="models-page__preview-row">
                          <span className="models-page__preview-label">Size:</span>
                          <span className="models-page__preview-value">
                            {selectedModelInfo.size}
                          </span>
                        </div>
                        <div className="models-page__preview-row">
                          <span className="models-page__preview-label">
                            Description:
                          </span>
                          <span className="models-page__preview-value">
                            {selectedModelInfo.description}
                          </span>
                        </div>
                        {isModelDownloaded(selectedModel) && (
                          <Chip color="warning" variant="flat" size="sm">
                            This model is already downloaded
                          </Chip>
                        )}
                      </div>
                    </div>
                  )}

                  <Button
                    color="primary"
                    size="lg"
                    startContent={
                      !downloadModelMutation.isPending && (
                        <IoDownloadOutline size={20} />
                      )
                    }
                    onPress={handleDownload}
                    isDisabled={downloadModelMutation.isPending}
                    isLoading={downloadModelMutation.isPending}
                    className="models-page__download-button"
                  >
                    {downloadModelMutation.isPending
                      ? "Downloading..."
                      : "Download Model"}
                  </Button>

                  {/* Download Results */}
                  {downloadModelMutation.isSuccess && (
                    <Chip color="success" variant="flat" size="lg">
                      ✓ {downloadModelMutation.data}
                    </Chip>
                  )}
                  {downloadModelMutation.isError && (
                    <Chip
                      color="danger"
                      variant="flat"
                      size="lg"
                      startContent={<IoClose size={18} />}
                    >
                      Download failed: {downloadModelMutation.error.message}
                    </Chip>
                  )}
                </div>
              </CardBody>
            </Card>
          </section>
        </AccordionItem>

        {/* ==================== VOSK MODELS ==================== */}
        <AccordionItem
          key="vosk"
          aria-label="Vosk Models"
          startContent={<MdMic size={24} />}
          title="Vosk Models"
          subtitle="Real-time speech recognition for live microphone input"
        >
          {/* Downloaded Vosk Models Card */}
          <section className="models-page__section">
            <Card>
              <CardHeader>
                <h2 className="models-page__card-title">Downloaded Vosk Models</h2>
              </CardHeader>
              <CardBody>
                {isLoadingVoskModels ? (
                  <p className="models-page__loading">Loading Vosk models...</p>
                ) : voskModels.length > 0 ? (
                  <div className="models-page__models-list">
                    {voskModels.map((modelName) => {
                      const modelInfo = getVoskModelInfo(modelName);
                      return (
                        <div key={modelName} className="models-page__model-item">
                          <div className="models-page__model-info">
                            <div className="models-page__model-header">
                              <h3 className="models-page__model-name">
                                {modelInfo?.flag} {modelInfo?.label || modelName}
                              </h3>
                              <Chip
                                size="sm"
                                color="success"
                                variant="flat"
                                startContent={<IoCheckmarkCircle size={16} />}
                              >
                                Installed
                              </Chip>
                            </div>
                            {modelInfo && (
                              <div className="models-page__model-details">
                                <span className="models-page__model-size">
                                  {modelInfo.size}
                                </span>
                                <span className="models-page__model-separator">•</span>
                                <span className="models-page__model-description">
                                  {modelInfo.description}
                                </span>
                              </div>
                            )}
                            <p className="models-page__model-file">{modelName}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="models-page__empty-state">
                    <p className="models-page__empty-text">No Vosk models downloaded yet</p>
                    <p className="models-page__empty-hint">
                      Install a model below to enable live speech recognition
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>
          </section>

          {/* Download New Vosk Model Card */}
          <section className="models-page__section">
            <Card>
              <CardHeader>
                <h2 className="models-page__card-title">Download New Vosk Model</h2>
              </CardHeader>
              <CardBody>
                <div className="models-page__download-form">
                  <Select
                    label="Select Language"
                    placeholder="Choose a language model"
                    selectedKeys={[selectedVoskModel]}
                    onChange={(e) => setSelectedVoskModel(e.target.value)}
                    isDisabled={downloadVoskModelMutation.isPending}
                    className="models-page__select"
                  >
                    {AVAILABLE_VOSK_MODELS.map((model) => (
                      <SelectItem
                        key={model.name}
                        textValue={`${model.flag} ${model.label} (${model.size})`}
                      >
                        <div className="models-page__select-item">
                          <span className="models-page__select-label">
                            {model.flag} {model.label}
                            {isVoskModelDownloaded(model.name) && (
                              <Chip size="sm" color="success" variant="dot" style={{ marginLeft: '0.5rem' }}>
                                Downloaded
                              </Chip>
                            )}
                          </span>
                          <span className="models-page__select-size">{model.size}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </Select>

                  {selectedVoskModelInfo && (
                    <div className="models-page__model-preview">
                      <Divider className="models-page__divider" />
                      <div className="models-page__preview-content">
                        <div className="models-page__preview-row">
                          <span className="models-page__preview-label">Language:</span>
                          <span className="models-page__preview-value">
                            {selectedVoskModelInfo.flag} {selectedVoskModelInfo.label}
                          </span>
                        </div>
                        <div className="models-page__preview-row">
                          <span className="models-page__preview-label">Size:</span>
                          <span className="models-page__preview-value">
                            {selectedVoskModelInfo.size}
                          </span>
                        </div>
                        <div className="models-page__preview-row">
                          <span className="models-page__preview-label">Description:</span>
                          <span className="models-page__preview-value">
                            {selectedVoskModelInfo.description}
                          </span>
                        </div>
                        {isVoskModelDownloaded(selectedVoskModel) && (
                          <Chip color="warning" variant="flat" size="sm">
                            This model is already downloaded
                          </Chip>
                        )}
                      </div>
                    </div>
                  )}

                  <Button
                    color="primary"
                    size="lg"
                    startContent={
                      !downloadVoskModelMutation.isPending && <IoDownloadOutline size={20} />
                    }
                    onPress={handleDownloadVosk}
                    isDisabled={downloadVoskModelMutation.isPending}
                    isLoading={downloadVoskModelMutation.isPending}
                    className="models-page__download-button"
                  >
                    {downloadVoskModelMutation.isPending ? "Downloading..." : "Download Model"}
                  </Button>

                  {/* Download Results */}
                  {downloadVoskModelMutation.isSuccess && (
                    <Chip color="success" variant="flat" size="lg">
                      ✓ {downloadVoskModelMutation.data}
                    </Chip>
                  )}
                  {downloadVoskModelMutation.isError && (
                    <Chip
                      color="danger"
                      variant="flat"
                      size="lg"
                      startContent={<IoClose size={18} />}
                    >
                      Download failed: {downloadVoskModelMutation.error.message}
                    </Chip>
                  )}
                </div>
              </CardBody>
            </Card>
          </section>
        </AccordionItem>
      </Accordion>

      {/* System Info Section */}
      {modelsDir && (
        <section className="models-page__section">
          <Card>
            <CardHeader>
              <h2 className="models-page__card-title">System Information</h2>
            </CardHeader>
            <CardBody>
              <div className="models-page__info-item">
                <span className="models-page__info-label">
                  Models Directory:
                </span>
                <code className="models-page__info-value" title={modelsDir}>
                  {modelsDir}
                </code>
              </div>
            </CardBody>
          </Card>
        </section>
      )}
    </div>
  );
}

export const Route = createFileRoute("/models/")({
  component: ModelsPage,
});
