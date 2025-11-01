---
name: zustand-custom-hooks
description: Create custom selector hooks for commonly-used Zustand store values to ensure stable references and reusability.
---

# Zustand Custom Selector Hooks

## Rule
Create custom hooks for selectors instead of inline selectors in components.

## ✅ Good (Custom Hooks)
```typescript
// In store file
export const useCount = () =>
  useStore((state) => state.count);

export const useCountActions = () =>
  useStore((state) => state.actions);

export const useIncrement = () =>
  useStore((state) => state.actions.increment);

// In component
function Counter() {
  const count = useCount();
  const increment = useIncrement();

  return <button onClick={increment}>{count}</button>;
}
```

## ❌ Bad (Inline Selectors)
```typescript
function Counter() {
  const count = useStore((state) => state.count);
  const increment = useStore((state) => state.actions.increment);
  // Repeated selectors, verbose
}
```

## Benefits
- Stable references (no selector recreation)
- Reusable across components
- Easy to update (change once, applies everywhere)
- Better type inference
- Discoverable (autocomplete shows all hooks)

## Naming Convention
- State: `use{PropertyName}` (e.g., `useCount`, `useTheme`)
- Actions: `use{ActionName}` (e.g., `useIncrement`, `useSetTheme`)
- All actions: `use{StoreName}Actions` (e.g., `useCountActions`)

## Project Example
[useTranscriptionSettingsStore.ts:183-224](src/app/stores/useTranscriptionSettingsStore.ts#L183-L224)
