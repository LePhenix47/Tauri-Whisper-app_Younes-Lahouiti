import { createFileRoute } from "@tanstack/react-router";
import { FileDropzone } from "@components/common/drag-and-drop/FileDropzone";
import { FilePreview } from "@components/common/drag-and-drop/FilePreview";
import { TranscriptionResult } from "@components/common/transcription/TranscriptionResult";
import {
  transcribeFileAdvanced,
  type TranscriptionProgress,
} from "@api/endpoints/transcription";
import { useTranscriptionStore } from "@app/stores/useTranscriptionStore";

function TranscribePage() {
  // Get state from Zustand store (persisted across route changes)
  const selectedFilePath = useTranscriptionStore((state) => state.selectedFilePath);
  const isTranscribing = useTranscriptionStore((state) => state.isTranscribing);
  const error = useTranscriptionStore((state) => state.error);
  const progress = useTranscriptionStore((state) => state.progress);
  const result = useTranscriptionStore((state) => state.result);
  const startTime = useTranscriptionStore((state) => state.startTime);
  const endTime = useTranscriptionStore((state) => state.endTime);

  // Get actions from store
  const setSelectedFile = useTranscriptionStore((state) => state.setSelectedFile);
  const setTranscribing = useTranscriptionStore((state) => state.setTranscribing);
  const setProgress = useTranscriptionStore((state) => state.setProgress);
  const setError = useTranscriptionStore((state) => state.setError);
  const setResult = useTranscriptionStore((state) => state.setResult);
  const setStartTime = useTranscriptionStore((state) => state.setStartTime);
  const setEndTime = useTranscriptionStore((state) => state.setEndTime);
  const clearAll = useTranscriptionStore((state) => state.clearAll);
  const clearResultsOnly = useTranscriptionStore((state) => state.clearResultsOnly);

  const handleFileSelect = (filePath: string) => {
    setSelectedFile(filePath);
    clearResultsOnly(); // Clear previous results but keep file
  };

  const handleClear = () => {
    clearAll(); // Clear everything including file
  };

  const handleTranscribe = async () => {
    if (!selectedFilePath) return;

    setTranscribing(true);
    setError(null);
    setResult(null);
    setProgress(null);
    setStartTime(new Date().toLocaleString());
    setEndTime(null);

    try {
      const transcriptionResult = await transcribeFileAdvanced(
        selectedFilePath,
        "base",
        true,
        (progressUpdate: TranscriptionProgress) => {
          setProgress(progressUpdate);
        }
      );

      setResult(transcriptionResult);
      setEndTime(new Date().toLocaleString());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to start transcription"
      );
    } finally {
      setTranscribing(false);
      setProgress(null);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "2rem" }}>Transcribe Audio</h1>

      {result ? (
        <TranscriptionResult
          text={result.text}
          subtitlesSrt={result.subtitles_srt}
          subtitlesVtt={result.subtitles_vtt}
          language={result.language}
          startTime={startTime || "N/A"}
          endTime={endTime || "N/A"}
          onReset={handleClear}
        />
      ) : !selectedFilePath ? (
        <FileDropzone
          onFileSelect={handleFileSelect}
          disabled={isTranscribing}
        />
      ) : (
        <FilePreview
          filePath={selectedFilePath}
          onClear={handleClear}
          onTranscribe={handleTranscribe}
          isTranscribing={isTranscribing}
          error={error}
          progress={progress}
          startTime={startTime}
        />
      )}
    </div>
  );
}

export const Route = createFileRoute("/transcribe/")({
  component: TranscribePage,
});
