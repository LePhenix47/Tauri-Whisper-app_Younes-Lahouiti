import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileDropzone } from "./_components/FileDropzone";
import { FilePreview } from "./_components/FilePreview";
import { transcribeFile } from "@api/endpoints/transcription";

function TranscribePage() {
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(
    null
  );

  const handleFileSelect = (filePath: string) => {
    setSelectedFilePath(filePath);
    setTranscriptionError(null);
  };

  const handleClear = () => {
    setSelectedFilePath(null);
    setTranscriptionError(null);
  };

  const handleTranscribe = async () => {
    if (!selectedFilePath) return;

    setIsTranscribing(true);
    setTranscriptionError(null);

    try {
      const result = await transcribeFile(selectedFilePath);
      console.log("Transcription result:", result);
      alert(`Success!\n\n${result}`);
    } catch (error) {
      setTranscriptionError(
        error instanceof Error ? error.message : "Failed to start transcription"
      );
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "2rem" }}>Transcribe Audio</h1>

      {!selectedFilePath ? (
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
        />
      )}
    </div>
  );
}

export const Route = createFileRoute("/transcribe/")({
  component: TranscribePage,
});
