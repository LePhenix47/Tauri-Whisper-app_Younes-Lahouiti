# Vosk Frontend Integration Plan

**Created**: 2025-01-19
**Status**: Planning Phase
**Backend**: ✅ Complete (session-based API ready)
**Frontend**: ⏳ Pending Implementation

---

## Overview

The Vosk backend is now complete with a session-based architecture. This document outlines what needs to be implemented on the frontend to enable live speech-to-text transcription using Vosk.

---

## Current State Analysis

### ✅ What We Have (Backend)

**Tauri Commands:**
- `start_vosk_session(model_name: String, sample_rate: f32) -> Result<String, String>`
  - Creates a new Vosk session
  - Returns session ID (e.g., `"vosk-1"`)
- `process_vosk_chunk(session_id: String, pcm_audio: Vec<i16>) -> Result<VoskTranscriptionResult, String>`
  - Processes audio chunk in existing session
  - Returns `{ text: string, is_partial: bool }`
- `end_vosk_session(session_id: String) -> Result<String, String>`
  - Finalizes session and returns final transcription
- `download_vosk_model(model_name: String) -> Result<String, String>`
  - Downloads Vosk model from alphacephei.com
- `list_vosk_models() -> Result<Vec<String>, String>`
  - Lists downloaded Vosk models

**Architecture:**
- Session-based (not chunk-based) - maintains recognizer state across chunks
- Supports partial results (real-time feedback) and final results (high accuracy)
- Language-specific models (40+ languages)
- Model reuse for performance

### ✅ What We Have (Frontend)

**Existing Components:**
- [LiveRecorder.tsx](../src/app/components/common/live-recorder/LiveRecorder.tsx) - Recording UI with WaveSurfer
  - ✅ Recording controls (start/stop)
  - ✅ Live waveform visualization
  - ✅ Playback of recorded audio
  - ❌ NO transcription logic yet

**Existing API Layer:**
- [src/api/models.ts](../src/api/models.ts) - Whisper model management
  - `downloadModel()`, `listDownloadedModels()`, etc.
  - Pattern to follow for Vosk API functions

**Existing Hooks:**
- [src/app/hooks/useModels.ts](../src/app/hooks/useModels.ts) - Whisper model hooks
  - `useDownloadModel()`, `useListModels()`
  - Pattern to follow for Vosk hooks

**Existing Pages:**
- [src/app/routes/models/index.tsx](../src/app/routes/models/index.tsx) - Model management UI
  - Shows Whisper models only
  - Needs Vosk section

---

## Implementation Checklist

### Phase 1: Model Management UI

#### 1.1 Add Vosk API Functions
**File**: `src/api/models.ts`

```typescript
// Add to existing file:

export async function downloadVoskModel(modelName: string): Promise<string> {
  return invoke<string>("download_vosk_model", { modelName });
}

export async function listVoskModels(): Promise<string[]> {
  return invoke<string[]>("list_vosk_models");
}
```

**Why**: Provides typed API for calling Vosk backend commands.

---

#### 1.2 Add Vosk Hooks
**File**: `src/app/hooks/useModels.ts`

```typescript
// Add to existing file:

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

export function useListVoskModels() {
  return useQuery({
    queryKey: ["voskModels"],
    queryFn: listVoskModels,
  });
}
```

**Why**: Provides React Query hooks for data fetching and caching.

---

#### 1.3 Add Vosk Section to Models Page
**File**: `src/app/routes/models/index.tsx`

**What to add:**
1. New "Vosk Models (Live Transcription)" section after Whisper models
2. List of available Vosk models with language flags
3. Download interface (select + download button)
4. Display downloaded Vosk models

**Available Models** (from README):
```typescript
const AVAILABLE_VOSK_MODELS = [
  { name: "vosk-model-small-en-us-0.15", lang: "English (US)", flag: "🇺🇸", size: "40 MB" },
  { name: "vosk-model-small-fr-0.22", lang: "French", flag: "🇫🇷", size: "41 MB" },
  { name: "vosk-model-small-de-0.15", lang: "German", flag: "🇩🇪", size: "45 MB" },
  { name: "vosk-model-small-es-0.42", lang: "Spanish", flag: "🇪🇸", size: "39 MB" },
  // ... 20+ more languages
];
```

**UI Pattern**: Mirror existing Whisper section structure (Card > CardHeader > CardBody).

