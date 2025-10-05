import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import env from "@env";

type ModelName = "tiny" | "base" | "small" | "medium" | "large-v3-turbo";

const MODELS: Array<{ name: ModelName; label: string; size: string }> = [
  { name: "tiny", label: "Tiny", size: "77 MB" },
  { name: "base", label: "Base (Recommended)", size: "148 MB" },
  { name: "small", label: "Small", size: "488 MB" },
  { name: "medium", label: "Medium", size: "1.5 GB" },
  { name: "large-v3-turbo", label: "Large Turbo", size: "1.6 GB" },
];

function App() {
  const [message, setMessage] = useState<string>("");
  const [whisperTest, setWhisperTest] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<ModelName>("base");
  const [downloadStatus, setDownloadStatus] = useState<string>("");
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [modelsDir, setModelsDir] = useState<string>("");
  const [downloadedModels, setDownloadedModels] = useState<string[]>([]);

  async function handleClick() {
    const result = await invoke<string>("hello_world");
    setMessage(result);
  }

  async function showModelsFolder() {
    try {
      const dir = await invoke<string>("get_models_dir");
      setModelsDir(dir);
    } catch (error) {
      setModelsDir(`Error: ${error}`);
    }
  }

  async function testWhisper() {
    try {
      const result = await invoke<string>("test_whisper", {
        modelName: selectedModel,
      });
      setWhisperTest(result);
    } catch (error) {
      setWhisperTest(`Error: ${error}`);
    }
  }

  async function downloadModel() {
    setIsDownloading(true);
    setDownloadStatus(`Downloading ${selectedModel}...`);

    try {
      const result = await invoke<string>("download_model", {
        modelName: selectedModel,
      });
      setDownloadStatus(result);
    } catch (error) {
      setDownloadStatus(`Error: ${error}`);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="container">
      <h1>Tauri Whisper App</h1>
      <p>Running on {env.REACT_APP_NODE_ENV}</p>

      <hr />

      <h2>Download Whisper Model</h2>
      <button onClick={showModelsFolder}>Show Models Folder Path</button>
      {modelsDir && <p className="message">Models folder: {modelsDir}</p>}

      {downloadedModels.length > 0 && (
        <div>
          <p>Downloaded models:</p>
          <ul>
            {downloadedModels.map((model, i) => (
              <li key={i}>{model}</li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <label htmlFor="model-select">Select Model:</label>
        <select
          id="model-select"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value as ModelName)}
          disabled={isDownloading}
        >
          {MODELS.map((model) => (
            <option key={model.name} value={model.name}>
              {model.label} ({model.size})
            </option>
          ))}
        </select>
        <button onClick={downloadModel} disabled={isDownloading}>
          {isDownloading ? "Downloading..." : "Download Model"}
        </button>
      </div>
      {downloadStatus && <p className="message">{downloadStatus}</p>}

      <hr />

      <h2>Tests</h2>
      <button onClick={handleClick}>Say Hello</button>
      {message && <p className="message">{message}</p>}

      <button onClick={testWhisper}>Test Whisper-RS</button>
      {whisperTest && <p className="message">{whisperTest}</p>}
    </div>
  );
}

export default App;
