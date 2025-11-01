---
name: sass-container-queries
description: Use CSS @container queries for component-based responsive design instead of viewport-based media queries when appropriate.
---

# Container Queries

## When to Use
Use `@container` when component layout should respond to **its container size**, not the viewport.

## Setup
Define a container context:

```scss
.sidebar {
  container-type: inline-size; // or size, normal
  container-name: sidebar; // optional but recommended
}
```

## Query Syntax
```scss
.card {
  padding: 10px;

  // When container is >= 400px wide
  @container (min-width: 400px) {
    padding: 20px;
  }

  // Named container
  @container sidebar (min-width: 300px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}
```

## ✅ Good Example
```scss
.widget-container {
  container-type: inline-size;
  container-name: widget;
}

.widget {
  // Base: stacked layout
  display: flex;
  flex-direction: column;

  @container widget (min-width: 500px) {
    // Horizontal layout when container is wide enough
    flex-direction: row;
  }
}
```

## Container vs Media Queries

**Use @container when:**
- Component is reusable in different contexts
- Layout depends on parent width, not viewport
- Component might be in sidebar, modal, or full-width

**Use @media when:**
- True device-specific behavior (touch vs mouse)
- Viewport orientation matters
- Global layout changes (header, navigation)

## Container Query Units
```scss
@container (min-width: 400px) {
  .item {
    font-size: 3cqw;  // 3% of container width
    padding: 2cqi;    // 2% of container inline size
    gap: 1cqb;        // 1% of container block size
  }
}
```
