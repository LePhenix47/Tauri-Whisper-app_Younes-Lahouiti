import { createFileRoute } from "@tanstack/react-router";
import { Card, CardHeader, CardBody } from "@heroui/react";

function SettingsPage() {
  return (
    <div>
      <Card>
        <CardHeader>
          <h2>Settings</h2>
        </CardHeader>
        <CardBody>
          <p>Configure application settings.</p>
        </CardBody>
      </Card>
    </div>
  );
}

export const Route = createFileRoute("/settings/")({
  component: SettingsPage,
});
