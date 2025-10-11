import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { open } from "@tauri-apps/api/dialog";
import "./FileDropzone.scss";

interface FileDropzoneProps {
  onFileSelect: (filePath: string) => void;
  disabled?: boolean;
}

export function FileDropzone({
  onFileSelect,
  disabled = false,
}: FileDropzoneProps) {
  const [error, setError] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  useEffect(() => {
    if (disabled) return;

    // Listen for Tauri file drop events
    const setupListeners = async () => {
      const unlistenDrop = await listen<string[]>(
        "tauri://file-drop",
        (event) => {
          setError(null);
          const filePaths = event.payload;

          if (filePaths.length > 0) {
            // Validate file type by extension
            const validExtensions = [
              ".mp3",
              ".wav",
              ".m4a",
              ".flac",
              ".ogg",
              ".aac",
              ".wma",
              ".mp4",
              ".avi",
              ".mov",
              ".mkv",
              ".webm",
              ".flv",
            ];

            const validFiles = filePaths.filter((path) =>
              validExtensions.some((ext) => path.toLowerCase().endsWith(ext))
            );

            if (validFiles.length === 0) {
              setError("Please select an audio or video file");
              return;
            }

            // If multiple files, just take the first one
            console.log(validFiles);

            onFileSelect(validFiles[0]);
          }
        }
      );

      const unlistenHover = await listen("tauri://file-drop-hover", () => {
        setIsDragActive(true);
      });

      const unlistenCancelled = await listen(
        "tauri://file-drop-cancelled",
        () => {
          setIsDragActive(false);
        }
      );

      return () => {
        unlistenDrop();
        unlistenHover();
        unlistenCancelled();
      };
    };

    const cleanup = setupListeners();
    return () => {
      cleanup.then((fn) => fn && fn());
    };
  }, [disabled, onFileSelect]);

  const handleClick = async () => {
    if (disabled) return;

    try {
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: "Audio/Video",
            extensions: [
              "mp3",
              "wav",
              "m4a",
              "flac",
              "ogg",
              "aac",
              "wma",
              "mp4",
              "avi",
              "mov",
              "mkv",
              "webm",
              "flv",
            ],
          },
        ],
      });

      if (selected && typeof selected === "string") {
        setError(null);
        onFileSelect(selected);
      }
    } catch (err) {
      setError("Failed to open file dialog");
      console.error("File dialog error:", err);
    }
  };

  const dropzoneClasses = [
    "file-dropzone",
    isDragActive ? "file-dropzone--drag-active" : "",
    disabled ? "file-dropzone--disabled" : "",
    error ? "file-dropzone--error" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="file-dropzone-wrapper">
      <div
        className={dropzoneClasses}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        aria-label="File dropzone for audio and video files"
        tabIndex={disabled ? -1 : 0}
        role="button"
      >
        <div className="file-dropzone__content">
          {isDragActive ? (
            <>
              <div className="file-dropzone__icon">📂</div>
              <p className="file-dropzone__text">Drop files here...</p>
            </>
          ) : (
            <>
              <div className="file-dropzone__icon">🎵</div>
              <p className="file-dropzone__text">
                Drag & drop audio/video files here, or click to select
              </p>
              <p className="file-dropzone__hint">
                Supports MP3, WAV, MP4, and more
              </p>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="file-dropzone__error" role="alert">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}
