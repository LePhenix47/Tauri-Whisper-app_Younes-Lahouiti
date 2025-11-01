---
name: hooks-organization
description: Organize React hooks in a consistent order and always clean up side effects in useEffect.
---

# React Hooks Organization

## Standard Hook Order
```tsx
function MyComponent({ title }: Props) {
  // 1. State hooks
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // 2. Refs
  const inputRef = useRef<HTMLInputElement>(null);

  // 3. Context
  const theme = useContext(ThemeContext);

  // 4. Custom hooks
  const { data, error } = useCustomHook();

  // 5. Effects
  useEffect(() => {
    // Side effect
    return () => {
      // Cleanup
    };
  }, [dependencies]);

  // 6. Event handlers
  const handleClick = () => {
    setCount(count + 1);
  };

  // 7. Render
  return <div>{count}</div>;
}
```

## useEffect Cleanup (Critical!)

### ✅ Always Clean Up
```tsx
useEffect(() => {
  const handler = () => console.log('resize');
  window.addEventListener('resize', handler);

  return () => {
    window.removeEventListener('resize', handler);
  };
}, []);
```

### ❌ No Cleanup (Memory Leak)
```tsx
useEffect(() => {
  window.addEventListener('resize', () => console.log('resize'));
  // Missing cleanup!
}, []);
```

## What Needs Cleanup?
- Event listeners (`addEventListener`)
- Timers (`setTimeout`, `setInterval`)
- Subscriptions (WebSocket, etc.)
- External library instances
- Abort controllers for fetch

## Project Example
[LiveRecorder.tsx:81-144](src/app/components/common/live-recorder/LiveRecorder.tsx#L81-L144)
