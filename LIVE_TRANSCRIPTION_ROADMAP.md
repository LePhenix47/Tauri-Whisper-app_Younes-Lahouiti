# Live Transcription Roadmap - Stage-by-Stage Implementation

## **Stage 1: Chunked Processing (MVP)**
**Goal**: Get basic live transcription working ASAP
**Timeline**: 1-2 days
**Expected Latency**: 5-10 seconds delay between speech and text

### Frontend (React)
```typescript
// Audio capture with chunking
- Use RecordPlugin to capture audio continuously
- Every 10 seconds OR on manual stop:
  → Export audio chunk as Blob
  → Convert Blob to ArrayBuffer
  → Send to Tauri backend via invoke()
- Display transcription results incrementally
- Show "Processing..." indicator while waiting
```

**Key Components**:
- `LiveRecorder.tsx` (already exists)
- Add chunk timer: `setInterval(() => processChunk(), 10000)`
- State: `transcriptionSegments: Array<{timestamp, text}>`

### Backend (Rust/Tauri)
```rust
#[tauri::command]
async fn transcribe_chunk(
    audio_data: Vec<u8>,  // Raw audio bytes from frontend
    model_path: String,
) -> Result<TranscriptionResult, String>
```

**Processing Flow**:
1. Receive raw audio bytes (WebM/Opus from browser)
2. Convert to WAV 16kHz mono using `ffmpeg` or `symphonia` crate
3. Load to f32 samples with `hound`
4. Run `state.full()` with **tiny** model
5. Return segments + detected language

**Optimizations**:
- Reuse `WhisperContext` (load model once, keep in memory)
- Create new `WhisperState` per chunk
- Use `SamplingStrategy::Greedy { best_of: 1 }` for speed

### Model Choice
- **tiny.bin** (77 MB)
- **Greedy sampling, best_of: 1**
- **All CPU cores** (`set_n_threads`)

### Expected Performance
| Audio Length | Processing Time | Total Delay |
|--------------|-----------------|-------------|
| 10s chunk    | ~0.5-1s         | ~10-11s     |
| 5s chunk     | ~0.3-0.5s       | ~5-6s       |

### Challenges
- **Audio format conversion**: Browser records WebM, Whisper needs WAV 16kHz mono
- **Codec handling**: May need `ffmpeg` installed on system
- **Memory management**: Don't leak context between chunks

### Success Criteria
- User speaks → waits ~10s → sees text appear
- Can record multiple chunks sequentially
- Text accumulates in UI

---

## **Stage 2: Sliding Window (Smooth Updates)**
**Goal**: Reduce perceived latency with overlapping processing
**Timeline**: 2-3 days
**Expected Latency**: 2-3 seconds delay (feels more responsive)

### Frontend (React)
```typescript
// Sliding window audio capture
- Maintain circular buffer of last 10 seconds
- Every 2 seconds:
  → Extract last 5-7 seconds of audio
  → Send to backend
- Merge new transcription with previous results
- Deduplicate overlapping text
```

**Key Components**:
- Audio buffer management (ring buffer or array)
- Text deduplication algorithm (compare last N words)
- Smoother UI updates (fade in new text)

### Backend (Rust/Tauri)
```rust
// Same endpoint, but handle overlapping chunks
#[tauri::command]
async fn transcribe_sliding_chunk(
    audio_data: Vec<u8>,
    previous_text: Option<String>,  // For deduplication
) -> Result<TranscriptionResult, String>
```

**Processing Flow**:
1. Same as Stage 1, but faster cadence
2. Compare new segments with previous transcription
3. Return only **new text** (diff algorithm)
4. Include confidence scores to merge duplicates

**Optimizations**:
- Keep context warm (avoid re-loading model)
- Consider processing in separate thread pool
- Cache recent results for deduplication

### Model Choice
- Still **tiny.bin** (speed critical)
- May test **base.bin** if processing < 1s per chunk

### Expected Performance
| Window Size | Processing Time | Update Frequency |
|-------------|-----------------|------------------|
| 5s audio    | ~0.3-0.5s       | Every 2s         |
| 7s audio    | ~0.5-0.8s       | Every 2s         |

