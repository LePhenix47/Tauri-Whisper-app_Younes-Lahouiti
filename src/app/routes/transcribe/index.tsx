import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileDropzone } from "./_components/FileDropzone";
import { FilePreview } from "./_components/FilePreview";
import { TranscriptionResult } from "./_components/TranscriptionResult";
import {
  transcribeFileAdvanced,
  type TranscriptionProgress,
  type TranscribeAdvancedResponse,
} from "@api/endpoints/transcription";

function TranscribePage() {
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(
    null
  );
  const [progress, setProgress] = useState<TranscriptionProgress | null>(null);
  const [result, setResult] = useState<TranscribeAdvancedResponse | null>(null);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);

  const handleFileSelect = (filePath: string) => {
    setSelectedFilePath(filePath);
    setTranscriptionError(null);
    setResult(null);
    setProgress(null);
  };

  const handleClear = () => {
    setSelectedFilePath(null);
    setTranscriptionError(null);
    setResult(null);
    setProgress(null);
    setStartTime(null);
    setEndTime(null);
  };

  const handleTranscribe = async () => {
    if (!selectedFilePath) return;

    setIsTranscribing(true);
    setTranscriptionError(null);
    setResult(null);
    setProgress(null);
    setStartTime(new Date().toLocaleString());
    setEndTime(null);

    try {
      const transcriptionResult = await transcribeFileAdvanced(
        selectedFilePath,
        "base",
        true,
        (progressUpdate) => {
          setProgress(progressUpdate);
        }
      );

      setResult(transcriptionResult);
      setEndTime(new Date().toLocaleString());
    } catch (error) {
      setTranscriptionError(
        error instanceof Error ? error.message : "Failed to start transcription"
      );
    } finally {
      setIsTranscribing(false);
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
          error={transcriptionError}
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
