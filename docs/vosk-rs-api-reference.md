# vosk-rs API Reference

**Repository**: https://github.com/Bear-03/vosk-rs
**Official Vosk**: https://alphacephei.com/vosk/
**Documentation**: https://docs.rs/vosk/latest/vosk/

---

## Overview

**vosk-rs** provides Rust bindings to the Vosk API, an offline speech recognition toolkit supporting 40+ languages. Unlike whisper-rs which processes complete audio files, Vosk is designed for **real-time streaming** with zero-latency response.

### Key Differences: Vosk vs Whisper

| Feature | Vosk | Whisper |
|---------|------|---------|
| **Use Case** | Real-time streaming | File transcription |
| **Latency** | ~0-100ms (streaming) | 1-10s (batch processing) |
| **Model Size** | 40-50MB (small models) | 77MB-1.8GB |
| **Audio Input** | PCM i16 samples | f32 samples |
| **Sample Rate** | Any (16kHz typical) | 16kHz only |
| **Languages** | 40+ (one model per language) | 99 (multilingual models) |
| **Accuracy** | Good | Excellent |

---

## Core Types

### `Model`
Loads a Vosk language model from disk.

```rust
pub struct Model { /* ... */ }

impl Model {
    pub fn new(model_path: &str) -> Option<Model>
}
```

**Usage:**
```rust
let model = Model::new("path/to/vosk-model-small-en-us-0.15")
    .ok_or("Failed to load model")?;
```