### Challenges
- **Text deduplication**: "Hello world" + "world how are you" → "Hello world how are you"
- **Timing mismatches**: Overlapping segments may have different timestamps
- **CPU load**: Processing every 2s = higher usage
- **Buffer management**: Prevent memory leaks with circular audio buffer

### Success Criteria
- User speaks → sees text within 2-3 seconds
- No duplicate words in output
- Smooth, continuous updates (not jumpy)

---

## **Stage 3: VAD + Smart Chunking (Production-Ready)**
**Goal**: Natural, human-like transcription with pauses
**Timeline**: 3-5 days
**Expected Latency**: 1-2 seconds after speech pause

### Frontend (React)
```typescript
// Voice Activity Detection (VAD)
- Use @ricky0123/vad-web (browser VAD library)
- Detect speech start/stop in real-time
- On silence detected (1s threshold):
  → Send accumulated audio segment
  → Clear buffer
- Show "listening..." / "processing..." states
```

**Key Libraries**:
- `@ricky0123/vad-web` (WebAssembly VAD)
- Or use native Web Audio API `analyserNode` for amplitude detection

**VAD Logic**:
```typescript
if (audioLevel < SILENCE_THRESHOLD) {
  silenceFrames++;
  if (silenceFrames > 16) { // ~1 second of silence
    sendToTranscription(audioBuffer);
    audioBuffer = [];
  }
} else {
  silenceFrames = 0;
  audioBuffer.push(audioChunk);
}
```

### Backend (Rust/Tauri)
```rust
// Optimized for natural speech segments
#[tauri::command]
async fn transcribe_vad_segment(
    audio_data: Vec<u8>,
    context_handle: Option<String>,  // Reuse context
) -> Result<TranscriptionResult, String>
```

**Processing Flow**:
1. Receive variable-length segments (1-30s)
2. Process with **base** model (better accuracy for complete sentences)
3. Use `set_no_context(false)` to maintain conversation flow
4. Return full segment with punctuation

**Optimizations**:
- Keep context in memory with handle/ID system
- Process longer segments = better accuracy
- Use `temperature: 0.5` for balanced creativity

### Model Choice
- **base.bin** (148 MB) - sweet spot of speed/quality
- **Greedy sampling, best_of: 3-5**
- **Context-aware** (`set_no_context(false)`)

### Expected Performance
| Segment Length | Processing Time | Total Delay |
|----------------|-----------------|-------------|
| 3s speech      | ~0.5-1s         | ~1.5-2s     |
| 10s speech     | ~1-2s           | ~2-3s       |
| 30s speech     | ~3-5s           | ~4-6s       |

### Challenges
- **VAD false positives**: Background noise triggers transcription
- **Silence threshold tuning**: Too short = choppy, too long = laggy
- **Long segments**: User talks for 2 minutes without pause
- **Context management**: Track conversation state across segments

### Advanced Features
- **Punctuation restoration**: Whisper adds periods/commas automatically
- **Speaker awareness**: Detect when user pauses to think vs. finished
- **Interrupt handling**: User stops mid-sentence, don't process incomplete speech
- **Real-time confidence**: Show "uncertain" text in gray until confirmed

### Success Criteria
- Transcription appears 1-2s after user stops talking
- Natural sentence boundaries (not cut mid-word)
- Accurate punctuation
- Handles pauses gracefully

---

## **Cross-Stage Considerations**

### Audio Format Handling
All stages need robust audio conversion:

**Option A: ffmpeg (external dependency)**
```rust
// Convert WebM → WAV 16kHz mono
Command::new("ffmpeg")
    .args(["-i", "input.webm", "-ar", "16000", "-ac", "1", "output.wav"])
    .output()?;
```

**Option B: Rust crates (native)**
```rust
// Use symphonia + hound
use symphonia::core::io::MediaSourceStream;
use hound::WavWriter;

// Decode WebM/Opus → PCM samples
// Resample to 16kHz if needed
// Convert to mono
// Output to f32 array for Whisper
```

**Recommendation**: Start with ffmpeg for MVP, migrate to native Rust later.

### Memory Management
```rust
// Global context manager (singleton pattern)
lazy_static! {
    static ref WHISPER_CONTEXT: Mutex<Option<WhisperContext>> = Mutex::new(None);
}

// Load once, reuse forever
fn get_or_create_context(model_path: &str) -> Result<&WhisperContext> {
    let mut ctx = WHISPER_CONTEXT.lock().unwrap();
    if ctx.is_none() {
        *ctx = Some(WhisperContext::new(model_path)?);
    }
    Ok(ctx.as_ref().unwrap())
}
```

