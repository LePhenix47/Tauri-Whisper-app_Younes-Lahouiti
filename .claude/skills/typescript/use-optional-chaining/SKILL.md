---
name: use-optional-chaining
description: Use optional chaining (?.) to safely access nested properties that might be null or undefined.
---

# Use Optional Chaining

## Pattern
Use `?.` to safely access nested properties without explicit null checks.

## ✅ Good (Optional Chaining)
```typescript
const modelName = settings?.transcription?.model?.name;
const firstItem = array?.[0];
const resultFunc = processor?.process?.();
```

## ❌ Bad (Manual Checks)
```typescript
const modelName = settings && settings.transcription
  && settings.transcription.model
  && settings.transcription.model.name;
```

## Syntax

### Property Access
```typescript
obj?.prop
```

### Array/Computed Property
```typescript
arr?.[0]
obj?.[dynamicKey]
```

### Function Call
```typescript
func?.()
callback?.(arg1, arg2)
```

## When to Use
- Accessing nested object properties
- Calling functions that might not exist
- Working with optional data from APIs
- Handling potentially null/undefined values

## Returns
Returns `undefined` if any part of the chain is `null` or `undefined`.
