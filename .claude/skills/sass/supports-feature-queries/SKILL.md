---
name: sass-supports-feature-queries
description: Use @supports for progressive enhancement when using modern CSS features that may not be universally supported.
---

# @supports Feature Queries

## When to Use
Use `@supports` to provide fallbacks for modern CSS features that lack universal browser support.

## Pattern
Use `@supports` with modern syntax and `@supports not` for fallback.

## ✅ Good Examples

### Line Clamp (Modern vs Legacy)
```scss
.clamp {
  overflow: hidden;

  // Modern browsers: use line-clamp
  @supports (line-clamp: 1) {
    line-clamp: var(--_desc-line-clamp);
  }

  // Legacy browsers: use -webkit fallback
  @supports not (line-clamp: 1) {
    display: -webkit-box;
    -webkit-line-clamp: var(--_desc-line-clamp);
    -webkit-box-orient: vertical;
  }
}
```

### Subgrid (Modern vs Fallback Grid)
```scss
.nested {
  display: grid;

  // Modern: inherit parent grid
  @supports (grid-template-columns: subgrid) {
    grid-template-columns: subgrid;
  }

  // Fallback: create own grid
  @supports not (grid-template-columns: subgrid) {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### Color-mix (Modern vs Fallback)

```scss
.card {
  // Modern: color-mix with CSS variables
  @supports (background: color-mix(in srgb, red 50%, transparent)) {
    background: color-mix(in srgb, var(--color-primary) 50%, transparent);
  }

  // Fallback: hardcoded color with opacity
  @supports not (background: color-mix(in srgb, red 50%, transparent)) {
    background: #007bff80; // Hex with alpha
  }
}
```

### Backdrop Filter
```scss
.modal-overlay {
  background: rgba(0, 0, 0, 0.8);

  @supports (backdrop-filter: blur(10px)) {
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
  }
}
```

## Logical Operators
```scss
@supports (display: grid) and (gap: 16px) { }
@supports (display: flex) or (display: grid) { }
@supports not (display: grid) { }
```

## Don't Overuse
Only use for features lacking widespread support. Most modern CSS works everywhere now:
- Flexbox ✅ (universal support)
- Grid ✅ (universal support)
- Custom properties ✅ (universal support)
- Container queries ⚠️ (use @supports)
- Subgrid ⚠️ (use @supports)
- color-mix() ⚠️ (use @supports)
