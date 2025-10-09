import { createFileRoute } from "@tanstack/react-router";
import { Card, CardHeader, CardBody } from "@heroui/react";

function ModelsPage() {
  return (
    <div>
      <Card>
        <CardHeader>
          <h2>Whisper Models</h2>
        </CardHeader>
        <CardBody>
          <p>Download and manage Whisper AI models here.</p>
        </CardBody>
      </Card>
    </div>
  );
}

export const Route = createFileRoute("/models")({
  component: ModelsPage,
});
