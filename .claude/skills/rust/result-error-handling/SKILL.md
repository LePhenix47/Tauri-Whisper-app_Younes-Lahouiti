---
name: rust-result-error-handling
description: Use Result<T, E> for fallible operations and convert errors to strings for frontend in Rust/Tauri.
---

# Rust Result Error Handling

## Pattern
Use `Result<T, E>` for functions that can fail.

## ✅ Good
```rust
use anyhow::{Context, Result};

fn load_model(path: &str) -> Result<Model> {
    let file = File::open(path)
        .context("Failed to open model file")?;

    let model = parse_model(file)
        .context("Failed to parse model")?;

    Ok(model)
}
```

## For Tauri Commands
Convert to `Result<T, String>`:
```rust
#[tauri::command]
fn load_model_command(path: String) -> Result<Model, String> {
    load_model(&path)
        .map_err(|e| format!("{:#}", e)) // anyhow error to string
}
```

## Error Context
Add context with anyhow:
```rust
use anyhow::Context;

File::open(path)
    .context("Failed to open config")?;

parse_json(&contents)
    .context(format!("Failed to parse {}", filename))?;
```

## Never Use
```rust
// ❌ Don't panic in production
file.unwrap();
model.expect("Model must exist");

// ✅ Handle errors
let file = file?;
let model = model.ok_or("Model not found")?;
```
