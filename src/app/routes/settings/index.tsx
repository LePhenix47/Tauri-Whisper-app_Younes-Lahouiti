import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardBody, Select, SelectItem, Chip } from "@heroui/react";
import { useAppStore } from "@app/stores/useAppStore";
import { getGpuInfo, type GpuInfo } from "@api/system";

function SettingsPage() {
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);

  const [gpuInfo, setGpuInfo] = useState<GpuInfo | null>(null);
  const [isLoadingGpu, setIsLoadingGpu] = useState(true);
  const [gpuError, setGpuError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGpuInfo = async () => {
      try {
        const info = await getGpuInfo();
        setGpuInfo(info);
      } catch (error) {
        setGpuError(error instanceof Error ? error.message : "Failed to get GPU info");
      } finally {
        setIsLoadingGpu(false);
      }
    };

    fetchGpuInfo();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <Card>
        <CardHeader>
          <h2>Settings</h2>
        </CardHeader>
        <CardBody>
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
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2>System Information</h2>
        </CardHeader>
        <CardBody>
          {isLoadingGpu && <p>Loading GPU info...</p>}

          {gpuError && (
            <Chip color="danger" variant="flat">
              {gpuError}
            </Chip>
          )}

          {gpuInfo && !gpuError && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div>
                <strong>Vulkan Support:</strong>{" "}
                <Chip color={gpuInfo.has_vulkan ? "success" : "warning"} size="sm">
                  {gpuInfo.has_vulkan ? "Available" : "Not Available"}
                </Chip>
              </div>

              {gpuInfo.vulkan_version && (
                <div>
                  <strong>Vulkan SDK Path:</strong>{" "}
                  <code style={{ fontSize: "0.875rem" }}>{gpuInfo.vulkan_version}</code>
                </div>
              )}

              {gpuInfo.gpu_name && (
                <div>
                  <strong>GPU:</strong> {gpuInfo.gpu_name}
                </div>
              )}

              {gpuInfo.vendor && (
                <div>
                  <strong>Vendor:</strong> {gpuInfo.vendor}
                </div>
              )}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export const Route = createFileRoute("/settings/")({
  component: SettingsPage,
});
