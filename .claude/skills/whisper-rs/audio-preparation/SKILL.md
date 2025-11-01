---
name: whisper-rs-audio-preparation
description: Prepare audio for whisper-rs transcription - 16kHz mono f32 samples required.
---

# Whisper Audio Preparation

## Requirements
- Sample rate: **16,000 Hz** (16kHz)
- Channels: **Mono** (1 channel)
- Format: **f32** (32-bit floating point)
- Range: -1.0 to 1.0

## Conversion Example
```rust
use hound;
use whisper_rs;

// 1. Read WAV file
let mut reader = hound::WavReader::open("audio.wav")?;
let spec = reader.spec();

// 2. Validate sample rate
if spec.sample_rate != 16_000 {
    return Err(format!("Expected 16kHz, got {}", spec.sample_rate));
}

// 3. Read as i16
let samples_i16: Vec<i16> = reader.samples::<i16>()
    .filter_map(Result::ok)
    .collect();

// 4. Convert i16 to f32
let mut samples_f32 = vec![0.0f32; samples_i16.len()];
whisper_rs::convert_integer_to_float_audio(&samples_i16, &mut samples_f32)?;

// 5. Convert stereo to mono (if needed)
let samples_mono = if spec.channels == 2 {
    let mut mono = vec![0.0f32; samples_f32.len() / 2];
    whisper_rs::convert_stereo_to_mono_audio(&samples_f32, &mut mono)?;
    mono
} else {
    samples_f32
};

// Now ready for whisper
```

## Using FFmpeg
```bash
ffmpeg -i input.mp3 -ar 16000 -ac 1 -c:a pcm_s16le output.wav
```

## Project Example
Check audio conversion in transcription logic.
