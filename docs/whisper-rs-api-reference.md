# whisper-rs API Reference

**Repository**: https://codeberg.org/tazz4843/whisper-rs
**Documentation**: https://docs.rs/whisper-rs/latest/whisper_rs/

---

## Important Methods

### WhisperState - Language Detection

#### `full_lang_id_from_state()`
```rust
pub fn full_lang_id_from_state(&self) -> c_int
```
**Returns**: Language ID associated with the state after calling `full()`.

**Usage**: Call this AFTER `state.full()` to get the detected language ID when using auto-detection.

#### `lang_detect()`
```rust
pub fn lang_detect(
    &self,
    offset_ms: usize,
    threads: usize
) -> Result<(i32, Vec<f32>), WhisperError>
```
**Returns**: Tuple of (language_id, probability_vector).

**Purpose**: Use mel data at offset_ms to auto-detect spoken language with confidence scores.

---

### Global Language Utilities

#### `get_lang_str()`
```rust
pub fn get_lang_str(id: i32) -> &'static str
```
**Returns**: Short language code (e.g., "en", "fr", "es") for given language ID.

#### `get_lang_str_full()`
```rust
pub fn get_lang_str_full(id: i32) -> &'static str
```
**Returns**: Full language name (e.g., "english", "french", "spanish") for given language ID.

#### `get_lang_id()`
```rust
pub fn get_lang_id(lang: &str) -> i32
```
**Returns**: Language ID for a given language code. Returns -1 if not found.

---

### WhisperState - Transcription Methods

#### `full()`
```rust
pub fn full(
    &mut self,
    params: FullParams<'_, '_>,
    data: &[f32]
) -> Result<c_int, WhisperError>
```
**Purpose**: Run the entire Whisper pipeline: PCM → mel spectrogram → encoder → decoder → text.

**Workflow**:
1. Call `state.full(params, &audio_samples)`
2. Get detected language with `state.full_lang_id_from_state()` (if using auto-detection)
3. Retrieve segments with `state.full_n_segments()` and `state.get_segment(i)`

#### `full_n_segments()`
```rust
pub fn full_n_segments(&self) -> c_int
```
**Returns**: Number of generated text segments.

#### `get_segment()`
```rust
pub fn get_segment(&self, index: c_int) -> Option<WhisperSegment>
```
**Returns**: Segment at given index containing timestamps and text.

---

## Example: Retrieving Detected Language

```rust
use whisper_rs::{WhisperContext, WhisperContextParameters, FullParams, SamplingStrategy};

// 1. Load model and create state
let ctx = WhisperContext::new_with_params("model.bin", WhisperContextParameters::default())?;
let mut state = ctx.create_state()?;

// 2. Configure for auto-detection
let mut params = FullParams::new(SamplingStrategy::Greedy { best_of: 5 });
params.set_language(Some("auto")); // Enable auto-detection

// 3. Run transcription
state.full(params, &audio_samples)?;

// 4. Get detected language ID
let lang_id = state.full_lang_id_from_state();

// 5. Convert ID to language code
let lang_code = whisper_rs::get_lang_str(lang_id); // e.g., "en"
let lang_name = whisper_rs::get_lang_str_full(lang_id); // e.g., "english"

println!("Detected language: {} ({})", lang_name, lang_code);
```

---

## Notes

- **Language detection only works with `"auto"`**: Set `params.set_language(Some("auto"))` to enable it.
- **Call `full_lang_id_from_state()` AFTER `state.full()`**: The language is detected during processing.
- **Console output**: Whisper prints detection info to console by default. Disable with `params.set_print_progress(false)`.
- **Confidence scores**: Use `lang_detect()` if you need probability scores for each language.

---

## Complete Transcription Guide

### Step-by-Step Workflow

#### 1. Audio Preparation
Whisper requires audio in a specific format:
- **Sample rate**: 16,000 Hz (16kHz)
- **Channels**: Mono (1 channel)
- **Format**: 32-bit floating point samples (f32)
- **Bit depth**: 16-bit PCM (if using integer samples)

