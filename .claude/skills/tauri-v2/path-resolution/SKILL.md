---
name: tauri-v2-path-resolution
description: Use app.path() for path resolution in Tauri v2, not the deprecated path_resolver() from v1.
---

# Tauri v2 Path Resolution

## Rule
Use `app.path()` (v2), not `path_resolver()` (v1).

## ✅ Good (Tauri v2)
```rust
use tauri::Manager;

#[tauri::command]
async fn get_app_dir(app: tauri::AppHandle) -> Result<String, String> {
    let app_data = app.path().app_data_dir()
        .map_err(|e| e.to_string())?;

    Ok(app_data.to_string_lossy().to_string())
}
```

## ❌ Bad (Tauri v1 - Deprecated)
```rust
// This doesn't exist in v2!
let app_data = app.path_resolver().app_data_dir();
```

## Available Paths
```rust
app.path().app_data_dir()      // App data directory
app.path().app_config_dir()    // Config directory
app.path().app_cache_dir()     // Cache directory
app.path().app_log_dir()       // Log directory
app.path().resource_dir()      // Resource directory
app.path().temp_dir()          // Temp directory
```

## Migration from v1 → v2
```rust
// OLD v1
app.path_resolver().app_data_dir();

// NEW v2
app.path().app_data_dir();
```
