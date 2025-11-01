---
name: event-listener-cleanup
description: Always remove event listeners in useEffect cleanup to prevent memory leaks in React components.
---

# Event Listener Cleanup

## Rule
Every `addEventListener` must have a matching `removeEventListener` in the cleanup function.

## ✅ Good (With Cleanup)
```tsx
useEffect(() => {
  const handleResize = () => {
    console.log('Window resized');
  };

  window.addEventListener('resize', handleResize);

  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);
```

## ❌ Bad (No Cleanup - Memory Leak!)
```tsx
useEffect(() => {
  window.addEventListener('resize', () => {
    console.log('Window resized');
  });
  // Missing cleanup!
}, []);
```

## Why Cleanup Matters
- Prevents memory leaks
- Avoids stale closures
- Removes listeners when component unmounts
- Prevents duplicate listeners on re-renders

## Common Event Listeners

### Window Events
```tsx
useEffect(() => {
  const handler = () => { /* ... */ };
  window.addEventListener('resize', handler);
  window.addEventListener('scroll', handler);

  return () => {
    window.removeEventListener('resize', handler);
    window.removeEventListener('scroll', handler);
  };
}, []);
```

### Document Events
```tsx
useEffect(() => {
  const handler = (e: KeyboardEvent) => { /* ... */ };
  document.addEventListener('keydown', handler);

  return () => {
    document.removeEventListener('keydown', handler);
  };
}, []);
```

### Tauri Events
```tsx
useEffect(() => {
  const unlisten = listen('event-name', (event) => {
    console.log(event.payload);
  });

  return () => {
    unlisten.then(fn => fn());
  };
}, []);
```

## Project Example
[LiveRecorder.tsx:116-143](src/app/components/common/live-recorder/LiveRecorder.tsx#L116-L143)
