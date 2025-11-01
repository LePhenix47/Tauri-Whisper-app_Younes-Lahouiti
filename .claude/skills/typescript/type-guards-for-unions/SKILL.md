---
name: type-guards-for-unions
description: Create type guard functions to safely narrow union types in TypeScript instead of fragile property checks.
---

# Type Guards for Union Types

## Pattern
Create explicit type guard functions for discriminating union types.

## ✅ Good (Type Guard)
```typescript
type Greedy = { type: "greedy"; best_of: number };
type BeamSearch = { type: "beam_search"; beam_size: number };
type Strategy = Greedy | BeamSearch;

function isGreedy(strategy: Strategy): strategy is Greedy {
  return strategy.type === "greedy";
}

function process(strategy: Strategy) {
  if (isGreedy(strategy)) {
    console.log(strategy.best_of); // ✅ TypeScript knows it's Greedy
  } else {
    console.log(strategy.beam_size); // ✅ TypeScript knows it's BeamSearch
  }
}
```

## ❌ Bad (Property Check)
```typescript
if ("best_of" in strategy) {
  // Fragile - no type narrowing guarantee
}
```

## Type Guard Syntax
```typescript
function isType(value: UnionType): value is SpecificType {
  // return boolean check
}
```

The `value is SpecificType` tells TypeScript to narrow the type when the function returns `true`.

## Common Patterns

### Discriminated Union (Recommended)
```typescript
type Success = { status: "success"; data: string };
type Error = { status: "error"; message: string };
type Result = Success | Error;

function isSuccess(result: Result): result is Success {
  return result.status === "success";
}
```

### instanceof Check
```typescript
function isError(value: unknown): value is Error {
  return value instanceof Error;
}
```

### typeof Check
```typescript
function isString(value: unknown): value is string {
  return typeof value === "string";
}
```

## Project Example
[AdvancedSettingsPanel.tsx:178-188](src/app/components/settings/AdvancedSettingsPanel.tsx#L178-L188)
