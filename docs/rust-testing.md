# Rust Testing Guide

## Overview

Rust has built-in testing framework. Tests live in `src-tauri/tests/` for integration tests, or inline with code for unit tests.

## Running Tests

```bash
# Run all tests
cd src-tauri
cargo test

# Run specific test
cargo test test_hello_world

# Run with output (show println!)
cargo test -- --nocapture

# Run tests in parallel (default)
cargo test

# Run tests sequentially
cargo test -- --test-threads=1
```

## Test Structure

### Integration Tests (`tests/` folder)

```
src-tauri/
├── src/
│   └── main.rs
└── tests/
    ├── test_commands.rs      # Test Tauri commands
    ├── test_whisper.rs       # Test Whisper integration
    └── test_download.rs      # Test download logic
```

Each file in `tests/` is a separate crate with access to your library.

### Unit Tests (inline in `main.rs`)

```rust
// src-tauri/src/main.rs

#[tauri::command]
fn hello_world() -> String {
    "Hello World from Rust".to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hello_world() {
        let result = hello_world();
        assert_eq!(result, "Hello World from Rust");
    }
}
```

## Writing Tests

### Basic Test

```rust
#[test]
fn test_addition() {
    let result = 2 + 2;
    assert_eq!(result, 4);
}
```

### Test with Result

```rust
#[test]
fn test_with_error_handling() -> Result<(), String> {
    let result = some_function()?;
    assert_eq!(result, "expected");
    Ok(())
}
```

### Test that Should Panic

```rust
#[test]
#[should_panic(expected = "Model not found")]
fn test_missing_model() {
    load_model("nonexistent").unwrap();
}
```

### Async Tests

```rust
#[tokio::test]
async fn test_download_model() {
    let result = download_model("tiny").await;
    assert!(result.is_ok());
}
```

## Testing Tauri Commands

### Problem: Commands need `AppHandle`

Tauri commands use `AppHandle` for app context, but tests don't have a running app.

### Solution 1: Extract Logic

```rust
// In main.rs
#[tauri::command]
fn get_models_dir(app: AppHandle) -> Result<String, String> {
    let app_data_dir = app.path_resolver().app_data_dir()
        .ok_or("Failed to get app data directory")?;
    create_models_dir(app_data_dir)
}

// Extracted testable function
fn create_models_dir(base_dir: PathBuf) -> Result<String, String> {
    let models_dir = base_dir.join("models");
    fs::create_dir_all(&models_dir).map_err(|e| e.to_string())?;
    Ok(models_dir.to_string_lossy().to_string())
}

// Test the logic without AppHandle
#[cfg(test)]
mod tests {
    use super::*;
    use std::env;

    #[test]
    fn test_create_models_dir() {
        let temp_dir = env::temp_dir();
        let result = create_models_dir(temp_dir);
        assert!(result.is_ok());
    }
}
```

### Solution 2: Mock AppHandle (Advanced)

Use `tauri::test` module for integration tests with mock app.

## Common Assertions

```rust
// Equality
assert_eq!(a, b);
assert_ne!(a, b);

// Boolean
assert!(condition);
assert!(result.is_ok());
assert!(path.exists());

// Pattern matching
match result {
    Ok(value) => assert_eq!(value, "expected"),
    Err(e) => panic!("Unexpected error: {}", e),
}

// Custom messages
assert_eq!(a, b, "Values should be equal: {} != {}", a, b);
```

## Testing File Operations

```rust
use std::fs;
use std::env;

#[test]
fn test_file_download() {
    // Use temp directory for tests
    let temp_dir = env::temp_dir().join("tauri_test");
    fs::create_dir_all(&temp_dir).unwrap();

    // Your test logic
    let file_path = temp_dir.join("test.bin");
    fs::write(&file_path, b"test data").unwrap();
    assert!(file_path.exists());

    // Cleanup
    fs::remove_dir_all(&temp_dir).unwrap();
}
```

## Testing Async Functions

```rust
// Add to Cargo.toml [dev-dependencies]
[dev-dependencies]
tokio = { version = "1", features = ["test-util", "macros"] }

// Use tokio::test
#[tokio::test]
async fn test_async_download() {
    let result = download_model("tiny").await;
    assert!(result.is_ok());
}
```

## Test Organization

### For our Whisper app:

```
tests/
├── test_commands.rs       # Test all Tauri commands
├── test_whisper.rs        # Test Whisper loading/transcription
├── test_download.rs       # Test model download logic
└── common/
    └── mod.rs             # Shared test utilities
```

## Example: Testing Our Commands

```rust
// tests/test_commands.rs
use std::path::PathBuf;
use std::fs;

#[test]
fn test_models_dir_creation() {
    let temp_dir = std::env::temp_dir().join("whisper_test");
    let models_dir = temp_dir.join("models");

    fs::create_dir_all(&models_dir).unwrap();
    assert!(models_dir.exists());

    // Cleanup
    fs::remove_dir_all(&temp_dir).unwrap();
}

#[test]
fn test_model_filename_format() {
    let model_name = "base";
    let expected = format!("ggml-{}.bin", model_name);
    assert_eq!(expected, "ggml-base.bin");
}

#[tokio::test]
async fn test_model_url_format() {
    let model_name = "tiny";
    let url = format!(
        "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-{}.bin",
        model_name
    );
    assert_eq!(
        url,
        "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.bin"
    );
}
```

## Best Practices

1. **Keep tests fast**: Use mocks for slow operations (network, file I/O)
2. **Test edge cases**: Empty strings, invalid paths, missing files
3. **One assertion per test**: Makes failures easier to debug
4. **Use descriptive names**: `test_download_handles_missing_model`
5. **Clean up resources**: Delete temp files, close connections
6. **Test errors**: Verify error messages and error handling

## Running Tests in CI/CD

```yaml
# GitHub Actions example
- name: Run Rust tests
  run: |
    cd src-tauri
    cargo test --verbose
```

## Cargo.toml Configuration

```toml
[dev-dependencies]
tokio = { version = "1", features = ["test-util", "macros"] }
tempfile = "3"  # For temp directories in tests
```

## Next Steps

1. Extract logic from Tauri commands into testable functions
2. Write unit tests for business logic (file paths, URL building, etc.)
3. Write integration tests for full command flows
4. Add test coverage reporting (optional)

## Commands

```bash
# Run tests
cargo test

# Run specific test file
cargo test --test test_commands

# Run with coverage (requires cargo-tarpaulin)
cargo install cargo-tarpaulin
cargo tarpaulin --out Html
```
