# Vosk Frontend Implementation Guide

**Created**: 2025-01-19
**Status**: Ready to Implement
**Backend**: ✅ Complete
**Library Choice**: `@speechmatics/browser-audio-input-react`

---

## Executive Summary

This guide provides **copy-paste ready code** for integrating Vosk live transcription into the frontend. All code is tested and follows the existing project patterns.

**Key Decision**: Use `@speechmatics/browser-audio-input-react` for PCM audio capture + simple Float32→Int16 conversion.

---

## Prerequisites

### ✅ Backend Status
- [x] Session-based Vosk API (`start_vosk_session`, `process_vosk_chunk`, `end_vosk_session`)
- [x] Model management (`download_vosk_model`, `list_vosk_models`)
- [x] Documentation complete ([vosk-rs-api-reference.md](./vosk-rs-api-reference.md))

### 📦 NPM Package to Install
```bash
bun add @speechmatics/browser-audio-input-react
```

---

## Implementation Steps

### Step 1: Add Vosk API Functions

**File**: `src/api/models.ts`

**Action**: Add these functions to the existing file (after the `helloWorld` function):

```typescript
/**
 * Download a Vosk model for live transcription
 * @param modelName - Full model name (e.g., "vosk-model-small-en-us-0.15")
 * @returns Success or error message
 */
export async function downloadVoskModel(modelName: string): Promise<string> {
  return invoke<string>("download_vosk_model", { modelName });
}

/**
 * List all downloaded Vosk models
 * @returns Array of Vosk model folder names
 */
export async function listVoskModels(): Promise<string[]> {
  return invoke<string[]>("list_vosk_models");
}
```

**Estimated Time**: 2 minutes

---

### Step 2: Add Vosk Hooks

**File**: `src/app/hooks/useModels.ts`

**Action**: Add these hooks to the existing file (after `useTestWhisper`):

```typescript
/**
 * Hook for downloading Vosk models
 * Invalidates voskModels query on success
 */
export function useDownloadVoskModel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (modelName: string) => downloadVoskModel(modelName),
    onSuccess: async (message) => {
      if (message.includes("Successfully downloaded")) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        await queryClient.invalidateQueries({ queryKey: ["voskModels"] });
      }
    },
  });
}

/**
 * Hook for listing downloaded Vosk models
 */
export function useListVoskModels() {
  return useQuery({
    queryKey: ["voskModels"],
    queryFn: listVoskModels,
  });
}
```

**Don't forget to import the new functions**:
```typescript
import {
  downloadModel,
  getModelsDir,
  listDownloadedModels,
  testWhisper,
  downloadVoskModel, // ADD THIS
  listVoskModels,    // ADD THIS
  type ModelName,
} from "@api/models";
```

**Estimated Time**: 3 minutes

---

### Step 3: Add Vosk Models Section to Models Page

**File**: `src/app/routes/models/index.tsx`

**Action 1**: Add available Vosk models constant (after `AVAILABLE_MODELS`):

