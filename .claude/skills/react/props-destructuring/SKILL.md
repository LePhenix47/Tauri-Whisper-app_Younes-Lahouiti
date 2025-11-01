---
name: props-destructuring
description: Always destructure props in React component parameters instead of accessing via props object.
---

# Props Destructuring in React

## Rule
Destructure props in the function parameters, not inside the component.

## ✅ Good (Destructure in Parameters)
```tsx
type Props = {
  title: string;
  count: number;
  onAction: () => void;
};

function MyComponent({ title, count, onAction }: Props) {
  return (
    <div>
      <h1>{title}</h1>
      <p>{count}</p>
      <button onClick={onAction}>Click</button>
    </div>
  );
}
```

## ❌ Bad (Access via props)
```tsx
function MyComponent(props: Props) {
  return (
    <div>
      <h1>{props.title}</h1>
      <p>{props.count}</p>
      <button onClick={props.onAction}>Click</button>
    </div>
  );
}
```

## Benefits
- Clearer dependencies
- Less code
- Easier to see what props are used
- Avoids repetitive `props.` prefix

## With Default Values
```tsx
function MyComponent({
  title = "Default Title",
  count = 0,
  isActive = false
}: Props) {
  // ...
}
```

## Partial Destructuring
```tsx
function MyComponent({ title, ...rest }: Props) {
  return <div {...rest}>{title}</div>;
}
```
