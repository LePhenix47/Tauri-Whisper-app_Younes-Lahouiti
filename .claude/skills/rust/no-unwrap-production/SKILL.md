---
name: rust-no-unwrap-production
description: Never use unwrap() or expect() in production Rust code - always handle errors gracefully.
---

# No unwrap() in Production

## Rule
Never use `unwrap()` or `expect()` in production code.

## ❌ Bad (Panics)
```rust
let file = File::open("config.json").unwrap(); // Panic if fails!
let model = load_model().expect("Model required"); // Panic!
```

## ✅ Good (Graceful Handling)
```rust
// Use ? operator
let file = File::open("config.json")?;

// Use ok_or
let model = load_model().ok_or("Failed to load model")?;

// Use match
let file = match File::open("config.json") {
    Ok(f) => f,
    Err(e) => return Err(format!("Failed to open file: {}", e)),
};
```

## Why?
- `unwrap()` crashes the entire app
- User sees cryptic "thread panicked" message
- No recovery possible
- Bad user experience

## When unwrap() Is OK
- Tests only:
```rust
#[test]
fn test_something() {
    let value = Some(42).unwrap(); // OK in tests
}
```

## Alternatives
```rust
// Option<T>
.ok_or("error message")?
.ok_or_else(|| format!("error: {}", var))?
.unwrap_or(default_value)
.unwrap_or_else(|| compute_default())

// Result<T, E>
?
.map_err(|e| format!("{}", e))?
```
