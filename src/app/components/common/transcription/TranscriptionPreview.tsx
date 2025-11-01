import { useEffect, useState } from "react";
import { Spinner } from "@heroui/react";
import { IoWarning } from "react-icons/io5";
import {
  pathToMediaUrl,
  getMediaType,
  subtitleTextToUrl,
  revokeBlobUrls,
} from "@app/utils/fileToBlob";
import "./TranscriptionPreview.scss";

type TranscriptionPreviewProps = {
  /** Original media file path */
  mediaFilePath: string;
  /** VTT subtitle content */
  subtitlesVtt: string;
  /** Detected language code (e.g., "en", "fr") */
  language: string;
};

export function TranscriptionPreview({
  mediaFilePath,
  subtitlesVtt,
  language,
}: TranscriptionPreviewProps) {
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [subtitleUrl, setSubtitleUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"video" | "audio">("video");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadMedia() {
      try {
        setIsLoading(true);
        setError(null);

        // Determine media type
        const type = getMediaType(mediaFilePath);
        setMediaType(type);

        // Convert file path to blob URL
        const url = await pathToMediaUrl(mediaFilePath);
        if (!isMounted) {
          URL.revokeObjectURL(url);
          return;
        }
        setMediaUrl(url);

        // Convert subtitle text to blob URL
        const subUrl = subtitleTextToUrl(subtitlesVtt, "vtt");
        if (!isMounted) {
          URL.revokeObjectURL(subUrl);
          return;
        }
        setSubtitleUrl(subUrl);
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load media preview"
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadMedia();

    // Cleanup: revoke blob URLs on unmount
    return () => {
      isMounted = false;
      if (mediaUrl || subtitleUrl) {
        revokeBlobUrls([mediaUrl, subtitleUrl].filter(Boolean) as string[]);
      }
    };
  }, [mediaFilePath, subtitlesVtt]);

  // Early return: Loading state
  if (isLoading) {
    return (
      <div className="transcription-preview transcription-preview--loading">
        <Spinner size="lg" label="Loading media preview..." />
      </div>
    );
  }

  // Early return: Error state
  if (error) {
    return (
      <div className="transcription-preview transcription-preview--error">
        <p className="transcription-preview__error-message">
          <IoWarning size={20} /> {error}
        </p>
        <p className="transcription-preview__error-hint">
          The media file may have been moved or deleted.
        </p>
      </div>
    );
  }

  // Early return: Invalid URLs
  if (!mediaUrl || !subtitleUrl) {
    return null;
  }

  // Determine hint message
  const hintMessage =
    mediaType === "video"
      ? "Subtitles are enabled by default. Use the CC button to toggle them."
      : "Audio preview with synchronized subtitles below.";

  return (
    <div className="transcription-preview">
      <h3 className="transcription-preview__title">Media Preview</h3>
      <div className="transcription-preview__player-wrapper">
        {mediaType === "video" && (
          <video
            className="transcription-preview__video"
            src={mediaUrl}
            controls
            crossOrigin="anonymous"
          >
            <track
              src={subtitleUrl}
              kind="subtitles"
              srcLang={language}
              label={`Subtitles (${language.toUpperCase()})`}
              default
            />
            Your browser does not support video playback.
          </video>
        )}

        {mediaType === "audio" && (
          <audio
            className="transcription-preview__audio"
            src={mediaUrl}
            controls
            crossOrigin="anonymous"
          >
            Your browser does not support audio playback.
          </audio>
        )}
      </div>
      <p className="transcription-preview__hint">{hintMessage}</p>
    </div>
  );
}
