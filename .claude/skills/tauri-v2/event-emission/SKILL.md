---
name: tauri-v2-event-emission
description: Use Emitter trait and app.emit() in Tauri v2 for event emission, not emit_all() from v1.
---

# Tauri v2 Event Emission

## Rule
Import `Emitter` trait and use `app.emit()`.

## ✅ Good (Tauri v2)
```rust
use tauri::{AppHandle, Emitter}; // Import Emitter trait!

#[tauri::command]
async fn process_audio(app: AppHandle) -> Result<(), String> {
    // Emit progress events
    app.emit("progress", "Processing...")
        .map_err(|e| e.to_string())?;

    // Do work...

    app.emit("complete", "Done!")
        .map_err(|e| e.to_string())?;

    Ok(())
}
```

## ❌ Bad (Missing Import or v1 API)
```rust
// Missing Emitter trait import
app.emit("progress", "Processing..."); // Compile error!

// OLD v1 API
app.emit_all("progress", "Processing..."); // Doesn't exist in v2
```

## Required Import
```rust
use tauri::Emitter; // Critical!
```

Without this import, `app.emit()` won't compile.

## Migration from v1 → v2
```rust
// OLD v1
use tauri::Manager;
app.emit_all("event-name", payload);

// NEW v2
use tauri::{Manager, Emitter};
app.emit("event-name", payload);
```
