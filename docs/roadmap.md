# Roadmap

## Vision
A lightweight desktop app (built with Tauri v2 + React + Rust) that generates subtitles from local video files using Whisper (whisper-rs) without external API calls. Offline-first, fast, and privacy-friendly.

---

## Phases

### ✅ **Phase 0**: Adding Good Practices from the Get-Go
**Status**: Complete

- [x] SASS 7-1 architecture with comprehensive resets
- [x] CSS custom properties for theming (light/dark mode)
- [x] Cross-browser consistency (scrollbar, inputs, range sliders)
- [x] Accessibility features (reduced motion, screen readers)
- [x] Custom SASS mixins library
- [x] TypeScript strict mode
- [x] Project documentation (CLAUDE.md, docs/)

---

### ✅ **Phase 1**: Implement Dropzone + Stub Transcription Command
**Status**: Complete

- [x] File dropzone component with drag-and-drop support
- [x] File type validation (audio/video extensions)
- [x] Tauri file picker integration
- [x] Stub `transcribe_file` command (returns mock data)
- [x] Frontend displays stub response

---

### ✅ **Phase 2**: Rust CLI PoC for Audio Extraction + whisper-rs
**Status**: Complete

- [x] ffmpeg integration for audio extraction (16kHz mono WAV)
- [x] whisper-rs integration (Rust bindings for Whisper.cpp)
- [x] Download Whisper models (ggml-*.bin from Hugging Face)
- [x] Single-pass transcription with language detection
- [x] Model management (list, download, test)

---

### ✅ **Phase 3**: Wire PoC into Tauri App (Real Transcription)
**Status**: Complete

- [x] Connect dropzone to real Whisper transcription
- [x] Progress events (`transcription-progress`) from Rust → Frontend
- [x] Real-time progress UI (converting, transcribing, generating)
- [x] Error handling and user feedback
- [x] Async transcription (non-blocking UI)

---

### ✅ **Phase 4**: Subtitle Formatting (.srt / .vtt export)
**Status**: Complete

- [x] Generate SRT format (SubRip)
- [x] Generate VTT format (WebVTT)
- [x] Timestamp formatting (HH:MM:SS,mmm for SRT, HH:MM:SS.mmm for VTT)
- [x] Segment-based output (start time, end time, text)
- [x] Save/copy subtitle files

---

### ✅ **Phase 5**: UX Polish
**Status**: In Progress

- [x] Models page (download, list, test models)
- [x] Transcription page with file drop and progress
- [x] Persistent state (Zustand + localStorage)
- [x] TanStack Router (file-based routing)
- [x] Dark theme auto-detection
- [ ] File queue management (multiple files)
- [ ] Drag to reorder files
- [ ] Batch transcription
- [ ] Settings page (model selection, language override)
- [ ] Export options (format selection, file naming)

---

### 🔄 **Phase 6**: Optional Extras
**Status**: Planned

- [ ] Video preview with subtitle overlay
- [ ] Subtitle editor (timing adjustments, text editing)
- [ ] Compression tools (reduce model size)
- [ ] Custom model support (fine-tuned models)
- [ ] Batch processing with queue management
- [ ] Audio normalization options
- [ ] Translation support (multi-language subtitles)

---

### 📦 **Phase 7**: Packaging & Distribution
**Status**: Planned

- [ ] Windows installer (MSI/EXE)
- [ ] macOS app bundle (DMG)
- [ ] Linux packages (AppImage, deb, rpm)
- [ ] Code signing certificates
- [ ] Auto-updater integration
- [ ] GitHub releases workflow
- [ ] Homebrew tap (macOS)
- [ ] Chocolatey package (Windows)
- [ ] Flatpak/Snap (Linux)

---

### 🚀 **Phase 8**: Mobile Support (Tauri v2)
**Status**: Future Consideration

- [ ] iOS app (TestFlight beta)
- [ ] Android app (Google Play beta)
- [ ] Mobile-optimized UI
- [ ] Platform-specific features (share sheet, etc.)
- [ ] Performance optimization for mobile

---

## Recent Milestones

### 🎉 **Tauri v2 Migration** (2025-01-17)
- Upgraded from Tauri v1.5.x → v2.8.x
- Migrated drag-and-drop API (`getCurrentWebview().onDragDropEvent()`)
- Updated all frontend imports (`@tauri-apps/api/core`, plugins)
- Updated Rust code (`path()`, `emit()`, `Emitter` trait)
- Mobile support now available (iOS/Android)

---

## Next Steps

### Immediate (Phase 5 completion)
1. File queue management (add multiple files, remove files)
2. Settings page (model selection, output format preferences)
3. Export improvements (custom file naming, folder selection)

### Short-term (Phase 6)
1. Subtitle editor for manual corrections
2. Video preview with subtitle overlay
3. Batch processing improvements

### Long-term (Phase 7+)
1. Production packaging & distribution
2. Auto-update system
3. Mobile apps (if needed)

---

**Last Updated**: 2025-01-17
**Current Phase**: 5 (UX Polish)
**Version**: 0.1.0
