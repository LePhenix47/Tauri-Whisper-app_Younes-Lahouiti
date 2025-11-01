---
name: vosk-rs-streaming-chunks
description: Use optimal chunk sizes (0.5-1 second) for vosk-rs real-time streaming transcription.
---

# Vosk Streaming Chunk Size

## Rule
Use 0.5-1 second chunks for real-time transcription.

## ✅ Good (Optimal Chunks)
```rust
use vosk::{Model, Recognizer};

const SAMPLE_RATE: f32 = 16000.0;
const CHUNK_SIZE: usize = 8000; // 0.5 seconds at 16kHz

let model = Model::new("vosk-model-small-en-us-0.15")?;
let mut recognizer = Recognizer::new(&model, SAMPLE_RATE)?;

for chunk in audio_samples.chunks(CHUNK_SIZE) {
    let speech_detected = recognizer.accept_waveform(chunk);

    if speech_detected {
        let result = recognizer.result();
        println!("Final: {:?}", result.single());
    } else {
        let partial = recognizer.partial_result();
        println!("Partial: {}", partial.partial);
    }
}

// Get final result
let final_result = recognizer.final_result();
```

## Chunk Size Guidelines
- **Too small** (< 0.1s / 1600 samples): High CPU, frequent calls
- **Too large** (> 2s / 32000 samples): Delayed partials, poor UX
- **Optimal**: 0.5-1s (8000-16000 samples at 16kHz)

## Audio Format
- Format: `i16` (signed 16-bit PCM)
- Sample rate: 16000 Hz (typical)
- Channels: Mono

## Project Example
[LiveRecorder.tsx](src/app/components/common/live-recorder/LiveRecorder.tsx)
