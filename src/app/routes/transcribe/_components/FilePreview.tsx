import { Button } from "@heroui/react";
import { IoClose, IoPlay } from "react-icons/io5";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import "./FileDropzone.scss";

interface FilePreviewProps {
  filePath: string;
  onClear: () => void;
  onTranscribe: () => void;
  isTranscribing?: boolean;
  error?: string | null;
}

export function FilePreview({
  filePath,
  onClear,
  onTranscribe,
  isTranscribing = false,
  error = null,
}: FilePreviewProps) {
  // Convert file system path to asset URL that Tauri can serve
  const fileUrl = convertFileSrc(filePath);

  // Extract file name from path
  const fileName = filePath.split(/[\\/]/).pop() || filePath;

  // Detect file type by extension
  const extension = fileName.split(".").pop()?.toLowerCase() || "";
  const audioExtensions = ["mp3", "wav", "m4a", "flac", "ogg", "aac", "wma"];
  const videoExtensions = ["mp4", "avi", "mov", "mkv", "webm", "flv"];

  const isAudio = audioExtensions.includes(extension);
  const isVideo = videoExtensions.includes(extension);

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
          <audio controls className="file-preview__audio">
            <source src={fileUrl} />
            Your browser does not support audio playback.
          </audio>
        )}
        {isVideo && (
          <video controls className="file-preview__video">
            <source src={fileUrl} />
            Your browser does not support video playback.
          </video>
        )}
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
          {isTranscribing ? "Transcribing..." : "Start Transcription"}
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

      {error && (
        <div className="file-preview__error" role="alert">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}
