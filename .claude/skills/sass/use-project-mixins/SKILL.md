---
name: sass-use-project-mixins
description: Always use existing mixins from sass/utils/_mixins.scss instead of writing repetitive CSS.
---

# Use Project Mixins

## Rule
Check `sass/utils/_mixins.scss` for existing mixins before writing repetitive CSS.

## Available Mixins

### Layout Mixins
```scss
@include center-flex(16px);        // Centered horizontal flex with gap
@include center-flex-column(16px); // Centered vertical flex with gap
@include grid(3, 4, 16px);         // Grid with 3 rows, 4 columns, 16px gap
@include grid-auto(3, 4, 16px);    // Grid with auto rows/columns
```

### Positioning
```scss
@include absolute-center; // Center element absolutely (translate + inset)
```

### Text Utilities
```scss
@include single-ellipsis-effect;        // Truncate text with ... on one line
@include multiline-ellipsis-effect(3);  // Truncate after 3 lines
```

### Images
```scss
@include fit-image; // object-fit: cover + object-position: center
```

### Component Patterns
```scss
@include link-btn-styling;  // Full button styling with hover/active states
@include inputs-styling;    // Input field styling with focus states
@include card-styling;      // Card border and background
```

### Responsive (see media-queries-responsive skill)
```scss
@include mobile-only { }
@include tablet-only { }
@include laptop-only { }
@include desktop-small-only { }
@include desktop-only { }
@include device-orientation(portrait) { }
```

## ✅ Good (Use Mixin)
```scss
.modal {
  @include center-flex-column(16px);
}

.user-avatar {
  @include fit-image;
  border-radius: 50%;
}

.description {
  @include multiline-ellipsis-effect(2);
}
```

## ❌ Bad (Repetitive CSS)
```scss
.modal {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
}

.user-avatar {
  object-fit: cover;
  object-position: center;
  border-radius: 50%;
}
```

## When to Create New Mixins
If a pattern repeats 3+ times across the project, add it to `_mixins.scss`.
