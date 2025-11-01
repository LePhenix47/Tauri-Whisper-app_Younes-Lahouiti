---
name: zustand-actions-object
description: Separate actions from state using an actions object in Zustand stores for clean organization and persistence.
---

# Zustand Actions Object Pattern

## Rule
Group all actions in an `actions` object, separate from state.

## ✅ Good (Separated Actions)
```typescript
type Actions = {
  increment: () => void;
  setCount: (count: number) => void;
};

type State = {
  count: number;
  actions: Actions;
};

export const useStore = create<State>()((set) => ({
  count: 0,

  actions: {
    increment: () => set((state) => ({ count: state.count + 1 })),
    setCount: (count) => set({ count }),
  },
}));
```

## ❌ Bad (Mixed Actions)
```typescript
type State = {
  count: number;
  increment: () => void; // Mixed with state!
};

export const useStore = create<State>()((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
```

## Why Separate Actions?
- Easy to exclude from persistence
- Clear organization in DevTools
- Prevents accidental persistence of functions
- Clean separation of concerns

## Project Example
[useTranscriptionSettingsStore.ts:20-44](src/app/stores/useTranscriptionSettingsStore.ts#L20-L44)