**Converting audio with `hound` crate:**
```rust
use hound;

// Read WAV file
let mut reader = hound::WavReader::open("audio.wav")?;
let spec = reader.spec();

// Validate sample rate
if spec.sample_rate != 16_000 {
    panic!("Expected 16kHz sample rate, got {}", spec.sample_rate);
}

// Read samples as i16
let samples_i16: Vec<i16> = reader.samples::<i16>()
    .filter_map(Result::ok)
    .collect();

// Convert to f32
let mut samples_f32 = vec![0.0f32; samples_i16.len()];
whisper_rs::convert_integer_to_float_audio(&samples_i16, &mut samples_f32)?;

// Convert stereo to mono if needed
let samples_mono = if spec.channels == 2 {
    let mut mono_samples = vec![0.0f32; samples_f32.len() / 2];
    whisper_rs::convert_stereo_to_mono_audio(&samples_f32, &mut mono_samples)?;
    mono_samples
} else {
    samples_f32 // Already mono
};
```

#### 2. Model Loading
```rust
use whisper_rs::{WhisperContext, WhisperContextParameters};

let ctx = WhisperContext::new_with_params(
    "path/to/ggml-model.bin",
    WhisperContextParameters::default()
)?;
```

**Model files**: Download from [HuggingFace](https://huggingface.co/ggerganov/whisper.cpp/tree/main)
- `ggml-tiny.bin` - 77 MB (fastest, less accurate)
- `ggml-base.bin` - 148 MB (balanced)
- `ggml-small.bin` - 488 MB (good quality, slower)
- `ggml-medium.bin` - 1.5 GB (high quality, very slow)
- `ggml-large-v3.bin` - 1.3 GB (best quality, very very very VERY slow)

#### 3. Create State
```rust
let mut state = ctx.create_state()?;
```

**Important**: Create state once per transcription. Reuse context for multiple files.

#### 4. Configure Parameters
```rust
use whisper_rs::{FullParams, SamplingStrategy};

let mut params = FullParams::new(SamplingStrategy::Greedy { best_of: 5 });

// Language detection
params.set_language(Some("auto")); // Auto-detect
// OR
params.set_language(Some("en"));   // Force English

// Threading (use all CPU cores)
params.set_n_threads(num_cpus::get() as i32);

// Performance tuning
params.set_temperature(0.5);       // Lower = more deterministic
params.set_no_context(true);       // Don't use past text as context

// Console output control
params.set_print_progress(false);  // Disable progress printing
params.set_print_special(false);   // Disable special tokens
params.set_print_realtime(false);  // Disable real-time output
params.set_print_timestamps(false); // Disable timestamp printing
```

**Sampling Strategies:**
```rust
// Greedy (faster, good quality)
SamplingStrategy::Greedy { best_of: 5 }

// Beam Search (slower, better quality)
SamplingStrategy::BeamSearch {
    beam_size: 5,
    patience: -1.0,
}
```

#### 5. Run Transcription
```rust
state.full(params, &samples_mono)?;
```

#### 6. Retrieve Results

**Get detected language:**
```rust
let lang_id = state.full_lang_id_from_state();
let lang_code = whisper_rs::get_lang_str(lang_id).unwrap_or("unknown");
let lang_name = whisper_rs::get_lang_str_full(lang_id).unwrap_or("Unknown");

println!("Detected: {} ({})", lang_name, lang_code);
```

**Get transcription segments:**
```rust
let num_segments = state.full_n_segments();

for i in 0..num_segments {
    if let Some(segment) = state.get_segment(i) {
        // Timestamps are in centiseconds (1/100th of a second)
        let start_sec = segment.start_timestamp() as f64 / 100.0;
        let end_sec = segment.end_timestamp() as f64 / 100.0;

        // Get text (handles invalid UTF-8 gracefully)
        let text = segment.to_str_lossy().trim();

        println!("[{:.2}s - {:.2}s]: {}", start_sec, end_sec, text);
    }
}
```

**Using iterator (alternative):**
```rust
for segment in state.as_iter() {
    println!(
        "[{} - {}]: {}",
        segment.start_timestamp(),
        segment.end_timestamp(),
        segment
    );
}
```

---

## Full Example: Transcribe Audio File

```rust
use anyhow::{Context, Result};
use std::path::Path;
use whisper_rs::{FullParams, SamplingStrategy, WhisperContext, WhisperContextParameters};

fn transcribe_audio(
    model_path: &Path,
    audio_path: &Path,
) -> Result<(String, Vec<(f64, f64, String)>)> {
    // 1. Load audio
    let mut reader = hound::WavReader::open(audio_path)?;
    let spec = reader.spec();

    if spec.sample_rate != 16_000 {
        anyhow::bail!("Expected 16kHz, got {}", spec.sample_rate);
    }

    let samples_i16: Vec<i16> = reader.samples::<i16>()
        .filter_map(Result::ok)
        .collect();

    let mut samples_f32 = vec![0.0f32; samples_i16.len()];
    whisper_rs::convert_integer_to_float_audio(&samples_i16, &mut samples_f32)?;

    let samples_mono = if spec.channels == 2 {
        let mut mono = vec![0.0f32; samples_f32.len() / 2];
        whisper_rs::convert_stereo_to_mono_audio(&samples_f32, &mut mono)?;
        mono
    } else {
        samples_f32
    };

    // 2. Load model
    let ctx = WhisperContext::new_with_params(
        model_path.to_str().unwrap(),
        WhisperContextParameters::default()
    )?;

    // 3. Create state
    let mut state = ctx.create_state()?;

    // 4. Configure parameters
    let mut params = FullParams::new(SamplingStrategy::Greedy { best_of: 5 });
    params.set_language(Some("auto"));
    params.set_n_threads(num_cpus::get() as i32);
    params.set_temperature(0.5);
    params.set_no_context(true);
    params.set_print_progress(false);
    params.set_print_special(false);
    params.set_print_realtime(false);
    params.set_print_timestamps(false);

    // 5. Run transcription
    state.full(params, &samples_mono)?;

    // 6. Get detected language
    let lang_id = state.full_lang_id_from_state();
    let language = whisper_rs::get_lang_str(lang_id)
        .unwrap_or("unknown")
        .to_string();

    // 7. Collect segments
    let num_segments = state.full_n_segments();
    let mut segments = Vec::new();

    for i in 0..num_segments {
        if let Some(segment) = state.get_segment(i) {
            let start = segment.start_timestamp() as f64 / 100.0;
            let end = segment.end_timestamp() as f64 / 100.0;
            let text = segment.to_str_lossy().trim().to_string();

            if !text.is_empty() {
                segments.push((start, end, text));
            }
        }
    }

    Ok((language, segments))
}
```

---

## Performance Tips

### CPU Optimization
```rust
// Use all available CPU cores
params.set_n_threads(num_cpus::get() as i32);
```

### Sampling Strategy Trade-offs
| Strategy                      | Speed   | Quality | Use Case                    |
| ----------------------------- | ------- | ------- | --------------------------- |
| `Greedy { best_of: 1 }`       | Fastest | Good    | Real-time, low-latency      |
| `Greedy { best_of: 5 }`       | Fast    | Better  | Recommended default         |
| `BeamSearch { beam_size: 5 }` | Slow    | Best    | High-accuracy transcription |

**Note**: BeamSearch can be 5-10x slower than Greedy.

### Memory Management
- Reuse `WhisperContext` for multiple files (models are large)
- Create new `WhisperState` per transcription
- Drop state after use to free memory

### Temperature Settings
```rust
params.set_temperature(0.0);  // Deterministic (same input = same output)
params.set_temperature(0.5);  // Balanced (recommended)
params.set_temperature(1.0);  // More creative/varied output
```

---

## Common Issues

### Invalid Sample Rate
**Error**: "Expected 16kHz sample rate, got 44100"

**Solution**: Convert audio to 16kHz using FFmpeg:
```bash
ffmpeg -i input.mp3 -ar 16000 -ac 1 -c:a pcm_s16le output.wav
```

### Stereo Audio
**Error**: Audio plays too fast or transcription is garbled

**Solution**: Convert stereo to mono:
```rust
whisper_rs::convert_stereo_to_mono_audio(&stereo_samples, &mut mono_samples)?;
```

### Model Not Found
**Error**: "failed to load model"

**Solution**: Download models from HuggingFace and verify path:
```bash
wget https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin
```

### Language Always "auto"
**Issue**: `get_lang_str()` returns None or doesn't update

**Solution**: Call `full_lang_id_from_state()` AFTER `state.full()`:
```rust
state.full(params, &audio)?;
let lang_id = state.full_lang_id_from_state(); // Must be after full()
```

---

**Last Updated**: 2025-01-18
