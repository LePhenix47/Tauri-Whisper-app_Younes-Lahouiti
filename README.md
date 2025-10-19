# 🎙️ Tauri Whisper App

### Description

A modern desktop application for **AI-powered subtitle generation** using OpenAI's Whisper model. Built with [Tauri](https://tauri.app/), [React](https://react.dev/), and [Rust](https://www.rust-lang.org/) for maximum performance and minimal bundle size.

This app processes audio/video files locally using Whisper AI to generate accurate subtitles - no cloud processing, complete privacy.

---

## 📋 Table of Contents

- [🎙️ Tauri Whisper App](#️-tauri-whisper-app)
    - [Description](#description)
  - [📋 Table of Contents](#-table-of-contents)
  - [🚀 Tech Stack](#-tech-stack)
  - [✅ Pre-requisites](#-pre-requisites)
    - [Required](#required)
    - [For Building Whisper-RS](#for-building-whisper-rs)
    - [For Building Vosk (Live Transcription)](#for-building-vosk-live-transcription)
  - [⚙️ Configuration](#️-configuration)
  - [📦 Installation](#-installation)
  - [🛠️ Running the Project](#️-running-the-project)
    - [Development Mode](#development-mode)
    - [Production Build](#production-build)
  - [🧪 Testing](#-testing)
    - [Rust Tests](#rust-tests)
    - [Frontend Tests (Future)](#frontend-tests-future)
  - [📂 Project Structure](#-project-structure)
  - [🎨 Key Features](#-key-features)
    - [Frontend](#frontend)
    - [Backend](#backend)
    - [Developer Experience](#developer-experience)
  - [🔧 Available Scripts](#-available-scripts)
  - [📚 Documentation](#-documentation)
  - [🚢 CI/CD Pipeline](#-cicd-pipeline)
  - [🌐 Deployment](#-deployment)
    - [Desktop Distribution](#desktop-distribution)
  - [🤝 Contributing](#-contributing)
  - [📄 License](#-license)
  - [🔗 Additional Resources](#-additional-resources)

---

## 🚀 Tech Stack

**Frontend:**
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite 5** - Build tool & dev server
- **TanStack Router** - Type-safe file-based routing
- **TanStack Query** - Data fetching & caching
- **Zustand** - Global state management
- **HeroUI** - Modern component library (formerly NextUI)
- **SASS** - Custom styling architecture (7-1 pattern)
- **GSAP** - Professional animations
- **Framer Motion** - HeroUI animation engine

**Backend:**
- **Rust** - Core backend logic
- **Tauri 1.5** - Desktop app framework
- **Whisper-RS** - Rust bindings for Whisper.cpp
- **FFmpeg** - Audio/video processing
- **Reqwest** - HTTP client for model downloads
- **Tokio** - Async runtime

**Developer Tools:**
- **Biome** - Fast linting & formatting (ESLint + Prettier replacement)
- **Storybook 9** - Component development & documentation
- **GitHub Actions** - CI/CD pipeline
- **Bun** - Fast package manager & JavaScript runtime

<div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
  <a href="https://tauri.app/" target="_blank" rel="noreferrer" title="Tauri">
    <img src="https://tauri.app/meta/favicon-96x96.png" width="36" height="36" alt="Tauri logo" />
  </a>
  <a href="https://react.dev/" target="_blank" rel="noreferrer" title="React">
    <img src="https://raw.githubusercontent.com/danielcranney/readme-generator/main/public/icons/skills/react-colored.svg" width="36" height="36" alt="React logo" />
  </a>
  <a href="https://www.typescriptlang.org/" target="_blank" rel="noreferrer" title="TypeScript">
    <img src="https://raw.githubusercontent.com/danielcranney/readme-generator/main/public/icons/skills/typescript-colored.svg" width="36" height="36" alt="TypeScript logo" />
  </a>
  <a href="https://www.rust-lang.org/" target="_blank" rel="noreferrer" title="Rust">
    <img src="https://raw.githubusercontent.com/danielcranney/readme-generator/main/public/icons/skills/rust-colored.svg" width="36" height="36" alt="Rust logo" />
  </a>
  <a href="https://vitejs.dev/" target="_blank" rel="noreferrer" title="Vite">
    <img src="https://raw.githubusercontent.com/danielcranney/readme-generator/main/public/icons/skills/vite-colored.svg" width="36" height="36" alt="Vite logo" />
  </a>
  <a href="https://sass-lang.com/" target="_blank" rel="noreferrer" title="SASS">
    <img src="https://raw.githubusercontent.com/danielcranney/readme-generator/main/public/icons/skills/sass-colored.svg" width="36" height="36" alt="SASS logo" />
  </a>
  <a href="https://tanstack.com/" target="_blank" rel="noreferrer" title="TanStack">
    <img src="https://avatars.githubusercontent.com/u/72518640?s=200&v=4" width="36" height="36" alt="TanStack logo" />
  </a>
  <a href="https://heroui.com/" target="_blank" rel="noreferrer" title="HeroUI">
    <img src="https://heroui.com/favicon.ico" width="36" height="36" alt="HeroUI logo" />
  </a>
  <a href="https://bun.sh/" target="_blank" rel="noreferrer" title="Bun">
    <img src="https://oauth.net/images/code/bun.png" width="42" height="36" alt="Bun logo" />
  </a>
</div>

---

## ✅ Pre-requisites

### Required

- **[Rust](https://www.rust-lang.org/tools/install)** (latest stable)
  ```bash
  # Verify installation
  rustc --version
  cargo --version
  ```

- **[Bun](https://bun.sh/)** (recommended) or **[Node.js 18+](https://nodejs.org/)** (fallback)
  ```bash
  # Install Bun
  npm install -g bun

  # Verify installation
  bun --version
  ```

### For Building Whisper-RS

The app uses [`whisper-rs`](https://codeberg.org/tazz4843/whisper-rs), a Rust wrapper for Whisper.cpp. Building requires:

- **[CMake](https://cmake.org/download/)** (required for compiling C++ code)
  - Download `cmake-<version>-windows-x86_64.msi` (Windows)
  - ✅ **Check "Add CMake to system PATH" during installation**
  - Verify: `cmake --version`

- **[LLVM/Clang](https://github.com/llvm/llvm-project/releases/latest)** (required for C++ compilation)
  - Download `LLVM-<version>-win64.exe` (Windows)
  - ✅ **Check "Add LLVM to the system PATH" during installation**
  - Verify: `clang --version`

> 📝 **Note**: First build may take 5-10 minutes as it compiles Whisper.cpp from source.

### For Building Vosk (Live Transcription)

The app uses [`vosk-rs`](https://github.com/Bear-03/vosk-rs) for real-time speech recognition. Building requires:

- **Visual C++ Redistributable** (required for libvosk.dll runtime dependencies)
  - Download and install [Microsoft Visual C++ Redistributable](https://aka.ms/vs/17/release/vc_redist.x64.exe) (2015-2022)
  - Or if you have Visual Studio installed, this is already present
  - Verify: Check if `msvcp140.dll` exists in `C:\Windows\System32`

- **Vosk Native Library** (libvosk.dll on Windows)
  1. Download `vosk-win64-0.3.45.zip` from [Vosk API Releases](https://github.com/alphacep/vosk-api/releases/tag/v0.3.45)
  2. Extract `libvosk.dll` from the archive
  3. Place it in `src-tauri/lib/libvosk.dll`
  4. For distribution, the DLL will be bundled automatically with the installer

> 📝 **Note**: End users don't need to install the DLL or VC++ Redistributable separately - both are bundled with the app installer.

---

## ⚙️ Configuration

The project uses environment variables for configuration. Create a `.env` file in the root directory:

```env
# Environment
REACT_APP_NODE_ENV=development

# API Configuration (if needed)
# REACT_APP_API_URL=http://localhost:8080
```

---

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/tauri-whisper-app.git
   cd tauri-whisper-app
   ```

2. **Install dependencies**:
   ```bash
   # Using Bun (recommended)
   bun install

   # Or using npm
   npm install
   ```

---

## 🛠️ Running the Project

### Development Mode

Run the app with hot-reload for both frontend and backend:

```bash
# Using Bun
bun run tauri:dev

# Or using npm
npm run tauri:dev
```

**What happens:**
- ✅ Vite dev server starts on `http://localhost:1420/`
- ✅ Rust backend compiles (auto-recompiles on changes)
- ✅ Tauri window opens with the app
- ✅ Frontend hot-reloads instantly
- ⚠️ Backend changes require manual refresh (Ctrl+R)

**DevTools:**
- Right-click → "Inspect Element" or press **F12**
- TanStack Router Devtools: Bottom-right corner

### Production Build

Build optimized executables for your platform:

```bash
# Using Bun
bun run tauri:build

# Or using npm
npm run tauri:build
```

**Output locations:**
- **Windows**: `src-tauri/target/release/bundle/msi/*.msi`
- **Linux**: `src-tauri/target/release/bundle/deb/*.deb`, `.AppImage`
- **macOS**: `src-tauri/target/release/bundle/dmg/*.dmg`, `.app`

---

## 🧪 Testing

### Rust Tests

Run backend unit tests:

```bash
cd src-tauri
cargo test

# With verbose output
cargo test --verbose

# Run specific test
cargo test test_hello_world
```

### Frontend Tests (Future)

Frontend testing with Vitest will be added in future updates.

---

## 📂 Project Structure

```
tauri-whisper-app/
├── .claude/                      # Claude Code documentation
│   ├── architecture.md           # System design & folder structure
│   ├── coding-standards.md       # Code style guidelines
│   ├── development-guide.md      # Dev workflow & troubleshooting
│   ├── design-system.md          # SASS & HeroUI usage
│   ├── routing.md                # TanStack Router guide
│   ├── rust-testing.md           # Rust testing patterns
│   ├── github-actions.md         # CI/CD documentation
│   └── stack.md                  # Tech stack overview
├── .github/
│   └── workflows/
│       └── ci-cd.yml             # GitHub Actions pipeline
├── .storybook/                   # Storybook configuration
├── src/                          # React frontend
│   ├── app/                      # Application layer
│   │   ├── api/                  # Tauri invoke wrappers
│   │   ├── config/               # App configuration
│   │   ├── hooks/                # Custom React hooks
│   │   ├── providers/            # Context providers (Query, etc.)
│   │   ├── stores/               # Zustand stores
│   │   └── utils/                # Helper functions
│   ├── components/               # Reusable UI components
│   ├── routes/                   # TanStack Router routes
│   │   ├── __root.tsx            # Root layout
│   │   └── index.tsx             # Home page
│   ├── sass/                     # SASS architecture (7-1 pattern)
│   │   ├── base/                 # Resets, typography
│   │   ├── components/           # Component styles
│   │   ├── layout/               # Layout styles
│   │   ├── pages/                # Page-specific styles
│   │   ├── themes/               # Dark/light themes
│   │   ├── utils/                # Variables, mixins, functions
│   │   └── main.scss             # Main SASS entry
│   ├── App.tsx                   # Root component (theme logic)
│   ├── main.tsx                  # React entry point
│   ├── env.ts                    # Environment variables (Zod validation)
│   └── tailwind.css              # Tailwind (HeroUI only)
├── src-tauri/                    # Rust backend
│   ├── src/
│   │   └── main.rs               # Tauri commands & app logic
│   ├── tests/                    # Rust unit tests
│   ├── Cargo.toml                # Rust dependencies
│   └── tauri.conf.json           # Tauri configuration
├── CLAUDE.md                     # Project context for Claude Code
├── README.md                     # This file
├── package.json                  # Node dependencies & scripts
├── tsconfig.json                 # TypeScript configuration
├── vite.config.ts                # Vite configuration
├── tailwind.config.js            # Tailwind CSS (HeroUI plugin)
└── biome.json                    # Biome linter/formatter config
```

---

## 🎨 Key Features

### Frontend
- ✅ **Type-safe routing** with TanStack Router (file-based)
- ✅ **Smart data fetching** with TanStack Query (caching, retries, stale-while-revalidate)
- ✅ **Global state** with Zustand (persist to localStorage)
- ✅ **Modern UI** with HeroUI components
- ✅ **Custom SASS architecture** (7-1 pattern, no framework lock-in)
- ✅ **Dark/light/system themes** with OS sync
- ✅ **Professional animations** with GSAP
- ✅ **Component library** with Storybook

### Backend
- ✅ **Whisper AI integration** for audio transcription
- ✅ **Model downloading** from Hugging Face
- ✅ **Local processing** (no cloud, complete privacy)
- ✅ **Cross-platform** (Windows, macOS, Linux)
- ✅ **Native performance** with Rust

### Developer Experience
- ✅ **Fast linting** with Biome (50x faster than ESLint)
- ✅ **Hot reload** for frontend
- ✅ **Type safety** end-to-end (TypeScript + Rust)
- ✅ **Comprehensive docs** in `.claude/` folder
- ✅ **CI/CD pipeline** with GitHub Actions
- ✅ **Storybook** for component development

---

## 🔧 Available Scripts

```bash
# Development
bun run tauri:dev          # Start dev server + Tauri app
bun run dev                # Start Vite dev server only

# Building
bun run tauri:build        # Build production app
bun run build              # Build frontend only

# Linting & Formatting
bun run lint               # Run Biome linter
bun run lint:fix           # Fix linting issues
bun run format             # Format code with Biome

# Testing
cd src-tauri && cargo test # Run Rust tests

# Storybook
bun run storybook          # Start Storybook dev server
bun run build-storybook    # Build Storybook static site
```

---

## 📚 Documentation

Comprehensive guides available in `.claude/`:

- **[Architecture](/.claude/architecture.md)** - System design & folder structure
- **[Coding Standards](/.claude/coding-standards.md)** - Code style & best practices
- **[Development Guide](/.claude/development-guide.md)** - Workflow & troubleshooting
- **[Design System](/.claude/design-system.md)** - SASS & HeroUI usage
- **[Routing](/.claude/routing.md)** - TanStack Router patterns
- **[Rust Testing](/.claude/rust-testing.md)** - Backend testing guide
- **[GitHub Actions](/.claude/github-actions.md)** - CI/CD pipeline docs
- **[Tech Stack](/.claude/stack.md)** - Technology overview

---

## 🚢 CI/CD Pipeline

GitHub Actions workflow runs on every push to `master`:

1. **✅ Run Rust Tests** - Verify backend logic
2. **💬 Build App** (commented) - Compile for Windows/Linux/macOS
3. **💬 Create Release** (commented) - Publish artifacts

**To enable builds:**
Uncomment the `build` job in `.github/workflows/ci-cd.yml`

See [GitHub Actions documentation](/.claude/github-actions.md) for details.

---

## 🌐 Deployment

### Desktop Distribution

**Option 1: Direct Download**
- Build locally: `bun run tauri:build`
- Share installer: `src-tauri/target/release/bundle/msi/*.msi`

**Option 2: GitHub Releases**
- Uncomment release job in CI/CD workflow
- Push a tag: `git tag v1.0.0 && git push origin v1.0.0`
- Create release on GitHub
- Download installers from release page

**Option 3: Auto-Update**
- Configure Tauri updater in `tauri.conf.json`
- Host update manifest on your server
- App checks for updates on launch

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m "Add amazing feature"`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

**Code Style:**
- Run `bun run lint:fix` before committing
- Follow existing patterns in `.claude/coding-standards.md`

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details.

---

## 🔗 Additional Resources

- [Tauri Documentation](https://tauri.app/v1/guides/)
- [Whisper.cpp Models](https://huggingface.co/ggerganov/whisper.cpp/tree/main)
- [Vosk Models](https://alphacephei.com/vosk/models) - Speech recognition models for 40+ languages
- [TanStack Router Docs](https://tanstack.com/router)
- [TanStack Query Docs](https://tanstack.com/query)
- [HeroUI Documentation](https://heroui.com/)
- [GSAP Documentation](https://greensock.com/docs/)
- [Biome Documentation](https://biomejs.dev/)

---

**Made with ❤️ using Tauri, React, and Rust**
