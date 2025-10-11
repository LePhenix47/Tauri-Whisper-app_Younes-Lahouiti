import { createFileRoute } from "@tanstack/react-router";
import { Card, CardHeader, CardBody, Select, SelectItem } from "@heroui/react";
import { useAppStore } from "@app/stores/useAppStore";

function SettingsPage() {
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);

  return (
    <div>
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
    </div>
  );
}

export const Route = createFileRoute("/settings/")({
  component: SettingsPage,
});
