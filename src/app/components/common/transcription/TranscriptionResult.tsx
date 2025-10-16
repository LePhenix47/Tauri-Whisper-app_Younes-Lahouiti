import { Button } from "@heroui/react";
import { IoDownload, IoRefresh } from "react-icons/io5";
import "./TranscriptionResult.scss";

interface TranscriptionResultProps {
  text: string;
  subtitlesSrt: string;
  subtitlesVtt: string;
  language: string;
  startTime: string;
  endTime: string;
  onReset: () => void;
}

export function TranscriptionResult({
  text,
  subtitlesSrt,
  subtitlesVtt,
  language,
  startTime,
  endTime,
  onReset,
}: TranscriptionResultProps) {
  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

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
          <span className="transcription-result__meta-value">{startTime}</span>
        </div>
        <div className="transcription-result__meta-item">
          <span className="transcription-result__meta-label">Completed:</span>
          <span className="transcription-result__meta-value">{endTime}</span>
        </div>
      </div>

      <div className="transcription-result__content">
        <h3 className="transcription-result__section-title">Transcription</h3>
        <div className="transcription-result__text-box">
          <p className="transcription-result__text">{text}</p>
        </div>
      </div>

      <div className="transcription-result__actions">
        <Button
          color="primary"
          size="lg"
          onPress={() => handleDownload(subtitlesSrt, "subtitles.srt")}
          startContent={<IoDownload size={20} />}
        >
          Download SRT
        </Button>
        <Button
          color="primary"
          variant="flat"
          size="lg"
          onPress={() => handleDownload(subtitlesVtt, "subtitles.vtt")}
          startContent={<IoDownload size={20} />}
        >
          Download VTT
        </Button>
        <Button
          variant="bordered"
          size="lg"
          onPress={() => handleDownload(text, "transcription.txt")}
          startContent={<IoDownload size={20} />}
        >
          Download Text
        </Button>
      </div>
    </div>
  );
}
