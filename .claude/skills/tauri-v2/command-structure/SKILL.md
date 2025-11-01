---
name: tauri-command-structure
description: Structure Tauri commands to return Result<T, String> and use spawn_blocking for CPU-intensive work.
---

# Tauri Command Structure

## Pattern
Return `Result<T, String>` and use async for I/O.

## ✅ Good
```rust
#[tauri::command]
async fn transcribe_file(
    app: AppHandle,
    file_path: String
) -> Result<String, String> {
    // CPU-intensive work in blocking thread
    let result = tokio::task::spawn_blocking(move || {
        // Heavy computation here
        process_audio(&file_path)
    })
    .await
    .map_err(|e| e.to_string())?;

    // Emit event to frontend
    app.emit("complete", &result).ok();

    Ok(result)
}
```

## Key Points

### Return Type
Always `Result<T, String>`:
```rust
Result<String, String>      // Return string, error string
Result<Vec<Model>, String>  // Return array, error string
Result<(), String>          // No return value, error string
```

### Error Handling
Convert errors to strings:
```rust
.map_err(|e| e.to_string())
.map_err(|e| format!("{:#}", e)) // With anyhow
```

### CPU-Intensive Work
Use `spawn_blocking`:
```rust
tokio::task::spawn_blocking(move || {
    // Heavy computation
})
.await
.map_err(|e| e.to_string())?
```

### Keep Commands Small
One command = one responsibility.
