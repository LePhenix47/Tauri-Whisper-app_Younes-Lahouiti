import { useState, useEffect } from "react";
import env from "@env";
import {
  useDownloadModel,
  useModelsDir,
  useTestWhisper,
} from "@app/hooks/useModels";
import type { ModelName } from "@api/models";
import { useAppStore } from "@app/stores/useAppStore";

const MODELS: Array<{ name: ModelName; label: string; size: string }> = [
  { name: "tiny", label: "Tiny", size: "77 MB" },
  { name: "base", label: "Base (Recommended)", size: "148 MB" },
  { name: "small", label: "Small", size: "488 MB" },
  { name: "medium", label: "Medium", size: "1.5 GB" },
  { name: "large-v3-turbo", label: "Large Turbo", size: "1.6 GB" },
];

function App() {
  const [selectedModel, setSelectedModel] = useState<ModelName>("base");

  // Theme logic - ONLY place where theme class is applied
  const theme = useAppStore((state) => state.theme);

  useEffect(() => {
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark-theme");
    } else if (theme === "light") {
      root.classList.remove("dark-theme");
    } else {
      // "system" - let CSS @media (prefers-color-scheme) handle it
      root.classList.remove("dark-theme");
    }
  }, [theme]);

  // TanStack Query hooks
  const { data: modelsDir } = useModelsDir();
  const downloadModelMutation = useDownloadModel();
  const testWhisperMutation = useTestWhisper();

  function handleDownload() {
    downloadModelMutation.mutate(selectedModel);
  }

  function handleTestWhisper() {
    testWhisperMutation.mutate(selectedModel);
  }

  return (
    <div className="container">
      <h1>Tauri Whisper App</h1>
      <p>Running on {env.REACT_APP_NODE_ENV}</p>

      <hr />

      <h2>Download Whisper Model</h2>

      {modelsDir && <p className="message">Models folder: {modelsDir}</p>}

      <div>
        <label htmlFor="model-select">Select Model:</label>
        <select
          id="model-select"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value as ModelName)}
          disabled={downloadModelMutation.isPending}
        >
          {MODELS.map((model) => (
            <option key={model.name} value={model.name}>
              {model.label} ({model.size})
            </option>
          ))}
        </select>
        <button
          onClick={handleDownload}
          disabled={downloadModelMutation.isPending}
        >
          {downloadModelMutation.isPending
            ? "Downloading..."
            : "Download Model"}
        </button>
      </div>

      {downloadModelMutation.isSuccess && (
        <p className="message">{downloadModelMutation.data}</p>
      )}
      {downloadModelMutation.isError && (
        <p className="message">Error: {downloadModelMutation.error.message}</p>
      )}

      <hr />

      <h2>Test Whisper</h2>
      <button
        onClick={handleTestWhisper}
        disabled={testWhisperMutation.isPending}
      >
        {testWhisperMutation.isPending ? "Testing..." : "Test Whisper-RS"}
      </button>

      {testWhisperMutation.isSuccess && (
        <p className="message">{testWhisperMutation.data}</p>
      )}
      {testWhisperMutation.isError && (
        <p className="message">Error: {testWhisperMutation.error.message}</p>
      )}
    </div>
  );
}

export default App;
