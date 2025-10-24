# Development Guide

## Running the App

### Development Mode
```bash
bun run tauri:dev
# OR
npm run tauri:dev
```

This starts:
- Vite dev server on `http://localhost:1420`
- Tauri v2 app window with hot-reload
- Rust backend compiler watching for changes

### What Auto-Reloads?

✅ **Frontend (React/TS/SASS)**: Auto-reloads instantly (HMR)
✅ **Rust Backend**: Auto-recompiles on save
⚠️ **After Rust recompile**: Refresh the window with `Ctrl+R` or `F5`

### Opening DevTools

- Right-click in the app → "Inspect Element"
- OR press `F12`
- Same as Chrome/Edge DevTools

---

## Building for Production

### Desktop
```bash
bun run tauri:build
# OR
npm run tauri:build
```

Output: `src-tauri/target/release/bundle/`

### Mobile (Tauri v2 Feature!)

#### Android
```bash
# Initialize Android project (first time only)
bunx tauri android init

# Run on emulator/device
bunx tauri android dev

# Build APK
bunx tauri android build
```

#### iOS
```bash
# Initialize iOS project (first time only)
bunx tauri ios init

# Run on simulator/device
bunx tauri ios dev

# Build IPA
bunx tauri ios build
```

---

## Common Issues

### 🚨 CRITICAL: Windows Path Length Limitation (Vulkan Builds)

**If you're building with GPU acceleration (Vulkan feature enabled), the project MUST be in a short path.**

#### The Problem

Windows has a 260-character path limit (MAX_PATH), and MSBuild FileTracker has an even stricter ~240-character limit. When building whisper-rs with Vulkan, the nested CMake ExternalProject for `vulkan-shaders-gen` creates very deep directory structures that easily exceed this limit.

#### The Misleading Error

When the path is too long, you'll see:
```
CMake Error at CMakeLists.txt:2 (project):
  No CMAKE_CXX_COMPILER could be found.
```

This error is **completely misleading**. The compiler IS installed and working fine. Windows just can't create files/directories for the compiler check because the path is too long.

#### Path Length Comparison

❌ **FAILS** - Long path (78 chars):
```
C:\Users\lolle\Desktop\Web dev\Projets personnels\Front-End\tauri-whisper-app\
```
- Simulated build path: ~251 characters
- Result: CMAKE_CXX_COMPILER error during Vulkan build

✅ **WORKS** - Short path (21 chars):
```
D:\tauri-whisper-app\
```
- Simulated build path: ~194 characters
- Result: Build succeeds, GPU acceleration works

#### The Solution

**Keep the project in a short path:**
- ✅ `D:\tauri-whisper-app\` (recommended)
- ✅ `C:\twapp\`
- ✅ `C:\dev\tauri-whisper\`
- ❌ `C:\Users\<name>\Desktop\Web dev\Projets personnels\...` (too long)

#### Why .cargo/config.toml Isn't Enough

Even with these MSBuild workarounds in `.cargo/config.toml`:
```toml
[env]
MSBUILDDISABLENODEREUSE = "1"
UseMultiToolTask = "true"
TrackFileAccess = "false"
```

...the Windows MAX_PATH limit still applies. These settings reduce overhead but don't bypass the fundamental path length restriction.

#### Quick Test

Check your base path length:
```bash
echo "D:\tauri-whisper-app" | wc -c
# Should be < 30 characters to leave room for build directories
```

---

### Port 1420 Already in Use

Kill the Vite server:

```bash
# Windows
netstat -ano | findstr :1420
taskkill //F //PID <PID>

# macOS/Linux
lsof -i :1420
kill -9 <PID>
```

Then restart:
```bash
bun run tauri:dev
```

### Rust Changes Not Reflecting

1. Wait for `Finished` in terminal (Rust recompile completes)
2. Refresh app window: `Ctrl+R` or `F5`

### Build Fails with Icon Error

Ensure `src-tauri/icons/icon.ico` is a valid Windows ICO file (32x32 minimum).
Use online converters if needed: [convertio.co/png-ico](https://convertio.co/png-ico)

### Drag-and-Drop Not Working (Tauri v2)

Check that you're using the **new Tauri v2 API**:

```typescript
// ❌ OLD v1 API (broken)
import { listen } from "@tauri-apps/api/event";
listen("tauri://file-drop", ...);

