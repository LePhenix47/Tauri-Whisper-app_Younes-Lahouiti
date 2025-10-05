# Zustand Store Architecture

## Overview

Global state management using [Zustand](https://zustand-demo.pmnd.rs/) - a minimal, fast, and scalable state management solution.

## Store Structure

```
src/app/stores/
├── useAppStore.ts         # Global app state (theme, UI preferences)
├── useTranscriptionStore.ts  # Transcription-specific state (when needed)
└── README.md              # This file
```

## Usage Example

### Basic Store

```tsx
import { create } from "zustand";

interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
}

export const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));
```

### Using in Components

```tsx
import { useAppStore } from "@app/stores/useAppStore";

function MyComponent() {
  // Subscribe to entire store
  const { sidebarOpen, toggleSidebar } = useAppStore();

  // Or subscribe to specific values (better performance)
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);

  return <button onClick={toggleSidebar}>Toggle Sidebar</button>;
}
```

### Theme Usage (App.tsx only)

**Theme state controls which class is applied to `<html>` in App.tsx.**
Individual components NEVER handle theme - they only use CSS variables.

```tsx
// App.tsx - The ONLY place where theme class is applied
import { useAppStore } from "@app/stores/useAppStore";
import { useEffect } from "react";

function App() {
  const theme = useAppStore((state) => state.theme);

  useEffect(() => {
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark-theme");
    } else if (theme === "light") {
      root.classList.remove("dark-theme");
    } else {
      // "system" - let CSS @media (prefers-color-scheme) handle it
      root.classList.remove("dark-theme");
    }
  }, [theme]);

  return <div>...</div>;
}
```

```scss
// SASS - All components use CSS variables
:root {
  --bg-color: white;
  --text-color: black;
}

.dark-theme {
  --bg-color: black;
  --text-color: white;
}

.my-component {
  background: var(--bg-color);
  color: var(--text-color);
}
```

## Middleware

### DevTools

Enables Redux DevTools integration for debugging:

```tsx
import { devtools } from "zustand/middleware";

export const useStore = create<State>()(
  devtools((set) => ({
    // ...state
  }), { name: "MyStore" })
);
```

### Persist

Saves state to localStorage automatically:

```tsx
import { persist } from "zustand/middleware";

export const useStore = create<State>()(
  persist(
    (set) => ({
      // ...state
    }),
    {
      name: "my-storage", // localStorage key
      partialize: (state) => ({
        // Only persist these fields
        theme: state.theme,
      }),
    }
  )
);
```

### Combining Middleware

```tsx
export const useStore = create<State>()(
  devtools(
    persist(
      (set) => ({ /* state */ }),
      { name: "storage-key" }
    ),
    { name: "DevToolsName" }
  )
);
```

## Best Practices

### 1. **Keep stores focused**
Create separate stores for different domains:
- `useAppStore` - Global UI state
- `useAuthStore` - Authentication state
- `useTranscriptionStore` - Transcription-specific state

### 2. **Use selectors for performance**

```tsx
// ❌ Bad: Re-renders on ANY state change
const { theme, sidebarOpen, notifications } = useAppStore();

// ✅ Good: Only re-renders when sidebarOpen changes
const sidebarOpen = useAppStore((state) => state.sidebarOpen);
```

### 3. **Colocate actions with state**

```tsx
// ✅ Good: Actions are part of the store
const increment = useCounterStore((state) => state.increment);
increment();

// ❌ Bad: External functions
function increment() {
  useCounterStore.setState({ count: count + 1 });
}
```

### 4. **Use TypeScript interfaces**

```tsx
interface StoreState {
  data: string;
  setData: (data: string) => void;
}

export const useStore = create<StoreState>()((set) => ({
  data: "",
  setData: (data) => set({ data }),
}));
```

## When NOT to Use Zustand

- **Server state** (API data) → Use TanStack Query instead
- **Form state** → Use React Hook Form or local state
- **URL state** → Use React Router params/search
- **Component-local state** → Use `useState`

Zustand is for **client-side global state** that needs to be shared across components.

## Resources

- [Zustand Docs](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [TypeScript Guide](https://docs.pmnd.rs/zustand/guides/typescript)
- [Middleware](https://docs.pmnd.rs/zustand/integrations/persisting-store-data)
