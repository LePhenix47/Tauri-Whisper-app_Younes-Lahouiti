import { createFileRoute } from "@tanstack/react-router";
import { Card, CardHeader, CardBody } from "@heroui/react";

function TranscribePage() {
  return (
    <div>
      <Card>
        <CardHeader>
          <h2>Transcribe Audio</h2>
        </CardHeader>
        <CardBody>
          <p>Upload audio/video files for transcription.</p>
        </CardBody>
      </Card>
    </div>
  );
}

export const Route = createFileRoute("/transcribe/")({
  component: TranscribePage,
});
