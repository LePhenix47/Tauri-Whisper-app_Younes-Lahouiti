---
name: function-components
description: Use function declarations (not arrow functions) for React components with TypeScript.
---

# React Function Components

## Rule
Use `function` declarations for React components, not arrow functions.

## ✅ Good (Function Declaration)
```tsx
function MyComponent({ title }: Props) {
  return <h1>{title}</h1>;
}

export default MyComponent;
```

## ❌ Bad (Arrow Function)
```tsx
const MyComponent = ({ title }: Props) => {
  return <h1>{title}</h1>;
};

export default MyComponent;
```

## Why Function Declarations?
- Clearer intent (this is a component)
- Better stack traces in dev tools
- Hoisted (can use before declaration)
- Project standard for consistency

## Component Template
```tsx
import { useState } from "react";
import "./ComponentName.scss";

type ComponentNameProps = {
  title: string;
  onAction: () => void;
};

function ComponentName({ title, onAction }: ComponentNameProps) {
  const [state, setState] = useState<string>("");

  return (
    <div className="component-name">
      <h2>{title}</h2>
      <button onClick={onAction}>Action</button>
    </div>
  );
}

export default ComponentName;
```

## File Naming
- Component: `PascalCase.tsx` (e.g., `AudioPlayer.tsx`)
- Styles: `PascalCase.scss` (e.g., `AudioPlayer.scss`)
