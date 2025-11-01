---
name: sass-no-inline-styles
description: NEVER use inline styles in React/TSX. Always use SASS files with BEM naming convention.
---

# No Inline Styles

## Rule
**NEVER** use `style={{}}` in React components. Always use SASS classes with BEM naming.

## ❌ FORBIDDEN (Inline Styles)
```tsx
function MyComponent() {
  return (
    <div style={{ display: "flex", gap: "1rem" }}>
      <p style={{ color: "red", fontSize: "0.875rem" }}>Text</p>
    </div>
  );
}
```

## ✅ REQUIRED (SASS + BEM)
```tsx
import "./MyComponent.scss";

function MyComponent() {
  return (
    <div className="my-component">
      <p className="my-component__text">Text</p>
    </div>
  );
}
```

```scss
// MyComponent.scss
@use "../../sass/utils/" as *;

.my-component {
  display: flex;
  gap: 16px;

  &__text {
    color: var(--color-red-500);
    font-size: 14px;
  }
}
```

## Why No Inline Styles?
- Violates separation of concerns
- No access to SASS variables/mixins
- Can't use BEM naming system
- Harder to maintain and theme
- No reusability
- Project standard violation

## Only Exception
Dynamic styles that MUST be computed at runtime:
```tsx
// OK - truly dynamic value
<div style={{ width: `${percentage}%` }} />

// Still prefer CSS variables when possible:
<div
  className="progress-bar"
  style={{ "--progress": `${percentage}%` } as React.CSSProperties}
/>
```

## Always Remember
1. Create `.scss` file with same name as component in the folder of the component (exception for page components)
2. Import it: `import "./ComponentName.scss"`
3. Use BEM classes: `.block__element--modifier`
4. Use CSS variables for theming
5. Use `px` for font-sizes, gaps, line-heights, margins, paddings, use `%`, `vw`, `cqi` etc.)  for widths/heights when appropriate