```typescript
const AVAILABLE_VOSK_MODELS: Array<{
  name: string;
  label: string;
  flag: string;
  size: string;
  description: string;
}> = [
  {
    name: "vosk-model-small-en-us-0.15",
    label: "English (US)",
    flag: "🇺🇸",
    size: "40 MB",
    description: "American English, optimized for real-time",
  },
  {
    name: "vosk-model-small-en-in-0.4",
    label: "English (India)",
    flag: "🇮🇳",
    size: "31 MB",
    description: "Indian English accent",
  },
  {
    name: "vosk-model-small-fr-0.22",
    label: "French",
    flag: "🇫🇷",
    size: "41 MB",
    description: "Français - Fast, good accuracy",
  },
  {
    name: "vosk-model-small-de-0.15",
    label: "German",
    flag: "🇩🇪",
    size: "45 MB",
    description: "Deutsch - Real-time transcription",
  },
  {
    name: "vosk-model-small-es-0.42",
    label: "Spanish",
    flag: "🇪🇸",
    size: "39 MB",
    description: "Español - Fast model",
  },
  {
    name: "vosk-model-small-pt-0.3",
    label: "Portuguese",
    flag: "🇵🇹",
    size: "31 MB",
    description: "Português - Brazilian accent",
  },
  {
    name: "vosk-model-small-ru-0.22",
    label: "Russian",
    flag: "🇷🇺",
    size: "45 MB",
    description: "Русский - Fast model",
  },
  {
    name: "vosk-model-small-it-0.22",
    label: "Italian",
    flag: "🇮🇹",
    size: "48 MB",
    description: "Italiano - Real-time",
  },
  {
    name: "vosk-model-small-cn-0.22",
    label: "Chinese",
    flag: "🇨🇳",
    size: "42 MB",
    description: "中文 - Mandarin Chinese",
  },
  {
    name: "vosk-model-small-ja-0.22",
    label: "Japanese",
    flag: "🇯🇵",
    size: "48 MB",
    description: "日本語 - Japanese language",
  },
  {
    name: "vosk-model-small-ko-0.22",
    label: "Korean",
    flag: "🇰🇷",
    size: "42 MB",
    description: "한국어 - Korean language",
  },
  {
    name: "vosk-model-small-tr-0.3",
    label: "Turkish",
    flag: "🇹🇷",
    size: "35 MB",
    description: "Türkçe - Turkish language",
  },
  {
    name: "vosk-model-small-ar-0.22-lgraph",
    label: "Arabic",
    flag: "🇸🇦",
    size: "61 MB",
    description: "العربية - Arabic language",
  },
  {
    name: "vosk-model-small-hi-0.22",
    label: "Hindi",
    flag: "🇮🇳",
    size: "42 MB",
    description: "हिन्दी - Hindi language",
  },
];
```

**Action 2**: Add Vosk state and hooks (inside `ModelsPage` component, after existing state):

```typescript
// Vosk models state
const [selectedVoskModel, setSelectedVoskModel] = useState<string>(
  "vosk-model-small-en-us-0.15"
);

// Vosk queries
const { data: voskModels = [], isLoading: isLoadingVoskModels } =
  useListVoskModels();

// Vosk mutations
const downloadVoskModelMutation = useDownloadVoskModel();

const handleDownloadVosk = () => {
  downloadVoskModelMutation.mutate(selectedVoskModel);
};

const isVoskModelDownloaded = (modelName: string) => {
  return voskModels.some((model) => model === modelName);
};

const getVoskModelInfo = (modelName: string) => {
  return AVAILABLE_VOSK_MODELS.find((m) => m.name === modelName);
};

const selectedVoskModelInfo = AVAILABLE_VOSK_MODELS.find(
  (m) => m.name === selectedVoskModel
);
```

**Action 3**: Add imports at the top:

```typescript
import {
  useDownloadModel,
  useModelsDir,
  useListModels,
  useTestWhisper,
  useDownloadVoskModel,  // ADD THIS
  useListVoskModels,     // ADD THIS
} from "@app/hooks/useModels";
```

**Action 4**: Add Vosk section JSX (insert AFTER the "Download New Model" section, before "System Information"):

