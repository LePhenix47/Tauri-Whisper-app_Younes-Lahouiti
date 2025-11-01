---
name: whisper-rs-model-loading
description: Load whisper-rs models efficiently - reuse context, create new state per transcription.
---

# Whisper Model Loading

## Pattern
- **Context**: Load once, reuse
- **State**: Create per transcription

## ✅ Good (Reuse Context)
```rust
use whisper_rs::{WhisperContext, WhisperContextParameters};

// Load context once (expensive!)
let ctx = WhisperContext::new_with_params(
    "models/ggml-base.bin",
    WhisperContextParameters::default()
)?;

// Reuse context for multiple files
for file in files {
    let mut state = ctx.create_state()?; // Create state per file
    state.full(params, &audio)?;
    // Process results...
}
```

## ❌ Bad (Reload Every Time)
```rust
for file in files {
    // Reloading model each time - SLOW!
    let ctx = WhisperContext::new_with_params("model.bin", ...)?;
    // ...
}
```

## Why?
- Model loading is expensive (100-1000ms)
- Context can be reused safely
- State is lightweight (< 1ms to create)

## Memory Management
```rust
// Drop state when done
{
    let mut state = ctx.create_state()?;
    state.full(params, &audio)?;
} // State dropped here, memory freed

// Context lives longer
drop(ctx); // Explicitly drop when truly done
```

## Project Example
[transcriber.rs](src-tauri/src/whisper_rs_imp/transcriber.rs)
