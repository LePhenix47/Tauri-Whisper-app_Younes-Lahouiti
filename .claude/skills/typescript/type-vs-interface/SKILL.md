---
name: type-vs-interface
description: Use type instead of interface for all type declarations in TypeScript (project standard).
---

# Use `type` (Not `interface`)

## Rule
Always use `type` for type declarations. Never use `interface`.

## ✅ Good (type)
```typescript
type User = {
  name: string;
  email: string;
};

type Settings = {
  theme: "light" | "dark";
  language: string;
};
```

## ❌ Bad (interface)
```typescript
interface User {
  name: string;
  email: string;
}
```

## Why?
- Project standard for consistency
- `type` is more flexible (unions, intersections, primitives)
- Simpler mental model (one way to declare types)

## What `type` Can Do That `interface` Can't

### Union Types
```typescript
type Status = "idle" | "loading" | "success" | "error";
```

### Intersection Types
```typescript
type Admin = User & { role: "admin" };
```

### Primitive Aliases
```typescript
type ID = string | number;
```

### Mapped Types
```typescript
type Readonly<T> = { readonly [K in keyof T]: T[K] };
```

## When Refactoring
Search and replace all `interface` declarations with `type`:
```bash
# Find interfaces
grep -r "^interface " src/
```