### Error Handling
```rust
// Stage-specific error types
#[derive(Debug, Serialize)]
enum TranscriptionError {
    AudioConversionFailed(String),
    ModelLoadFailed(String),
    InsufficientAudioData,
    ProcessingTimeout,
}
```

### Progress Tracking
```typescript
// Frontend state machine
type TranscriptionState =
  | { type: 'idle' }
  | { type: 'listening' }
  | { type: 'processing', chunk: number }
  | { type: 'completed', text: string }
  | { type: 'error', message: string };
```

---

## **Implementation Order**

### Week 1: Stage 1 MVP
- [ ] Backend: Audio conversion (WebM → WAV 16kHz)
- [ ] Backend: Whisper integration (tiny model)
- [ ] Backend: Tauri command for transcription
- [ ] Frontend: 10-second chunking
- [ ] Frontend: Display incremental results
- [ ] Testing: Record 30s, get 3 chunks transcribed

### Week 2: Stage 2 Sliding Window
- [ ] Frontend: Circular audio buffer
- [ ] Frontend: 2-second interval processing
- [ ] Backend: Text deduplication logic
- [ ] Backend: Optimize for faster cadence
- [ ] Testing: Smooth updates, no duplicates

### Week 3-4: Stage 3 VAD
- [ ] Frontend: Integrate VAD library
- [ ] Frontend: Silence detection tuning
- [ ] Backend: Switch to base model
- [ ] Backend: Context-aware transcription
- [ ] Testing: Natural speech patterns

---

## **Performance Benchmarks (Target Goals)**

| Metric                  | Stage 1 | Stage 2 | Stage 3 |
|-------------------------|---------|---------|---------|
| Speech → Text Delay     | 10s     | 2-3s    | 1-2s    |
| CPU Usage (recording)   | 5-10%   | 15-25%  | 10-15%  |
| CPU Usage (processing)  | 80-100% | 80-100% | 90-100% |
| Memory Usage            | 200MB   | 250MB   | 400MB   |
| Accuracy (WER)          | 15-20%  | 15-20%  | 8-12%   |

*(WER = Word Error Rate, lower is better)*

---

## **Testing Strategy**

### Stage 1
- Record 10s → verify text appears
- Record 60s → verify 6 chunks processed
- Test with background noise
- Test with silence (should not transcribe)

### Stage 2
- Compare overlapping chunks for duplicates
- Verify text merging accuracy
- Test CPU usage over 5 minutes
- Test rapid speech vs. slow speech

### Stage 3
- Test pause detection (1s, 2s, 5s pauses)
- Test long monologue (no pauses for 2 minutes)
- Test conversation (multiple speakers)
- Test interruptions (stop mid-sentence)

---

## **User Experience Flow (Final Stage 3)**

```
User opens Live Recorder page
  ↓
Clicks "Start Recording"
  ↓
VAD detects speech → Waveform animates → "Listening..." chip
  ↓
User pauses for 1 second
  ↓
VAD detects silence → "Processing..." chip → Audio sent to backend
  ↓
Backend transcribes (1-2s) → Returns text
  ↓
Text appears below waveform with fade-in animation
  ↓
User continues speaking → Process repeats
  ↓
Clicks "Stop Recording" → Final segment processed → Full transcript shown
```

---

## **Model Comparison**

| Model   | Size   | Processing Time (10s) | Quality | Recommended Stage |
|---------|--------|----------------------|---------|-------------------|
| tiny    | 77 MB  | ~0.5-1s              | Good    | Stage 1-2         |
| base    | 148 MB | ~1-2s                | Better  | Stage 3           |
| small   | 488 MB | ~5-10s               | Great   | Offline only      |

---

## **Next Steps**

**Ready to implement Stage 1 MVP?**

Starting points:
1. Backend: Create `transcribe_chunk` Tauri command
2. Backend: Implement audio conversion (WebM → WAV 16kHz)
3. Frontend: Add chunk timer to LiveRecorder
4. Frontend: Display transcription segments incrementally

**Estimated time to working MVP**: 1-2 days

---

**Last Updated**: 2025-01-18