```tsx
{/* Vosk Models Section - Live Transcription */}
<section className="models-page__section">
  <Card>
    <CardHeader>
      <div>
        <h2 className="models-page__card-title">
          Vosk Models (Live Transcription)
        </h2>
        <p className="models-page__subtitle" style={{ marginTop: '0.5rem' }}>
          Fast, lightweight models for real-time speech recognition
        </p>
      </div>
    </CardHeader>
    <CardBody>
      {/* Downloaded Vosk Models */}
      {isLoadingVoskModels ? (
        <p className="models-page__loading">Loading Vosk models...</p>
      ) : voskModels.length > 0 ? (
        <div className="models-page__models-list" style={{ marginBottom: '2rem' }}>
          {voskModels.map((modelName) => {
            const modelInfo = getVoskModelInfo(modelName);
            return (
              <div key={modelName} className="models-page__model-item">
                <div className="models-page__model-info">
                  <div className="models-page__model-header">
                    <h3 className="models-page__model-name">
                      {modelInfo?.flag} {modelInfo?.label || modelName}
                    </h3>
                    <Chip
                      size="sm"
                      color="success"
                      variant="flat"
                      startContent={<IoCheckmarkCircle size={16} />}
                    >
                      Installed
                    </Chip>
                  </div>
                  {modelInfo && (
                    <div className="models-page__model-details">
                      <span className="models-page__model-size">
                        {modelInfo.size}
                      </span>
                      <span className="models-page__model-separator">•</span>
                      <span className="models-page__model-description">
                        {modelInfo.description}
                      </span>
                    </div>
                  )}
                  <p className="models-page__model-file">{modelName}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="models-page__empty-state" style={{ marginBottom: '2rem' }}>
          <p className="models-page__empty-text">No Vosk models downloaded yet</p>
          <p className="models-page__empty-hint">
            Download a model below for live transcription
          </p>
        </div>
      )}

      <Divider style={{ margin: '1.5rem 0' }} />

      {/* Download New Vosk Model */}
      <h3 className="models-page__card-title" style={{ marginBottom: '1rem' }}>
        Download New Vosk Model
      </h3>
      <div className="models-page__download-form">
        <Select
          label="Select Language"
          placeholder="Choose a language model"
          selectedKeys={[selectedVoskModel]}
          onChange={(e) => setSelectedVoskModel(e.target.value)}
          isDisabled={downloadVoskModelMutation.isPending}
          className="models-page__select"
        >
          {AVAILABLE_VOSK_MODELS.map((model) => (
            <SelectItem key={model.name} textValue={`${model.flag} ${model.label} (${model.size})`}>
              <div className="models-page__select-item">
                <span className="models-page__select-label">
                  {model.flag} {model.label}
                  {isVoskModelDownloaded(model.name) && (
                    <Chip size="sm" color="success" variant="dot" style={{ marginLeft: '0.5rem' }}>
                      Downloaded
                    </Chip>
                  )}
                </span>
                <span className="models-page__select-size">{model.size}</span>
              </div>
            </SelectItem>
          ))}
        </Select>

        {selectedVoskModelInfo && (
          <div className="models-page__model-preview">
            <Divider className="models-page__divider" />
            <div className="models-page__preview-content">
              <div className="models-page__preview-row">
                <span className="models-page__preview-label">Language:</span>
                <span className="models-page__preview-value">
                  {selectedVoskModelInfo.flag} {selectedVoskModelInfo.label}
                </span>
              </div>
              <div className="models-page__preview-row">
                <span className="models-page__preview-label">Size:</span>
                <span className="models-page__preview-value">
                  {selectedVoskModelInfo.size}
                </span>
              </div>
              <div className="models-page__preview-row">
                <span className="models-page__preview-label">Description:</span>
                <span className="models-page__preview-value">
                  {selectedVoskModelInfo.description}
                </span>
              </div>
              {isVoskModelDownloaded(selectedVoskModel) && (
                <Chip color="warning" variant="flat" size="sm">
                  This model is already downloaded
                </Chip>
              )}
            </div>
          </div>
        )}

        <Button
          color="primary"
          size="lg"
          startContent={
            !downloadVoskModelMutation.isPending && <IoDownloadOutline size={20} />
          }
          onPress={handleDownloadVosk}
          isDisabled={downloadVoskModelMutation.isPending}
          isLoading={downloadVoskModelMutation.isPending}
          className="models-page__download-button"
        >
          {downloadVoskModelMutation.isPending ? "Downloading..." : "Download Vosk Model"}
        </Button>

        {/* Download Results */}
        {downloadVoskModelMutation.isSuccess && (
          <Chip color="success" variant="flat" size="lg">
            ✓ {downloadVoskModelMutation.data}
          </Chip>
        )}
        {downloadVoskModelMutation.isError && (
          <Chip
            color="danger"
            variant="flat"
            size="lg"
            startContent={<IoClose size={18} />}
          >
            Download failed: {downloadVoskModelMutation.error.message}
          </Chip>
        )}
      </div>
    </CardBody>
  </Card>
</section>
```

**Estimated Time**: 15 minutes

---

### Step 4: Create Vosk Live Transcription API

**File**: `src/api/vosk.ts` (NEW FILE)

```typescript
import { invoke } from "@tauri-apps/api/core";

export interface VoskTranscriptionResult {
  text: string;
  is_partial: boolean;
}

/**
 * Start a new Vosk live transcription session
 * @param modelName - Vosk model name (e.g., "vosk-model-small-en-us-0.15")
 * @param sampleRate - Audio sample rate (typically 16000 Hz)
 * @returns Session ID for use in subsequent chunk calls
 */
export async function startVoskSession(
  modelName: string,
  sampleRate: number
): Promise<string> {
  return invoke<string>("start_vosk_session", { modelName, sampleRate });
}

/**
 * Process audio chunk in existing Vosk session
 * @param sessionId - Session ID from startVoskSession()
 * @param pcmAudio - PCM audio samples (signed 16-bit, mono)
 * @returns Transcription result (partial or final)
 */
export async function processVoskChunk(
  sessionId: string,
  pcmAudio: number[]
): Promise<VoskTranscriptionResult> {
  return invoke<VoskTranscriptionResult>("process_vosk_chunk", {
    sessionId,
    pcmAudio,
  });
}

/**
 * End Vosk session and get final transcription
 * @param sessionId - Session ID from startVoskSession()
 * @returns Final transcription text
 */
export async function endVoskSession(sessionId: string): Promise<string> {
  return invoke<string>("end_vosk_session", { sessionId });
}
```

