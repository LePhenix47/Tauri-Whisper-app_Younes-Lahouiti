import { createFileRoute } from "@tanstack/react-router";
import LiveRecorder from "@app/components/common/live-recorder/LiveRecorder";

function LiveRecorderPage() {
  return (
    <div className="live-recorder-page">
      <LiveRecorder />
    </div>
  );
}

export const Route = createFileRoute("/live-recorder/")({
  component: LiveRecorderPage,
});
