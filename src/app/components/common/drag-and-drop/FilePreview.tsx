import { Button } from "@heroui/react";
import { IoClose, IoPlay, IoVideocam } from "react-icons/io5";
import { AiTwotoneAudio } from "react-icons/ai";
import type { TranscriptionProgress } from "@api/endpoints/transcription";
import "./FileDropzone.scss";

interface FilePreviewProps {
  filePath: string;
  onClear: () => void;
  onTranscribe: () => void;
  isTranscribing?: boolean;
  error?: string | null;
  progress?: TranscriptionProgress | null;
  startTime?: string | null;
}

export function FilePreview({
  filePath,
  onClear,
  onTranscribe,
  isTranscribing = false,
  error = null,
  progress = null,
  startTime = null,
}: FilePreviewProps) {
  // Extract file name from path
  const fileName = filePath.split(/[\\/]/).pop() || filePath;

  // Detect file type by extension
  const extension = fileName.split(".").pop()?.toLowerCase() || "";
  const audioExtensions = ["mp3", "wav", "m4a", "flac", "ogg", "aac", "wma"];
  const videoExtensions = ["mp4", "avi", "mov", "mkv", "webm", "flv"];

  const isAudio = audioExtensions.includes(extension);
  const isVideo = videoExtensions.includes(extension);

  // Format progress message
  const getProgressMessage = () => {
    if (!progress || !isTranscribing) return "Start Transcription";

    switch (progress.type) {
      case "converting":
        return progress.message;
      case "detecting_language":
        return "Detecting language...";
      case "language_detected":
        return `Language detected: ${progress.language}`;
      case "transcribing":
        return `Transcribing... ${progress.progress}%`;
      case "generating_subtitles":
        return "Generating subtitles...";
      case "complete":
        return "Complete!";
      default:
        return "Processing...";
    }
  };

  const getProgressPercentage = () => {
    if (!progress || !isTranscribing) return 0;
    if (progress.type === "transcribing") return progress.progress;
    return undefined;
  };

  return (
    <div className="file-preview">
      <div className="file-preview__header">
        <h3 className="file-preview__title">Selected File</h3>
        <Button
          isIconOnly
          size="sm"
          variant="light"
          onPress={onClear}
          aria-label="Clear file"
          isDisabled={isTranscribing}
        >
          <IoClose size={20} />
        </Button>
      </div>

      <div className="file-preview__metadata">
        <div className="file-preview__meta-item">
          <span className="file-preview__meta-label">Name:</span>
          <span className="file-preview__meta-value" title={fileName}>
            {fileName}
          </span>
        </div>
        <div className="file-preview__meta-item">
          <span className="file-preview__meta-label">Path:</span>
          <span className="file-preview__meta-value" title={filePath}>
            {filePath.length > 60 ? `...${filePath.slice(-60)}` : filePath}
          </span>
        </div>
      </div>

      <div className="file-preview__media">
        {isAudio && (
          <AiTwotoneAudio size={60} className="file-preview__audio" />
        )}
        {isVideo && <IoVideocam size={60} className="file-preview__video" />}
        {!isAudio && !isVideo && (
          <div className="file-preview__unsupported">
            <p>Preview not available for this file type</p>
          </div>
        )}
      </div>

      <div className="file-preview__actions">
        <Button
          color="primary"
          size="lg"
          onPress={onTranscribe}
          isLoading={isTranscribing}
          isDisabled={isTranscribing}
          startContent={!isTranscribing && <IoPlay size={20} />}
          className="file-preview__button-primary"
        >
          {getProgressMessage()}
        </Button>
        <Button
          variant="flat"
          size="lg"
          onPress={onClear}
          isDisabled={isTranscribing}
          className="file-preview__button-secondary"
        >
          Clear
        </Button>
      </div>

      {isTranscribing && startTime && (
        <div className="file-preview__status">
          <p className="file-preview__status-text">
            Started at: {new Date(startTime).toLocaleString()}
          </p>
          {getProgressPercentage() !== undefined && (
            <div
              className="file-preview__progress-bar"
              style={{ "--progress-width": `${getProgressPercentage()}%` } as React.CSSProperties}
            >
              <div className="file-preview__progress-fill" />
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="file-preview__error" role="alert">
          ⚠️ {error}
        </p>
      )}
    </div>
  );
}
