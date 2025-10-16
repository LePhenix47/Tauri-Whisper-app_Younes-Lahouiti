# 🧭 Frontend Architecture Guide

This document explains the structure, rationale, and best practices for the frontend of this project.  
The goal is **clarity, scalability, and maintainability** — a codebase that feels consistent across features.

---

## 📂 Folder Structure Overview

```ascii
src/
┣ app/
┃ ┣ providers/ # Global React providers (ThemeProvider, QueryClientProvider, etc.)
┃ ┣ routes/ # Routing configuration
┃ ┣ store/ # Global state management (Zustand, Jotai, etc.)
┃ ┣ hooks/ # Global reusable hooks
┃ ┣ utils/ # Global utilities and constants
┃ ┗ index.tsx # Root app setup (wrapped providers, theme setup)
┃
┣ features/ # Each feature = isolated domain logic
┃ ┣ auth/
┃ ┃ ┣ components/
┃ ┃ ┣ hooks/
┃ ┃ ┣ api/
┃ ┃ ┣ types.ts
┃ ┃ ┗ index.ts
┃ ┣ dashboard/
┃ ┃ ┣ components/
┃ ┃ ┣ hooks/
┃ ┃ ┣ api/
┃ ┃ ┣ types.ts
┃ ┃ ┗ index.ts
┃ ┗ ...
┃
┣ components/ # Shared, pure UI components (buttons, modals, inputs)
┃ ┣ ui/
┃ ┣ layout/ # Header, Footer, Sidebar, etc.
┃ ┗ feedback/ # Loaders, toasts, notifications
┃
┣ api/ # Centralized API layer (Tauri commands, TanStack Query setup)
┃ ┣ client.ts
┃ ┣ endpoints/
┃ ┃ ┣ models.ts         # Whisper model management
┃ ┃ ┗ transcription.ts  # Transcription commands
┃ ┗ index.ts
┃
┣ assets/
┃ ┗ images/
┃ ┗ favicon/
┃
┣ sass/ # Global styling (SASS 7-1 pattern)
┃ ┣ base/ # Normalization, typography, reset
┃ ┣ themes/ # Dark/light themes (auto via prefers-color-scheme)
┃ ┣ utils/ # Mixins, variables, keyframes, functions
┃ ┣ components/ # Component-specific styles (scrollbar, etc.)
┃ ┣ layout/ # Header, footer, navigation
┃ ┣ pages/ # Page-specific overrides
┃ ┗ main.scss # Main entry point
┃
┣ env.ts
┣ App.tsx
┣ main.tsx
┗ vite-env.d.ts
```


---

## 🧩 Architectural Principles

### 1. **Feature-Driven Organization**
Each domain feature (`auth`, `dashboard`, etc.) contains its own:
- Components (UI specific to that feature)
- Hooks (logic encapsulated within the feature)
- API calls
- Types and constants  

This ensures **high cohesion** and **low coupling** — features can evolve independently.

---

### 2. **Reusable Core Layers**
- **`app/`** — Global setup (providers, routing, state, utils)
- **`components/`** — Stateless, reusable UI elements
- **`api/`** — Unified API logic for backend communication
- **`styles/`** — Global SASS organization (base, mixins, themes)

---

### 3. **Styling**
- SASS is used for full control and structure.  
- Naming follows the **BEM** convention (`.component-name__element--modifier`).  
- Component-specific styles live under `styles/components`.

---

### 4. **State Management**
- Global state handled in `app/store/` via modern libraries (Zustand, Jotai, or Recoil).  
- Local state stays inside components or features.  
- No Redux — it’s too heavy for this architecture.

---

### 5. **API Layer (Tauri Commands)**
- All Tauri backend calls go through `src/api/`.
- Each file in `api/endpoints/` corresponds to a domain (e.g., `models.ts`, `transcription.ts`).
- TanStack Query handles caching and async mutations.
- Never call `invoke()` directly from components - always use API layer.

**Example** (`src/api/endpoints/transcription.ts`):
```typescript
import { invoke } from "@tauri-apps/api/core";

export async function transcribeFile(filePath: string, modelName?: string) {
  return await invoke<TranscriptionResult>("transcribe_file_advanced", {
    filePath,
    modelName,
  });
}
```

---

### 6. **Environment Variables**
- Always reference variables defined in `env.ts`.  
- Never use undefined keys such as `MODE` or arbitrary env vars.  
- If a new variable is needed, it must be declared and typed in `env.ts`.

---

### 7. **Imports**
Vite aliases for cleaner imports:

```ts
"@app/*"       → src/app
"@features/*"  → src/features
"@components/*"→ src/components
"@api/*"       → src/api
"@sass/*"      → src/sass
