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
} from "@heroui/react";
import { IoDownloadOutline, IoCheckmarkCircle, IoClose } from "react-icons/io5";
import { MdScience } from "react-icons/md";
import {
  useDownloadModel,
  useModelsDir,
  useListModels,
  useTestWhisper,
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

function ModelsPage() {
  const [selectedModel, setSelectedModel] = useState<ModelName>("base");

  // Queries
  const { data: modelsDir } = useModelsDir();
  const { data: downloadedModels = [], isLoading: isLoadingModels } =
    useListModels();

  // Mutations
  const downloadModelMutation = useDownloadModel();
  const testWhisperMutation = useTestWhisper();

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

  return (
    <div className="models-page">
      {/* Header */}
      <section className="models-page__header">
        <h1 className="models-page__title">Model Management</h1>
        <p className="models-page__subtitle">
          Download and manage Whisper AI models for offline transcription
        </p>
      </section>

      {/* Downloaded Models Section */}
      <section className="models-page__section">
        <Card>
          <CardHeader>
            <h2 className="models-page__card-title">Downloaded Models</h2>
          </CardHeader>
          <CardBody>
            {isLoadingModels ? (
              <p className="models-page__loading">Loading models...</p>
            ) : downloadedModels.length > 0 ? (
              <div className="models-page__models-list">
                {downloadedModels.map((modelFile) => {
                  // Extract model name from filename (e.g., "ggml-base.bin" -> "base")
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
                  No models downloaded yet
                </p>
                <p className="models-page__empty-hint">
                  Download a model below to get started
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

      {/* Download New Model Section */}
      <section className="models-page__section">
        <Card>
          <CardHeader>
            <h2 className="models-page__card-title">Download New Model</h2>
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
