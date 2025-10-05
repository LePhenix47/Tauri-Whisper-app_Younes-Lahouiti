# Tauri Whisper App

A desktop application for subtitle generation built with Tauri, Rust, React, TypeScript, and SASS.

## Prerequisites

- [Rust](https://www.rust-lang.org/tools/install) (latest stable)
- [Bun](https://bun.sh/) (recommended) or [Node.js](https://nodejs.org/) 18+ (fallback)

The app uses a Rust wrapper for the C++ Whisper implementation: [`whisper-rs`](https://codeberg.org/tazz4843/whisper-rs) 
- **[CMake](https://cmake.org/download/)** (required for building whisper-rs)
  - Download `cmake-<version>-windows-x86_64.msi` for Windows
  - ✅ Check "Add CMake to system PATH" during installation
  - Verify with: `cmake --version`
- **[LLVM/Clang](https://github.com/llvm/llvm-project/releases/latest)** (required for building whisper-rs)
  - Download `LLVM-<version>-win64.exe` for Windows
  - ✅ Check "Add LLVM to the system PATH" during installation
  - Verify with: `clang --version`

See [Whisper models](https://huggingface.co/ggerganov/whisper.cpp/tree/main)

## Setup

1. Clone the repository
2. Install dependencies:

   ```bash
   # Using Bun (recommended)
   bun install

   # Or using npm
   npm install
   ```

## Development

Run the app in development mode:

```bash
# Using Bun
bun run tauri:dev

# Or using npm
npm run tauri:dev
```

This will:
- Start the Vite dev server
- Compile the Rust backend
- Launch the Tauri app window

## Build

Build the production app:

```bash
# Using Bun
bun run tauri:build

# Or using npm
npm run tauri:build
```

## Project Structure

```
.
├── src/               # React frontend (TypeScript + SASS)
│   ├── App.tsx        # Main app component
│   ├── main.tsx       # React entry point
│   └── styles/        # SASS stylesheets
├── src-tauri/         # Rust backend
│   ├── src/
│   │   └── main.rs    # Tauri app + Rust commands
│   └── Cargo.toml     # Rust dependencies
├── index.html         # HTML entry point
└── vite.config.ts     # Vite configuration
```

## License

MIT