---

### Phase 2: Live Transcription API

#### 2.1 Create Vosk Live Transcription API
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

**Why**: Provides typed API for live transcription session management.

---

### Phase 3: Live Transcription Hook

#### 3.1 Create Vosk Live Transcription Hook
**File**: `src/app/hooks/useVoskLiveTranscription.ts` (NEW FILE)

```typescript
import { useState, useRef, useCallback, useEffect } from "react";
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
   * Process audio chunk
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
          setFinalText((prev) => prev + " " + result.text);
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
      setFinalText((prev) => prev + " " + final);
      setSessionId(null);
      setIsActive(false);
      setPartialText("");
      console.log(`[Vosk] Session ended: ${sessionId}`);
      onFinalResult?.(final);
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

**Why**: Provides state management and lifecycle handling for Vosk sessions.

---

### Phase 4: LiveRecorder Integration

#### 4.1 Update LiveRecorder Component
**File**: `src/app/components/common/live-recorder/LiveRecorder.tsx`

**Changes Needed:**

1. **Add Model Selection Dropdown**
   ```tsx
   const [selectedModel, setSelectedModel] = useState("vosk-model-small-en-us-0.15");
   const { data: voskModels = [] } = useListVoskModels();

   // Add <Select> component for model selection
   ```

2. **Integrate Vosk Hook**
   ```tsx
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
     onPartialResult: (text) => console.log("Partial:", text),
     onFinalResult: (text) => console.log("Final:", text),
   });
   ```

3. **Start/Stop Session with Recording**
   ```tsx
   const toggleRecording = async () => {
     if (isRecording) {
       // Stop recording
       recordPluginRef.current.stopRecording();
       setIsRecording(false);
       await endSession(); // End Vosk session
     } else {
       // Start recording
       await startSession(); // Start Vosk session first
       await recordPluginRef.current.startRecording();
       setIsRecording(true);
     }
   };
   ```

4. **Extract PCM Audio from Microphone**
   - **Challenge**: Browser MediaRecorder gives WebM/Opus, Vosk needs i16 PCM
   - **Solution Options**:
     - **Option A**: Use Web Audio API's `AudioWorkletNode` to capture raw PCM
     - **Option B**: Use library like `@speechmatics/browser-audio-input-react`
     - **Option C**: Use `RecordPlugin.on('record-progress')` event with AudioContext

   **Recommended**: Option C (integrate with existing RecordPlugin)
   ```tsx
   recordPlugin.on('record-progress', (time) => {
     // Get audio buffer from RecordPlugin
     // Convert to PCM i16
     // Call processChunk(pcmData)
   });
   ```

5. **Display Transcription Results**
   ```tsx
   {isRecording && (
     <div className="live-recorder__transcription">
       {partialText && (
         <p className="live-recorder__partial-text">
           {partialText} <span className="cursor">|</span>
         </p>
       )}
       {finalText && (
         <p className="live-recorder__final-text">{finalText}</p>
       )}
     </div>
   )}
   ```

---

## Technical Challenges

### 🔴 Challenge 1: PCM Audio Extraction

**Problem**: Browser gives WebM/Opus audio, Vosk needs raw i16 PCM samples.

**Current Research**:
- WaveSurfer RecordPlugin uses MediaRecorder API (outputs WebM)
- Need to capture audio BEFORE encoding (via Web Audio API)

**Potential Solutions**:

1. **AudioWorklet + ScriptProcessor**
   ```typescript
   const audioContext = new AudioContext({ sampleRate: 16000 });
   const source = audioContext.createMediaStreamSource(stream);
   const processor = audioContext.createScriptProcessor(4096, 1, 1);

   processor.onaudioprocess = (e) => {
     const inputData = e.inputBuffer.getChannelData(0); // f32 array
     const pcmData = new Int16Array(inputData.length);

     // Convert f32 to i16
     for (let i = 0; i < inputData.length; i++) {
       pcmData[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
     }

     processChunk(pcmData);
   };
   ```

2. **RecordPlugin Events** (if available)
   - Check if RecordPlugin exposes raw audio buffer
   - Hook into `record-progress` event

3. **Dual Recording**
   - Keep WaveSurfer for visualization
   - Run separate Web Audio API capture for transcription

**Next Step**: Test RecordPlugin API to see if raw buffer is accessible.

---

### 🟡 Challenge 2: Chunk Size Tuning

**Problem**: Vosk performance depends on chunk size.

**From [vosk-rs-api-reference.md](./vosk-rs-api-reference.md)**:
- Too small (< 0.1s / < 1600 samples): High CPU, frequent calls
- Too large (> 2s / > 32000 samples): Delayed partials, poor UX
- Recommended: 0.5-1 second chunks (8000-16000 samples at 16kHz)

**Solution**: Use `ScriptProcessor` buffer size of 8192 samples (0.5s at 16kHz).

---

### 🟢 Challenge 3: Model Selection UX

**Problem**: Users need to download Vosk model before using live transcription.

**Solution**:
1. Show warning if no Vosk models downloaded
2. Link to Models page from LiveRecorder
3. Auto-select first downloaded model
4. Persist model selection in localStorage

---

## File Structure Summary

```
src/
├── api/
│   ├── models.ts          [MODIFY] Add downloadVoskModel, listVoskModels
│   └── vosk.ts            [NEW] Vosk session API
├── app/
│   ├── hooks/
│   │   ├── useModels.ts              [MODIFY] Add Vosk hooks
│   │   └── useVoskLiveTranscription.ts [NEW] Session management hook
│   ├── routes/
│   │   └── models/
│   │       └── index.tsx  [MODIFY] Add Vosk models section
│   └── components/
│       └── common/
│           └── live-recorder/
│               └── LiveRecorder.tsx [MODIFY] Add transcription
```

---

## Implementation Order

### Recommended Sequence:

1. **Phase 1**: Model Management UI (easiest, no audio complexity)
   - Add Vosk API functions → 5 min
   - Add Vosk hooks → 5 min
   - Add Vosk section to Models page → 30 min
   - **Result**: Users can download/manage Vosk models

2. **Phase 2**: Live Transcription API (pure API layer, no UI)
   - Create `vosk.ts` API file → 10 min
   - **Result**: API ready for frontend integration

3. **Phase 3**: Transcription Hook (session management logic)
   - Create `useVoskLiveTranscription.ts` → 20 min
   - **Result**: React hook ready for component usage

4. **Phase 4**: LiveRecorder Integration (most complex)
   - Add model selection → 10 min
   - Integrate Vosk hook → 10 min
   - **PCM audio extraction** → 60-120 min (research + implementation)
   - Display transcription results → 15 min
   - Styling → 15 min
   - **Result**: Full live transcription working end-to-end

**Total Estimated Time**: 3-4 hours

---

## Testing Plan

### Unit Tests
- [ ] Vosk API functions work (manual test with Tauri DevTools)
- [ ] Session lifecycle (start → process → end)
- [ ] Error handling (model not found, invalid session ID)

### Integration Tests
- [ ] Download Vosk model (English small model)
- [ ] Start recording → session starts
- [ ] Speak into mic → partial results appear
- [ ] Stop recording → final result appears
- [ ] Multiple recordings in same session

### Performance Tests
- [ ] Measure latency (time from speech to partial result)
- [ ] CPU usage during transcription
- [ ] Memory usage with long recordings

### Browser Compatibility
- [ ] Chrome (primary target)
- [ ] Edge (Windows WebView2 - same as Chrome)
- [ ] Firefox (if time permits)

---

## Success Criteria

### Minimum Viable Product (MVP):
- ✅ User can download Vosk English model
- ✅ User can select model in LiveRecorder
- ✅ Recording starts Vosk session
- ✅ Live transcription appears in real-time (< 1 second latency)
- ✅ Recording stops and shows final transcription
- ✅ Error handling for missing models, mic permissions

### Stretch Goals:
- Multi-language support (switch models on-the-fly)
- Export transcription to file (.txt, .srt)
- Transcription history (save previous recordings)
- Confidence scores display
- Word-level timestamps

---

## References

- [Vosk RS API Reference](./vosk-rs-api-reference.md)
- [Whisper RS API Reference](./whisper-rs-api-reference.md)
- [Live Transcription Roadmap](../LIVE_TRANSCRIPTION_ROADMAP.md)
- [Backend Source](../src-tauri/src/vosk_live_transcriber.rs)
- [Web Audio API Docs](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

---

**Last Updated**: 2025-01-19
**Next Action**: Start Phase 1 - Model Management UI