// ✅ NEW v2 API (correct)
import { getCurrentWebview } from "@tauri-apps/api/webview";
getCurrentWebview().onDragDropEvent((event) => {
  if (event.payload.type === "drop") {
    console.log(event.payload.paths);
  }
});
```

---

## Project Structure

```
.
├── src/                          # React frontend
│   ├── App.tsx                   # Main component
│   ├── main.tsx                  # Entry point
│   ├── app/                      # App logic (routes, store, hooks)
│   ├── features/                 # Feature modules (isolated domains)
│   ├── components/               # Shared UI components
│   ├── api/                      # API layer (Tauri commands)
│   └── sass/                     # SASS architecture (7-1 pattern)
│       ├── base/
│       ├── components/
│       ├── layout/
│       ├── pages/
│       ├── themes/
│       ├── utils/
│       └── main.scss
├── src-tauri/                    # Rust backend
│   ├── src/
│   │   ├── main.rs               # Tauri commands & app entry
│   │   └── whisper_rs_imp/       # Whisper transcription logic
│   ├── Cargo.toml                # Rust dependencies
│   ├── tauri.conf.json           # App configuration (v2 schema)
│   ├── capabilities/             # Permission system (v2)
│   └── icons/                    # App icons
├── docs/                         # Documentation
├── package.json                  # Dependencies & scripts
└── CLAUDE.md                     # Project memory & context
```

---

## Key Files

### Frontend
- `src/App.tsx` - Root React component
- `src/main.tsx` - React entry point
- `src/routeTree.gen.ts` - TanStack Router generated routes
- `src/sass/main.scss` - Global SASS entry point
- `vite.config.ts` - Vite configuration

### Backend (Rust)
- `src-tauri/src/main.rs` - Tauri commands & app setup
- `src-tauri/src/whisper_rs_imp/transcriber.rs` - Whisper transcription logic
- `src-tauri/Cargo.toml` - Rust dependencies
- `src-tauri/tauri.conf.json` - App config (window settings, permissions, plugins)
- `src-tauri/capabilities/migrated.json` - Permission grants (Tauri v2)

---

## Testing Rust Code

Before committing Rust changes:

```bash
cd src-tauri
cargo check
```

This verifies compilation without a full build (faster).

---

## Tauri v2 Migration Notes

### Breaking Changes from v1 → v2

#### Configuration
- `build.devPath` → `build.devUrl`
- `build.distDir` → `build.frontendDist`
- `fileDropEnabled` → `dragDropEnabled`

#### JavaScript API
```typescript
// OLD v1
import { invoke } from "@tauri-apps/api/tauri";
import { listen } from "@tauri-apps/api/event";
import { open } from "@tauri-apps/api/dialog";

// NEW v2
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { open } from "@tauri-apps/plugin-dialog";
```

#### Rust API
```rust
// OLD v1
use tauri::Manager;
app.path_resolver().app_data_dir();
app.emit_all("event", payload);

// NEW v2
use tauri::{Manager, Emitter};
app.path().app_data_dir();
app.emit("event", payload);
```

### New Features in v2
- ✅ Mobile support (iOS + Android)
- ✅ Plugin system (`tauri-plugin-*`)
- ✅ Granular permissions (capabilities)
- ✅ Multiple webviews
- ✅ Better TypeScript types

---

## Whisper Integration

**⚠️ IMPORTANT**: When modifying transcription logic, always check:
**Repository**: https://codeberg.org/tazz4843/whisper-rs

### Current Implementation
- Uses `whisper-rs` crate (Rust bindings for Whisper.cpp)
- Single-pass transcription (no chunking)
- Language auto-detection
- Outputs SRT + VTT subtitle formats
- Audio conversion via ffmpeg (16kHz mono WAV)

### Files
- `src-tauri/src/main.rs` - Tauri commands for transcription
- `src-tauri/src/whisper_rs_imp/transcriber.rs` - Core Whisper logic
- `src/api/endpoints/transcription.ts` - Frontend API layer

---

**Last Updated**: 2025-01-17 (Tauri v2 migration complete)
