## 🧱 FRONTEND TODO — NEXT STEPS

### 1. **Project Architecture**
- [x] Refactor the folder structure for **scalability and maintainability**  
  - [x] Follow a **feature-based or domain-driven layout** (components, hooks, stores, utils, etc.)  
  - [x] Add clear separation between **UI, logic, and data layers**  
  - [x] _(High effort — but critical for long-term code quality)_

---

### 2. **Data Fetching & API Layer**

- [x] Evaluate and integrate **TanStack Query** for smarter data fetching, caching, and state management
  - [x] Determine if it should wrap or complement `invoke()` calls to the backend
  - [x] Define a consistent abstraction for all async requests (`src/api/models.ts` with typed `invoke()` wrapper)

---

### 4. **Animations**

- [x] Install **GSAP** and set up a reusable animation utility or hook
  - [x] Installed `gsap` + `@gsap/react` (official React integration with `useGSAP()` hook)
  - [x] Keep all motion logic modular and reusable
  - [x] Define a small animation config file for global timings/easings (`src/app/config/animation.config.ts`)

---

### 5. **Global State Management**

- [x] Choose and integrate a **modern global state library** (**Zustand**)
  - [x] Installed Zustand with DevTools + Persist middleware
  - [x] Establish a clean store structure that aligns with the new folder layout
  - [x] Created example store: `src/app/stores/useAppStore.ts`
  - [x] Added documentation: `src/app/stores/README.md`

---

### 6. **(Future) Developer Experience Enhancements**

- [x] Add **Biome** as a linter for strict rules for consistency
  - [x] Installed `@biomejs/biome` (ESLint + Prettier alternative in one tool)
  - [x] Created `biome.json` configuration
  - [x] Added scripts: `bun run lint`, `bun run lint:fix`, `bun run format`
- [x] **Set up Storybook** for component development
  - [x] Installed Storybook 9.1.10 with Vite + React
  - [x] Auto-detected Vite framework and configured accordingly
  - [x] Added global SASS import to `.storybook/preview.ts`
  - [x] Included addons: Chromatic, Docs, Onboarding, A11y, Vitest
  - [x] Scripts: `bun run storybook`, `bun run build-storybook`
- [ ] Add HeroUI design system (check first if style ain't screwed up)