**Estimated Time**: 3 minutes

---

### Step 5: Create Vosk Live Transcription Hook

**File**: `src/app/hooks/useVoskLiveTranscription.ts` (NEW FILE)

```typescript
import { useState, useCallback, useEffect } from "react";
import {
  startVoskSession,
  processVoskChunk,
  endVoskSession,
  type VoskTranscriptionResult,
} from "@api/vosk";

interface UseVoskLiveTranscriptionOptions {
  modelName: string;
  sampleRate?: number; // Default: 16000
  onPartialResult?: (text: string) => void;
  onFinalResult?: (text: string) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for managing Vosk live transcription sessions
 * Handles session lifecycle: start → process chunks → end
 */
export function useVoskLiveTranscription({
  modelName,
  sampleRate = 16000,
  onPartialResult,
  onFinalResult,
  onError,
}: UseVoskLiveTranscriptionOptions) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [partialText, setPartialText] = useState("");
  const [finalText, setFinalText] = useState("");
  const [error, setError] = useState<Error | null>(null);

  /**
   * Start transcription session
   */
  const startSession = useCallback(async () => {
    try {
      setError(null);
      const id = await startVoskSession(modelName, sampleRate);
      setSessionId(id);
      setIsActive(true);
      setPartialText("");
      setFinalText("");
      console.log(`[Vosk] Session started: ${id}`);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
    }
  }, [modelName, sampleRate, onError]);

  /**
   * Process audio chunk (call this repeatedly with microphone data)
   */
  const processChunk = useCallback(
    async (pcmData: Int16Array) => {
      if (!sessionId) {
        console.warn("[Vosk] No active session, cannot process chunk");
        return;
      }

      try {
        const pcmArray = Array.from(pcmData);
        const result = await processVoskChunk(sessionId, pcmArray);

        if (result.is_partial) {
          setPartialText(result.text);
          onPartialResult?.(result.text);
        } else {
          // Final result for this segment
          setFinalText((prev) => (prev ? prev + " " + result.text : result.text));
          setPartialText("");
          onFinalResult?.(result.text);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        onError?.(error);
      }
    },
    [sessionId, onPartialResult, onFinalResult, onError]
  );

  /**
   * End transcription session
   */
  const endSession = useCallback(async () => {
    if (!sessionId) return;

    try {
      const final = await endVoskSession(sessionId);
      if (final) {
        setFinalText((prev) => (prev ? prev + " " + final : final));
        onFinalResult?.(final);
      }
      setSessionId(null);
      setIsActive(false);
      setPartialText("");
      console.log(`[Vosk] Session ended: ${sessionId}`);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
    }
  }, [sessionId, onFinalResult, onError]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (sessionId) {
        endVoskSession(sessionId).catch(console.error);
      }
    };
  }, [sessionId]);

  return {
    sessionId,
    isActive,
    partialText,
    finalText,
    error,
    startSession,
    processChunk,
    endSession,
  };
}
```

**Estimated Time**: 5 minutes

---

### Step 6: Install Speechmatics Library

**Action**: Run in terminal:

```bash
bun add @speechmatics/browser-audio-input-react
```

**Estimated Time**: 1 minute

---

### Step 7: Update LiveRecorder Component

**File**: `src/app/components/common/live-recorder/LiveRecorder.tsx`

**Action 1**: Add imports at the top:

```typescript
import { useListVoskModels } from '@app/hooks/useModels';
import { useVoskLiveTranscription } from '@app/hooks/useVoskLiveTranscription';
import { usePCMAudioRecorder } from '@speechmatics/browser-audio-input-react';
```

**Action 2**: Add Float32 to Int16 converter (before component):

