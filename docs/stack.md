# Tech Stack

## Frontend
- **React** 18.x (SPA) with Vite 5.x
- **TypeScript** 5.x + TSX (strict mode)
- **SASS** 1.70+ for styling (7-1 pattern)
- **TanStack Router** 1.x (file-based routing)
- **TanStack Query** 5.x (server state & async mutations)
- **Zustand** 5.x (client state management)
- **HeroUI** 2.x (React component library)
- **GSAP** 3.x + Framer Motion for animations
- **Storybook** 9.x (component library/testing)
- **Bun** 1.2+ (preferred runtime) with Node fallback

## Backend (Rust)
- **Tauri** v2.8.x (cross-platform native app framework)
  - `tauri-plugin-dialog` (file picker)
  - `tauri-plugin-fs` (file system access)
- **whisper-rs** (Rust bindings for Whisper.cpp - local AI transcription)
  - Repository: https://codeberg.org/tazz4843/whisper-rs
- **ffmpeg** (audio/video extraction & conversion)
- **tokio** (async runtime for blocking tasks)
- **anyhow** (error handling)

## App Shell
- **Tauri v2** (compiles React + Rust into native desktop + mobile apps)
  - Desktop: Windows, macOS, Linux
  - Mobile: iOS, Android (v2 feature!)
  - Uses native OS webviews (Edge WebView2, WKWebView, etc.)

## Development Tools
- **Git** (atomic commits, microfeature-driven development)
- **Biome** (linting & formatting - replaces ESLint/Prettier)
- **Vitest** (unit testing) + Playwright (E2E)
- **cargo** (Rust package manager & build tool)
- **GitHub** (version control & CI/CD)

## Runtime Constraints
- ✅ **100% local execution** (no API tokens or cloud services)
- ✅ **Offline-first** (all processing happens on device)
- ✅ **Privacy-focused** (no telemetry, no data leaves your machine)
- ✅ **Cross-platform** (Windows, macOS, Linux - mobile ready with v2)
- ✅ **Atomic development** (small, testable microfeatures)
