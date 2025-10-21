# CLAUDE.md - Project Memory & Context

# AI Protocol v1.1

## Do's
- Ask clarifying questions when requirements are unclear
- Request additional context when needed  
- Break down complex tasks into manageable steps
- Validate understanding before proceeding
- Suggest alternatives with pros/cons when appropriate

## Don'ts
- Make assumptions about unclear requirements
- Combine multiple steps without explicit approval
- Proceed to implementation without plan validation
- Skip testing phases or quality checks

## Protocol Steps

### 1. Task Analysis
Understand the current objective and constraints

### 2. Context Review  
Analyze existing code patterns and project architecture

### 3. Research & Planning
Investigate solutions and create implementation strategy

### 4. Plan Validation
Present approach for feedback and corrections

### 5. Implementation
Execute approved changes with clear documentation

### 6. Testing Phase
Support manual testing and address issues

### 7. Completion
Finalize current task before moving to next objective

**Rule:** Proceed sequentially. Do not advance to next step without explicit approval.

## Project Overview

**Tauri Whisper App** - A desktop application for generating subtitles from audio/video files using Whisper AI (local processing via Rust backend).

### Tech Stack
- **Frontend**: React + Vite + TypeScript + SASS
- **Backend**: Rust (Tauri)
- **Runtime**: Bun (preferred) / Node.js (fallback)
- **Architecture**: Tauri v2.x (native webview, not Electron)
- **Whisper Integration**: [whisper-rs](https://codeberg.org/tazz4843/whisper-rs) - Rust bindings for Whisper.cpp

### Development Philosophy
- **Atomic development**: Build one micro-feature at a time, get approval before moving forward
- **ChatGPT = Architect**: Provides ideas, features, direction, planning
- **Claude = Engineer**: Implements code, executes, debugs
- **No bloat**: No Bootstrap, no Tailwind - custom SASS architecture only

---

## Project Structure

```
.
├── src/                          # React frontend
│   ├── App.tsx                   # Main component
│   ├── main.tsx                  # Entry point
│   └── sass/                     # SASS architecture (7-1 pattern)
│       ├── base/                 # Normalization, typography
│       ├── components/           # Component styles (scrollbar, etc.)
│       ├── layout/               # Header, footer
│       ├── pages/                # Page-specific styles
│       ├── themes/               # Dark theme (auto via prefers-color-scheme)
│       ├── utils/                # Variables, mixins, functions, keyframes
│       └── main.scss             # Main SASS entry point
├── src-tauri/                    # Rust backend
│   ├── src/main.rs               # Tauri commands
│   ├── Cargo.toml                # Rust dependencies
│   ├── tauri.conf.json           # App configuration
│   └── icons/                    # App icons
├── .claude/                      # Claude Code documentation
│   ├── development-guide.md      # Dev workflow, troubleshooting
│   └── [other docs]
├── package.json                  # Dependencies & scripts
└── CLAUDE.md                     # This file (project memory)
```

---

## SASS Architecture

### Philosophy
- **Customization over defaults**: Comprehensive CSS resets with CSS variables for easy theming
- **Cross-browser consistency**: Scrollbar, inputs, range sliders work identically across browsers
- **Accessibility-first**: Reduced motion support, screen reader utilities, high contrast mode
- **No framework lock-in**: Pure SASS, no Bootstrap/Tailwind

### Key Files

#### `utils/_variables.scss`
CSS custom properties (`:root`) for theming:
- Colors: `--bg-primary`, `--color-primary`, `--border-color`
- Component-specific: `--scrollbar-*`, `--editor-*`, `--ts-*`
- Single source of truth for all colors/spacing

#### `utils/_mixins.scss`
Reusable SASS mixins:
- **Responsive**: `@include mobile-only`, `@include tablet-only`, etc.
- **Layout**: `@include center-flex($gap)`, `@include grid($rows, $columns, $gap)`
- **Utilities**: `@include absolute-center`, `@include fit-image`, `@include single-ellipsis-effect`
- **Component patterns**: `@include link-btn-styling`, `@include inputs-styling`, `@include card-styling`

#### `base/_normalization.scss`
Comprehensive CSS reset:
- Removes browser defaults while preserving accessibility
- Advanced input reset (every input type: color, date, range, file, number, etc.)
- Autofill styling, selection colors, reduced motion support
- Modal handling (`:has(:modal)`)

#### `components/_scrollbar.scss`
Custom scrollbar with CSS variables:
- WebKit (Chrome/Safari) + Firefox support
- Fully themable: `--_scrollbar-width`, `--_scrollbar-thumb-bg`, etc.
- Cross-browser consistency

#### `themes/_dark-theme.scss`
Auto dark mode via `@media (prefers-color-scheme: dark)`
- Overrides `:root` variables
- No JavaScript needed
- Consistent color palette

#### `utils/_js-classes.scss`
Utility classes for JavaScript interactions:
- `.hide` - Display none
- `.screen-readers-only` - Visually hidden, accessible to screen readers
- `.no-pointer-events` - Disable clicks/taps
- `.square` - Fixed square dimensions

---

## Tauri Architecture

### Frontend ↔ Backend Communication

**Frontend (React)**:
```typescript
import { invoke } from "@tauri-apps/api/tauri";

const result = await invoke<string>("hello_world");
```

**Backend (Rust)**:
```rust
#[tauri::command]
fn hello_world() -> String {
    "Hello World".to_string()
}
```

### Why Tauri > Electron
- Uses OS native webview (Edge WebView2 on Windows)
- Smaller bundle size (~3-10MB vs 100-200MB)
- Lower memory footprint
- Rust backend > Node.js (performance, security)

---

## Development Workflow

### Running the App
```bash
bun run tauri:dev
# OR
npm run tauri:dev
```

**What auto-reloads:**
- ✅ Frontend (React/TS/SASS): Instant reload
- ✅ Rust backend: Auto-recompiles (but requires window refresh with Ctrl+R)

**Opening DevTools:**
- Right-click → "Inspect Element"
- OR press F12

### Important Rules for Claude
1. ❌ **NEVER** run `bun run tauri:dev` or any dev servers - user handles manually
2. ✅ **DO** run `cargo check` before committing Rust changes
3. ✅ **DO** use TodoWrite for tracking multi-step tasks
4. ✅ **DO** keep responses concise and direct

### Building for Production
```bash
bun run tauri:build
```
Output: `src-tauri/target/release/bundle/`

---

## Coding Standards

### TypeScript/React
- Functional components only
- TypeScript strict mode
- Props interfaces for all components
- Avoid `any` types

### SASS
- Use existing mixins from `utils/_mixins.scss`
- Leverage CSS variables for theming
- Follow 7-1 pattern (utils, base, components, layout, pages, themes, vendors)
- Use `@use "../utils/" as *;` for importing mixins/variables

### Rust
- Follow Tauri conventions
- Use `#[tauri::command]` for exposed functions
- Keep commands small and focused
- Return Result<T, E> for error handling

---

## Libraries & Tools

### Current
- React 18.2
- Vite 5.x
- TypeScript 5.x
- SASS 1.70+
- Tauri 1.5.x
- Bun 1.2+ (or Node 18+)

### Planned
- **GSAP** - For complex animations
- **Storybook** - Component library (if we dare)
- **TBD** - Other libraries as needed

---

## Design System

### Colors
Defined in `utils/_variables.scss`:
- **Light mode**: White backgrounds, dark text
- **Dark mode**: Dark backgrounds, light text
- Auto-switches via `prefers-color-scheme`

### Typography
- Font: Roboto (weights: 100, 400, 500, 700)
- Fallback: system-ui stack

### Spacing
- Custom properties: `--timeline-space`, etc.
- To be expanded as design system evolves

### Components
- Button styling: `@include link-btn-styling`
- Input styling: `@include inputs-styling`
- Card styling: `@include card-styling`

---

## Git Workflow

### Commit Message Format
```
<type>: <short description>

- Bullet point 1
- Bullet point 2

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Types**: feat, fix, docs, style, refactor, test, chore

### Branch Strategy
- `master` - Main branch
- Feature branches as needed

---

## Roadmap

### ✅ Completed
- **Microfeature 0**: Hello World Tauri app
  - Basic React + Rust bridge
  - SASS architecture integration

### 🚧 In Progress
- Documentation setup
- Design system definition

### 📋 Planned
- File picker UI (dropzone for audio/video)
- Whisper integration (Rust)
- Subtitle generation
- Export functionality
- Advanced features (TBD with ChatGPT)

---

## Common Issues & Solutions

### Icon build errors
- Ensure `src-tauri/icons/icon.ico` is a valid Windows ICO file (32x32+ pixels)
- Use online converters if needed: convertio.co/png-ico

### Port 1420 already in use
```bash
# Windows
taskkill /F /IM node.exe
```

### Rust changes not reflecting
1. Wait for "Finished" in terminal
2. Refresh app window: Ctrl+R or F5

### SASS compilation errors
- Check `@use` vs `@import` (use `@use` for new code)
- Verify file paths in `sass/main.scss`

---

## Whisper Integration - CRITICAL REFERENCE

**⚠️ IMPORTANT: When modifying transcription logic, ALWAYS check this repo first:**
- **Repository**: https://codeberg.org/tazz4843/whisper-rs
- **Purpose**: Official Rust bindings for Whisper.cpp
- **Usage**: Check for API changes, new features, examples, and best practices
- **Current usage**: `src-tauri/src/whisper_rs_imp/transcriber.rs`

### Why This Matters
- The whisper-rs API may evolve (breaking changes, new features)
- Examples in the repo show optimal usage patterns
- Documentation explains parameters, options, and performance tuning
- Issues/discussions reveal known bugs and workarounds

**Before making any transcription changes:**
1. Check the latest whisper-rs repo for API updates
2. Review examples for best practices
3. Read recent issues for known problems
4. Test changes with `cargo check` and real audio files

---

## Required Documentation - READ FIRST

**⚠️ MANDATORY: Before starting ANY task, check these files:**

- **[docs/stack.md](docs/stack.md)** - Current tech stack (Tauri v2, React, Rust, whisper-rs)
- **[docs/architecture.md](docs/architecture.md)** - Frontend folder structure, feature organization, API layer patterns
- **[docs/coding-standards.md](docs/coding-standards.md)** - TypeScript/React/SASS/Rust conventions, naming, BEM, Tauri v2 patterns
- **[docs/development-guide.md](docs/development-guide.md)** - Dev workflow, commands, troubleshooting, Tauri v2 migration notes
- **[docs/roadmap.md](docs/roadmap.md)** - Project phases, completed features, current status

**Why this matters:**
- These docs contain critical context that overrides general assumptions
- They're updated after each major change (like Tauri v2 migration)
- Ignoring them leads to wrong approaches and wasted work

**When to check which doc:**
- Architecture changes → `architecture.md`
- Styling/naming questions → `coding-standards.md`
- Build errors → `development-guide.md`
- Feature planning → `roadmap.md`
- Dependency questions → `stack.md`

---

## Notes for Claude

- User prefers atomic, incremental development
- Always ask before creating new features
- Keep responses concise (2-4 lines unless complex task)
- Use TodoWrite for multi-step tasks
- Never run dev servers in background
- Test Rust changes with `cargo check` before committing
- ChatGPT provides direction, Claude implements
- **CRITICAL**: Always reference https://codeberg.org/tazz4843/whisper-rs when working on transcription
- **CRITICAL**: Check `/docs` folder documentation before suggesting solutions

---

**Last Updated**: 2025-01-17 (Tauri v2 migration complete)
**Version**: 0.1.0
