# Roadmap

## Vision
A lightweight desktop app (built with Tauri + React + Rust) that generates subtitles from local video files using Whisper (whisper-rs) without external API calls. Offline-first, fast, and privacy-friendly.

## Phases
- **Phase 0**: ✅ Hello World app (Rust ↔ React bridge)
- **Phase 1**: Implement Dropzone + stub transcription command
- **Phase 2**: Rust CLI PoC for audio extraction (ffmpeg) + whisper-rs
- **Phase 3**: Wire PoC into Tauri app (real transcription)
- **Phase 4**: Subtitle formatting (.srt / .vtt export)
- **Phase 5**: UX polish (file list, drag/sort, progress states)
- **Phase 6**: Optional extras (video preview overlay, batch queue, compression tools)
- **Phase 7**: Packaging & distribution