**Important**: Each language requires a separate model. Download from [alphacephei.com/vosk/models](https://alphacephei.com/vosk/models).

---

### `Recognizer`
Processes audio samples and generates transcriptions.

```rust
pub struct Recognizer<'m> { /* ... */ }

impl<'m> Recognizer<'m> {
    pub fn new(model: &'m Model, sample_rate: f32) -> Option<Recognizer<'m>>

    // Configuration methods
    pub fn set_max_alternatives(&mut self, max_alternatives: i32)
    pub fn set_words(&mut self, words: bool)
    pub fn set_partial_words(&mut self, partial_words: bool)
    pub fn set_nlsml(&mut self, nlsml: bool)

    // Processing methods
    pub fn accept_waveform(&mut self, data: &[i16]) -> bool
    pub fn result(&mut self) -> CompleteResult<'_>
    pub fn partial_result(&self) -> PartialResult<'_>
    pub fn final_result(&mut self) -> CompleteResult<'_>
}
```

**Key Methods:**
- `accept_waveform()` - Feed audio samples (returns true when speech detected)
- `partial_result()` - Get current partial transcription (call anytime)
- `result()` - Get result after `accept_waveform()` returns true
- `final_result()` - Get final result when done processing

---

## Result Types

### `PartialResult`
Intermediate transcription while speech is ongoing.

```rust
pub struct PartialResult<'r> {
    pub partial: &'r str,  // Current partial transcription text
}
```

**Usage:**
```rust
let partial = recognizer.partial_result();
println!("Speaking: {}", partial.partial);
```

---

### `CompleteResult`
Final transcription result after speech ends.

```rust
pub struct CompleteResult<'r> { /* ... */ }

impl<'r> CompleteResult<'r> {
    pub fn single(&self) -> Option<CompleteResultSingle<'r>>
    pub fn multiple(&self) -> Option<CompleteResultMultiple<'r>>
}

pub struct CompleteResultSingle<'r> {
    pub text: &'r str,  // Recognized text
}

pub struct CompleteResultMultiple<'r> {
    pub alternatives: &'r [CompleteResultAlternative<'r>],
}

pub struct CompleteResultAlternative<'r> {
    pub confidence: f64,  // Confidence score
    pub text: &'r str,    // Alternative text
}
```

**Usage:**
```rust
let result = recognizer.result();

if let Some(single) = result.single() {
    println!("Result: {}", single.text);
} else if let Some(multiple) = result.multiple() {
    for alt in multiple.alternatives {
        println!("[{:.2}] {}", alt.confidence, alt.text);
    }
}
```

---

## Audio Requirements

### Format
- **Sample Format**: Signed 16-bit PCM (`i16` or `&[i16]`)
- **Sample Rate**: Any rate (16kHz typical for small models, 8kHz for phone models)
- **Channels**: Mono (single channel)
- **Bit Depth**: 16-bit

### Converting Audio

**From WAV file (using `hound` crate):**
```rust
use hound;

let mut reader = hound::WavReader::open("audio.wav")?;
let spec = reader.spec();

// Read samples as i16
let samples: Vec<i16> = reader.samples::<i16>()
    .filter_map(Result::ok)
    .collect();

// Convert stereo to mono if needed
let mono_samples: Vec<i16> = if spec.channels == 2 {
    samples.chunks(2)
        .map(|chunk| ((chunk[0] as i32 + chunk[1] as i32) / 2) as i16)
        .collect()
} else {
    samples
};
```

**From microphone (using `cpal` crate):**
```rust
use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};

let host = cpal::default_host();
let device = host.default_input_device().unwrap();
let config = device.default_input_config().unwrap();

let stream = device.build_input_stream(
    &config.into(),
    move |data: &[i16], _: &_| {
        // Feed data to recognizer
        recognizer.accept_waveform(data);
        let partial = recognizer.partial_result();
        println!("{}", partial.partial);
    },
    |err| eprintln!("Error: {}", err),
    None
)?;

stream.play()?;
```

---

## Basic Usage Example

### Processing a WAV File

```rust
use vosk::{Model, Recognizer};
use hound;

fn transcribe_wav(model_path: &str, audio_path: &str) -> Result<String, String> {
    // 1. Load model
    let model = Model::new(model_path)
        .ok_or("Failed to load model")?;

    // 2. Read WAV file
    let mut reader = hound::WavReader::open(audio_path)
        .map_err(|e| e.to_string())?;

    let spec = reader.spec();
    let samples: Vec<i16> = reader.samples::<i16>()
        .filter_map(Result::ok)
        .collect();

    // 3. Create recognizer
    let mut recognizer = Recognizer::new(&model, spec.sample_rate as f32)
        .ok_or("Failed to create recognizer")?;

    // Optional: Enable word-level details
    recognizer.set_words(true);
    recognizer.set_partial_words(true);

    // 4. Process audio in chunks (simulates streaming)
    const CHUNK_SIZE: usize = 8000; // 0.5 seconds at 16kHz

    for chunk in samples.chunks(CHUNK_SIZE) {
        recognizer.accept_waveform(chunk);

        // Get partial results during processing
        let partial = recognizer.partial_result();
        if !partial.partial.is_empty() {
            println!("Partial: {}", partial.partial);
        }
    }

    // 5. Get final result
    let final_result = recognizer.final_result();

    if let Some(single) = final_result.single() {
        Ok(single.text.to_string())
    } else {
        Ok(String::new())
    }
}
```

---

## Real-time Streaming Example

### Continuous Microphone Recognition

```rust
use vosk::{Model, Recognizer};
use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use std::sync::{Arc, Mutex};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    // 1. Load model
    let model = Arc::new(Model::new("vosk-model-small-en-us-0.15")
        .ok_or("Failed to load model")?);

    // 2. Set up audio input
    let host = cpal::default_host();
    let device = host.default_input_device()
        .ok_or("No input device")?;

    let config = device.default_input_config()?;
    let sample_rate = config.sample_rate().0 as f32;

    // 3. Create recognizer (wrapped in Arc<Mutex> for thread safety)
    let recognizer = Arc::new(Mutex::new(
        Recognizer::new(&model, sample_rate)
            .ok_or("Failed to create recognizer")?
    ));

    let recognizer_clone = Arc::clone(&recognizer);

    // 4. Build input stream
    let stream = device.build_input_stream(
        &config.into(),
        move |data: &[i16], _: &_| {
            let mut rec = recognizer_clone.lock().unwrap();

            // Feed audio to recognizer
            let speech_detected = rec.accept_waveform(data);

            if speech_detected {
                // Speech segment ended, get final result
                let result = rec.result();
                if let Some(single) = result.single() {
                    println!("Final: {}", single.text);
                }
            } else {
                // Still speaking, show partial result
                let partial = rec.partial_result();
                if !partial.partial.is_empty() {
                    print!("\rPartial: {}                    ", partial.partial);
                }
            }
        },
        |err| eprintln!("Stream error: {}", err),
        None
    )?;

    stream.play()?;

    // Keep running until Ctrl+C
    println!("Listening... (Press Ctrl+C to stop)");
    std::thread::park();

    Ok(())
}
```

---

## Configuration Options

### Max Alternatives
Get multiple alternative transcriptions with confidence scores.

```rust
recognizer.set_max_alternatives(10);

let result = recognizer.result();
if let Some(multiple) = result.multiple() {
    for alt in multiple.alternatives {
        println!("[{:.2}%] {}", alt.confidence * 100.0, alt.text);
    }
}
```

**Output:**
```
[95.23%] hello world
[82.10%] hallow world
[73.45%] hello word
```

---

### Word-level Details
Enable word timestamps and confidence scores.

```rust
recognizer.set_words(true);
recognizer.set_partial_words(true);
```

**Note**: Word-level details are available in the JSON output (parse `result.single().text` as JSON for full details).

---

## Performance Tips

### Chunk Size
- **Too small** (< 0.1s): High CPU usage, frequent calls
- **Too large** (> 2s): Delayed partial results, poor UX
- **Recommended**: 0.5-1 second chunks (8000-16000 samples at 16kHz)

```rust
const CHUNK_SIZE: usize = 8000; // 0.5 seconds at 16kHz

for chunk in samples.chunks(CHUNK_SIZE) {
    recognizer.accept_waveform(chunk);
}
```

---

### Model Selection

| Model | Size | Speed | Accuracy | Use Case |
|-------|------|-------|----------|----------|
| `vosk-model-small-en-us-0.15` | 40 MB | Fast | Good | Real-time, mobile |
| `vosk-model-en-us-0.22` | 1.8 GB | Slow | Excellent | Offline, server |

**Recommendation**: Use small models for live transcription, large models for post-processing.

---

### Memory Management

```rust
// Reuse model for multiple recognizers
let model = Arc::new(Model::new("model-path")?);

// Create recognizers as needed
let recognizer1 = Recognizer::new(&model, 16000.0)?;
let recognizer2 = Recognizer::new(&model, 16000.0)?;
```

---

## Common Issues

### Model Loading Fails
**Error**: `Model::new()` returns `None`

**Solutions**:
1. Verify model path exists
2. Ensure `libvosk.dll` (Windows), `libvosk.so` (Linux), or `libvosk.dylib` (macOS) is in PATH
3. Check model is extracted (not still a .zip file)
4. Download model from official source: https://alphacephei.com/vosk/models

---

### No Transcription Output
**Issue**: `partial.partial` is always empty

**Solutions**:
1. Check audio format (must be i16 PCM)
2. Verify sample rate matches recognizer configuration
3. Ensure audio is mono, not stereo
4. Check model language matches spoken language

---

### Partial Results Never Update
**Issue**: Partial result stays the same

**Explanation**: Vosk only updates partials when detecting speech. Silence = no updates.

**Solution**: This is normal behavior. Use a timeout to clear old partials:
```rust
use std::time::{Duration, Instant};

let mut last_update = Instant::now();

loop {
    let partial = recognizer.partial_result();

    if !partial.partial.is_empty() {
        last_update = Instant::now();
        println!("{}", partial.partial);
    } else if last_update.elapsed() > Duration::from_secs(2) {
        // Clear display after 2 seconds of silence
    }
}
```

---

## Integration with Tauri

### Backend Command
```rust
use tauri::command;
use vosk::{Model, Recognizer};
use std::sync::{Arc, Mutex};

// Global model (load once, reuse)
lazy_static::lazy_static! {
    static ref VOSK_MODEL: Arc<Mutex<Option<Model>>> = Arc::new(Mutex::new(None));
}

#[command]
async fn transcribe_vosk_chunk(
    pcm_audio: Vec<i16>,
    sample_rate: f32,
    model_path: String,
) -> Result<String, String> {
    tokio::task::spawn_blocking(move || {
        // Load or reuse model
        let mut model_guard = VOSK_MODEL.lock().unwrap();
        if model_guard.is_none() {
            *model_guard = Model::new(&model_path);
        }

        let model = model_guard.as_ref().ok_or("Model not loaded")?;

        // Create recognizer
        let mut recognizer = Recognizer::new(model, sample_rate)
            .ok_or("Failed to create recognizer")?;

        // Process audio
        recognizer.accept_waveform(&pcm_audio);

        // Get result
        let partial = recognizer.partial_result();
        Ok(partial.partial.to_string())
    })
    .await
    .map_err(|e| e.to_string())?
}
```

### Frontend Call
```typescript
import { invoke } from '@tauri-apps/api/core';

const pcmAudio: Int16Array = /* ... captured from microphone ... */;
const pcmArray = Array.from(pcmAudio);

const result = await invoke<string>('transcribe_vosk_chunk', {
  pcmAudio: pcmArray,
  sampleRate: 16000,
  modelPath: 'C:\\path\\to\\model',
});

console.log('Transcription:', result);
```

---

## Examples from vosk-rs Repository

The [vosk-rs examples](https://github.com/Bear-03/vosk-rs/tree/main/crates/vosk/examples) provide reference implementations:

1. **`read_wav.rs`** - Process WAV files with 100-sample chunks
2. **`microphone.rs`** - Real-time microphone transcription with `cpal`
3. **`grammar.rs`** - Grammar-based recognition for constrained vocabulary
4. **`speaker_model.rs`** - Speaker identification features

---

## Best Practices

1. **Load models once** - Model loading is expensive, reuse across sessions
2. **Use appropriate chunk sizes** - 0.5-1 second chunks for streaming
3. **Handle partials** - Show partial results for better UX
4. **Match languages** - Use correct model for spoken language
5. **Thread safely** - Wrap recognizer in `Arc<Mutex<>>` for multi-threaded access
6. **Monitor memory** - Drop recognizers when done to free resources

---

**Last Updated**: 2025-01-19
