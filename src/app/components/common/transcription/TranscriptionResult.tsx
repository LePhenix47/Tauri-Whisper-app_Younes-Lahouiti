import { Button } from "@heroui/react";
import { IoDownload, IoRefresh } from "react-icons/io5";
import { TranscriptionPreview } from "./TranscriptionPreview";
import { downloadTextFile } from "@app/utils/fileToBlob";
import {
  calculateDurationInSeconds,
  formatVideoTimeStamp,
} from "@app/utils/timeFormat";
import "./TranscriptionResult.scss";

type TranscriptionResultProps = {
  text: string;
  subtitlesSrt: string;
  subtitlesVtt: string;
  language: string;
  startTime: string;
  endTime: string;
  mediaFilePath?: string;
  onReset: () => void;
};

export function TranscriptionResult({
  text,
  subtitlesSrt,
  subtitlesVtt,
  language,
  startTime,
  endTime,
  mediaFilePath,
  onReset,
}: TranscriptionResultProps) {
  const handleDownloadTranscript = () => {
    downloadTextFile(text, "transcription.txt", "text/plain");
  };

  const handleDownloadSrt = () => {
    downloadTextFile(subtitlesSrt, "subtitles.srt", "text/plain");
  };

  const handleDownloadVtt = () => {
    downloadTextFile(subtitlesVtt, "subtitles.vtt", "text/vtt");
  };

  // Calculate duration
  const durationInSeconds = calculateDurationInSeconds(startTime, endTime);

  const formattedDuration =
    durationInSeconds !== null
      ? formatVideoTimeStamp(durationInSeconds)
      : "N/A";

  return (
    <div className="transcription-result">
      <div className="transcription-result__header">
        <h2 className="transcription-result__title">Transcription Complete</h2>
        <Button
          variant="flat"
          size="sm"
          onPress={onReset}
          startContent={<IoRefresh size={18} />}
        >
          New Transcription
        </Button>
      </div>

      <div className="transcription-result__metadata">
        <div className="transcription-result__meta-item">
          <span className="transcription-result__meta-label">Language:</span>
          <span className="transcription-result__meta-value">{language}</span>
        </div>
        <div className="transcription-result__meta-item">
          <span className="transcription-result__meta-label">Started:</span>
          <span className="transcription-result__meta-value">
            {new Date(startTime).toLocaleString()}
          </span>
        </div>
        <div className="transcription-result__meta-item">
          <span className="transcription-result__meta-label">Completed:</span>
          <span className="transcription-result__meta-value">
            {new Date(endTime).toLocaleString()}
          </span>
        </div>
        <div className="transcription-result__meta-item">
          <span className="transcription-result__meta-label">Duration:</span>
          <span className="transcription-result__meta-value">
            {formattedDuration}
          </span>
        </div>
      </div>

      {/* Media Preview with Subtitles */}
      {mediaFilePath && (
        <TranscriptionPreview
          mediaFilePath={mediaFilePath}
          subtitlesVtt={subtitlesVtt}
          language={language}
        />
      )}

      <div className="transcription-result__content">
        <label
          className="transcription-result__section-title"
          htmlFor="transcription-result"
        >
          Transcription
        </label>
        <div className="transcription-result__text-box">
          <textarea
            className="transcription-result__text"
            value={text}
            id="transcription-result"
            readOnly
          ></textarea>
        </div>
      </div>

      <div className="transcription-result__actions">
        <Button
          color="primary"
          size="lg"
          onPress={handleDownloadSrt}
          startContent={<IoDownload size={20} />}
        >
          Download SRT
        </Button>
        <Button
          color="primary"
          variant="flat"
          size="lg"
          onPress={handleDownloadVtt}
          startContent={<IoDownload size={20} />}
        >
          Download VTT
        </Button>
        <Button
          variant="bordered"
          size="lg"
          onPress={handleDownloadTranscript}
          startContent={<IoDownload size={20} />}
        >
          Download Text
        </Button>
      </div>
    </div>
  );
}
