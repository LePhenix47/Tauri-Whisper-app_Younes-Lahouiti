import { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Select,
  SelectItem,
  Chip,
  Progress,
  Spinner,
} from "@heroui/react";
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
  const setTheme = useAppStore((state) => state.setTheme);

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      const isDark =
        theme === "dark" || (theme === "system" && mediaQuery.matches);
      root.classList.toggle("dark", isDark);
    };

    // Apply theme immediately
    applyTheme();

    // Listen for OS theme changes when in system mode
    const handleChange = () => {
      if (theme === "system") applyTheme();
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
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
    <div className="">
      <Card>
        <CardHeader>
          <div className="header-content">
            <h1>Tauri Whisper App</h1>
            <Select
              label="Theme"
              selectedKeys={[theme]}
              onChange={(e) =>
                setTheme(e.target.value as "light" | "dark" | "system")
              }
              className="theme-switcher"
            >
              <SelectItem key="light">Light</SelectItem>
              <SelectItem key="dark">Dark</SelectItem>
              <SelectItem key="system">System</SelectItem>
            </Select>
          </div>
        </CardHeader>
        <CardBody>
          <div>
            <p>Running on {env.REACT_APP_NODE_ENV}</p>

            {/* HeroUI Component Tests */}
            <div className="test-buttons">
              <Button color="primary" variant="shadow">
                Primary Button
              </Button>
              <Button color="secondary" variant="flat">
                Secondary Button
              </Button>
              <Button color="success" variant="bordered">
                Success Button
              </Button>
              <Button color="danger" isLoading>
                Loading Button
              </Button>
              <Chip color="warning" variant="dot">
                Status Chip
              </Chip>
            </div>

            <Input
              label="Test Input"
              placeholder="Enter something..."
              variant="bordered"
            />

            <Progress
              label="Progress Test"
              value={65}
              color="primary"
              showValueLabel
            />
          </div>
        </CardBody>
      </Card>

      <hr />

      <Card>
        <CardHeader>
          <h2>Download Whisper Model</h2>
        </CardHeader>
        <CardBody>
          {modelsDir && <p className="message">Models folder: {modelsDir}</p>}

          <Select
            label="Select Model"
            placeholder="Choose a model"
            selectedKeys={[selectedModel]}
            onChange={(e) => setSelectedModel(e.target.value as ModelName)}
            isDisabled={downloadModelMutation.isPending}
          >
            {MODELS.map((model) => (
              <SelectItem key={model.name}>
                {model.label} ({model.size})
              </SelectItem>
            ))}
          </Select>

          <Button
            color="primary"
            onPress={handleDownload}
            isDisabled={downloadModelMutation.isPending}
            isLoading={downloadModelMutation.isPending}
          >
            {downloadModelMutation.isPending
              ? "Downloading..."
              : "Download Model"}
          </Button>

          {downloadModelMutation.isSuccess && (
            <Chip color="success" variant="flat">
              {downloadModelMutation.data}
            </Chip>
          )}
          {downloadModelMutation.isError && (
            <Chip color="danger" variant="flat">
              Error: {downloadModelMutation.error.message}
            </Chip>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2>Test Whisper</h2>
        </CardHeader>
        <CardBody>
          <Button
            color="secondary"
            onPress={handleTestWhisper}
            isDisabled={testWhisperMutation.isPending}
            isLoading={testWhisperMutation.isPending}
          >
            {testWhisperMutation.isPending ? "Testing..." : "Test Whisper-RS"}
          </Button>

          {testWhisperMutation.isSuccess && (
            <Chip color="success" variant="flat">
              {testWhisperMutation.data}
            </Chip>
          )}
          {testWhisperMutation.isError && (
            <Chip color="danger" variant="flat">
              Error: {testWhisperMutation.error.message}
            </Chip>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default App;
