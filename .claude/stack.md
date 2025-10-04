# Tech Stack

## Frontend
- React (SPA) with Vite
- TypeScript + TSX
- SASS for styling
- TanStack Query (for state & async mutations)
- GSAP for complex animation
- POTENTIALLY Story book for the components
- react-dropzone (file input)
- Bun (preferred runtime) with Node fallback

## Backend
- Rust (Tauri commands, multithreading later)
- whisper-rs (for local Whisper transcription, later phase)
- ffmpeg (for audio extraction from video, later phase)

## App Shell
- Tauri (compiles React + Rust into cross-platform desktop app)

## Tools
- GitHub repo
- Git (atomic commits, microfeature-driven)
- Optional: Storybook, GSAP, Prettier/ESLint (future, not now)

## Constraints
- 100% local execution (no API tokens or external services)
- Atomic dev process (small, testable microfeatures)
- Must run cross-platform (Windows/macOS/Linux)