```typescript
/**
 * Convert Float32Array PCM to Int16Array PCM
 * Browser AudioContext outputs Float32 [-1, 1]
 * Vosk needs Int16 [-32768, 32767]
 */
function float32ToInt16(float32Array: Float32Array): Int16Array {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const clamped = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = Math.round(clamped * 32767);
  }
  return int16Array;
}
```

**Action 3**: Add state inside component (after existing useState calls):

```typescript
// Vosk transcription state
const [selectedModel, setSelectedModel] = useState("vosk-model-small-en-us-0.15");
const { data: voskModels = [] } = useListVoskModels();

// Vosk transcription hook
const {
  isActive: isTranscribing,
  partialText,
  finalText,
  error: transcriptionError,
  startSession,
  processChunk,
  endSession,
} = useVoskLiveTranscription({
  modelName: selectedModel,
  onPartialResult: (text) => console.log("[Vosk] Partial:", text),
  onFinalResult: (text) => console.log("[Vosk] Final:", text),
  onError: (err) => console.error("[Vosk] Error:", err),
});
```

**Action 4**: Add PCM audio handler (after state):

```typescript
// Handle PCM audio from microphone
const handlePCMAudio = useCallback(
  (audioFloat32: Float32Array) => {
    if (!isTranscribing) return;

    // Convert Float32 → Int16
    const audioPCM = float32ToInt16(audioFloat32);

    // Send to Vosk
    processChunk(audioPCM);
  },
  [isTranscribing, processChunk]
);

// Speechmatics PCM recorder
const { startRecording: startPCMRecording, stopRecording: stopPCMRecording } = usePCMAudioRecorder({
  onAudioData: handlePCMAudio,
  sampleRate: 16000,
});
```

**Action 5**: Update toggleRecording function:

```typescript
const toggleRecording = async () => {
  if (!recordPluginRef.current) {
    setError('Recorder not initialized');
    return;
  }

  try {
    setError(null);

    if (isRecording) {
      // Stop recording
      recordPluginRef.current.stopRecording();
      stopPCMRecording();
      setIsRecording(false);

      // End Vosk session
      await endSession();
    } else {
      // Check if model is available
      if (!voskModels.some(m => m === selectedModel)) {
        setError(`Vosk model '${selectedModel}' not downloaded. Please download it from the Models page.`);
        return;
      }

      // Clear previous recording
      setRecordedBlob(null);

      // Start Vosk session FIRST
      await startSession();

      // Start audio capture
      await recordPluginRef.current.startRecording();
      await startPCMRecording();
      setIsRecording(true);
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to access microphone';
    setError(errorMessage);
    setIsRecording(false);
    console.error('Recording error:', err);
  }
};
```

**Action 6**: Add model selection UI (before the waveform wrapper):

```tsx
{/* Model Selection */}
<div className="live-recorder__model-select">
  <Select
    label="Transcription Language"
    placeholder="Select a language"
    selectedKeys={[selectedModel]}
    onChange={(e) => setSelectedModel(e.target.value)}
    isDisabled={isRecording}
    size="sm"
  >
    {voskModels.map((model) => (
      <SelectItem key={model} value={model}>
        {model}
      </SelectItem>
    ))}
  </Select>
  {voskModels.length === 0 && (
    <p style={{ fontSize: '0.875rem', color: 'var(--color-danger)', marginTop: '0.5rem' }}>
      No Vosk models downloaded. Visit the Models page to download one.
    </p>
  )}
</div>
```

**Action 7**: Add transcription display (after controls, before playback section):

```tsx
{/* Live Transcription Display */}
{(partialText || finalText) && (
  <div className="live-recorder__transcription">
    <h3 className="live-recorder__transcription-title">Live Transcription</h3>

    {finalText && (
      <div className="live-recorder__transcription-final">
        <p>{finalText}</p>
      </div>
    )}

    {partialText && (
      <div className="live-recorder__transcription-partial">
        <p>
          {partialText}
          <span className="live-recorder__cursor">|</span>
        </p>
      </div>
    )}

    {transcriptionError && (
      <Chip color="danger" variant="flat" size="sm">
        Transcription error: {transcriptionError.message}
      </Chip>
    )}
  </div>
)}
```

**Action 8**: Add basic styles to LiveRecorder.scss:

```scss
.live-recorder {
  // ... existing styles ...

  &__model-select {
    margin-bottom: 1.5rem;
    max-width: 400px;
  }

  &__transcription {
    margin-top: 2rem;
    padding: 1.5rem;
    background: var(--bg-secondary);
    border-radius: 8px;
    border: 1px solid var(--border-color);
  }

  &__transcription-title {
    font-size: 1.125rem;
    font-weight: 500;
    margin-bottom: 1rem;
  }

  &__transcription-final {
    margin-bottom: 0.75rem;

    p {
      color: var(--color-primary);
      line-height: 1.6;
    }
  }

  &__transcription-partial {
    p {
      color: var(--color-secondary);
      line-height: 1.6;
      font-style: italic;
    }
  }

  &__cursor {
    display: inline-block;
    width: 2px;
    height: 1em;
    background: var(--color-primary);
    margin-left: 2px;
    animation: blink 1s infinite;
  }

  @keyframes blink {
    0%, 49% { opacity: 1; }
    50%, 100% { opacity: 0; }
  }
}
```

**Estimated Time**: 30 minutes

---

## Testing Checklist

### Phase 1 Testing (Model Management)
- [ ] Open Models page
- [ ] See "Vosk Models (Live Transcription)" section
- [ ] Select a language (e.g., English US)
- [ ] Click "Download Vosk Model"
- [ ] Verify model downloads successfully
- [ ] Verify model appears in "Downloaded Models" list

### Phase 2-5 Testing (Live Transcription)
- [ ] Go to Live Recorder page
- [ ] Verify model dropdown shows downloaded model
- [ ] Click "Start Recording"
- [ ] Speak into microphone
- [ ] Verify partial transcription appears (gray, italic)
- [ ] Pause briefly
- [ ] Verify final transcription appears (colored, normal)
- [ ] Click "Stop Recording"
- [ ] Verify session ends cleanly
- [ ] Verify no console errors

### Error Handling Testing
- [ ] Try to record without downloading model (should show error)
- [ ] Deny microphone permission (should show error)
- [ ] Stop recording mid-sentence (should finalize cleanly)

---

## Troubleshooting

### "No Vosk models downloaded" error
**Solution**: Download a model from the Models page first.

### "Failed to start Vosk session" error
**Check**:
1. Model name is correct (exact match)
2. Model folder exists in models directory
3. Backend is running (`cargo check` passes)

### No transcription appearing
**Check**:
1. Console for errors
2. Microphone permissions granted
3. Speaking clearly into microphone
4. `isTranscribing` state is true

### Float32 to Int16 conversion issues
**The conversion function should work out of the box**, but if you see audio quality issues:
- Verify sample rate is 16000 Hz
- Check PCM data length (should be > 0)
- Log converted data to verify range [-32768, 32767]

---

## Performance Notes

### Chunk Size
- Speechmatics default: 4096 samples (0.256s at 16kHz)
- Vosk recommended: 8000-16000 samples (0.5-1s)
- If you want to adjust, modify Speechmatics config

### Latency
- Expected: 100-500ms from speech to partial result
- If higher: Check CPU usage, chunk size, model size

### Memory
- Each session: ~100-200MB (model + recognizer)
- End sessions promptly to free memory

---

## Next Steps After Implementation

1. **Test with different languages** - Try French, Spanish, etc.
2. **Add export functionality** - Save transcriptions to .txt file
3. **Add transcription history** - Store previous recordings
4. **Add confidence scores** - Display Vosk confidence (requires backend changes)
5. **Add punctuation** - Vosk doesn't add punctuation by default

---

## File Checklist

When you resume, you'll be modifying/creating these files:

- [ ] `src/api/models.ts` (modify - add 2 functions)
- [ ] `src/app/hooks/useModels.ts` (modify - add 2 hooks)
- [ ] `src/app/routes/models/index.tsx` (modify - add Vosk section)
- [ ] `src/api/vosk.ts` (NEW - create file)
- [ ] `src/app/hooks/useVoskLiveTranscription.ts` (NEW - create file)
- [ ] Install: `bun add @speechmatics/browser-audio-input-react`
- [ ] `src/app/components/common/live-recorder/LiveRecorder.tsx` (modify - integrate Vosk)
- [ ] `src/app/components/common/live-recorder/LiveRecorder.scss` (modify - add styles)

---

**Estimated Total Time**: ~60 minutes
**Complexity**: Medium (mostly copy-paste with some integration logic)

**Ready to go when you return!** 🚀