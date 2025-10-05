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
- [ ] Install **GSAP** and set up a reusable animation utility or hook (`useAnimation` or similar)  
  - [ ] Keep all motion logic modular and reusable  
  - [ ] Define a small animation config file for global timings/easings

---

### 5. **Global State Management**
- [ ] Choose and integrate a **modern global state library** (e.g., **Zustand**, **Jotai**, or **Recoil**)  
  - [ ] Replace Redux with a lighter, more ergonomic solution  
  - [ ] Establish a clean store structure that aligns with the new folder layout

---

### 6. **(Future) Developer Experience Enhancements**
- [x] Add **ESLint + Prettier** strict rules for consistency  
- [ ] **Set up Storybook (or Ladle)** once the component library matures  
  - [ ] Document reusable UI components  
  - [ ] Enable visual testing, faster prototyping, and design QA
