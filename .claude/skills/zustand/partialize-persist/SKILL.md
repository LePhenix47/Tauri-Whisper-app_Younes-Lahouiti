---
name: zustand-partialize-persist
description: Always use partialize to exclude actions from localStorage when using Zustand persist middleware.
---

# Zustand Partialize with Persist

## Rule
Always use `partialize` to exclude `actions` from persistence.

## ✅ Good (With Partialize)
```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useStore = create<State>()(
  persist(
    (set) => ({
      count: 0,
      actions: {
        increment: () => set((state) => ({ count: state.count + 1 })),
      },
    }),
    {
      name: "count-storage",
      partialize: (state) => ({
        count: state.count,
        // actions NOT included!
      }),
    }
  )
);
```

## ❌ Bad (No Partialize)
```typescript
persist(
  (set) => ({ /* ... */ }),
  {
    name: "count-storage",
    // Missing partialize - actions get persisted!
  }
)
```

## Why?
- Functions can't be serialized to JSON
- Prevents localStorage errors
- Keeps storage size minimal
- Avoids hydration bugs

## What to Persist
- ✅ Primitive state (numbers, strings, booleans)
- ✅ Objects and arrays (serializable data)
- ❌ Functions (actions)
- ❌ Class instances
- ❌ Symbols

## Project Example
[useTranscriptionSettingsStore.ts:170-177](src/app/stores/useTranscriptionSettingsStore.ts#L170-L177)
