---
name: destructure-objects-always
description: Always destructure objects instead of accessing properties repeatedly in TypeScript code.
---

# Always Destructure Objects

## Rule
Extract properties via destructuring instead of repeated dot notation.

## ✅ Good (Destructuring)
```typescript
const { name, email, age } = user;
const { data, isLoading, error } = useQuery(...);

function MyComponent({ title, onAction }: Props) {
  return <h1>{title}</h1>;
}
```

## ❌ Bad (Repeated Access)
```typescript
const name = user.name;
const email = user.email;
const age = user.age;

function MyComponent(props: Props) {
  return <h1>{props.title}</h1>;
}
```

## Benefits
- Less code
- Better readability
- Easier refactoring
- Clear dependencies upfront

## Nested Destructuring
```typescript
const {
  user: { name, email },
  settings: { theme }
} = data;
```

## With Defaults
```typescript
const { name = "Anonymous", age = 0 } = user;
```

## Rename While Destructuring
```typescript
const { name: userName, id: userId } = user;
```
