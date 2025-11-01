---
name: env-variables
description: Always reference environment variables from env.ts file, never use undefined import.meta.env keys.
---

# Environment Variables in React

## Rule
Always import environment variables from `env.ts`. Never use `import.meta.env` directly.

## ✅ Good (Import from env.ts)
```tsx
import env from "@env";

function MyComponent() {
  if (env.MODE) {
    console.log("Development mode");
  }

  return <div>Version: {env.VITE_APP_VERSION}</div>;
}
```

## ❌ Bad (Direct import.meta.env)
```tsx
function MyComponent() {
  // MODE might not be defined!
  if (import.meta.env.MODE === "development") {
    console.log("Development mode");
  }

  return <div>Version: {import.meta.env.VITE_APP_VERSION}</div>;
}
```

## Why?
- Centralized type safety
- Validated environment variables
- Prevents typos
- Clear documentation of available variables
- Build-time errors vs runtime errors

## env.ts Location
`src/env.ts`

## When in Doubt
Open `env.ts` and confirm:
1. The variable name exists
2. The value source is correct
3. The type is properly defined

## Adding New Variables

1. Add to `.env`:
```bash
VITE_API_URL=http://localhost:3000
```

1. Add to `vite-env.d.ts`:
```typescript
export interface ImportMetaEnv {
  ...
  readonly VITE_API_URL: URL;
}
```

1. Add to `env.ts`:
Make sure the Zod constriction matches the type in the `ImportMetaEnv`
```typescript
const EnvSchema = z.object({
    // Vite built-in variables
    ...
   // Custom environment variables
    ...
    VITE_API_URL: z.url();
})  satisfies z.ZodType<ImportMetaEnv>;
```

1. Use in components:
```tsx
import env from "@env";

...
console.log(env.VITE_API_URL)
```