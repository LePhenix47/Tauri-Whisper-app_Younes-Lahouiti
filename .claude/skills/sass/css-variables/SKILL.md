---
name: sass-css-variables
description: Use CSS custom properties for theming with scoped --_ prefix for component-local variables in SASS. Transform global variables with color-mix(), color(), or calc().
---

# SASS CSS Variables

## Pattern
- Global (no theme): `--property-name` (from `utils/_variables.scss`)
- Themed: `--property-name` (from `themes/_light-theme.scss` & `themes/_dark-theme.scss`)
- Scoped: `--_property-name` (local transformations)

## ✅ Good (Transform Global Variables)
```scss
@use "../utils/" as *;

.info-card {
  // Color transformations
  --_bg: color-mix(in srgb, var(--color-infocard-bg) 90%, transparent);
  --_border: color-mix(in srgb, var(--color-infocard-info) 20%, transparent);

  // Non-color transformations
  --_padding: calc(var(--spacing-base) * 2);
  --_shadow: var(--box-shadow-300);

  background-color: var(--_bg);
  border: 1px solid var(--_border);
  padding: var(--_padding);
  box-shadow: var(--_shadow);

  @include mobile-only {
    --_padding: var(--spacing-base); // Smaller padding on mobile
  }

  &:hover {
    --_shadow: var(--box-shadow-500); // Deeper shadow on hover
  }
}
```

## ❌ Bad (Direct Assignment Without Transformation)
```scss
.info-card {
  --_bg: var(--color-primary); // Just copying, no transformation!
  background-color: var(--_bg); // Pointless indirection
}
```

**Fix**: Either use global variable directly or transform it:
```scss
// Option 1: Use global directly (no need for scoped var)
background-color: var(--color-infocard-bg);
box-shadow: var(--box-shadow-300);

// Option 2: Transform it (then scoped var makes sense)
--_bg: color-mix(in srgb, var(--color-infocard-bg) 80%, white);
--_shadow: var(--box-shadow-300), inset 0 0 10px var(--color-accent);
```

## Adding New CSS Variables

### Non-Themed Variables (No Light/Dark Variation)
**File:** `sass/utils/_variables.scss`
```scss
:root {
  // Spacing
  --spacing-base: 8px;
  --spacing-large: 16px;

  // Shadows
  --box-shadow-100: 0 1px 2px rgba(0, 0, 0, 0.05);
  --box-shadow-300: 0 4px 6px rgba(0, 0, 0, 0.1);
  --box-shadow-500: 0 10px 15px rgba(0, 0, 0, 0.15);

  // Layout
  --timeline-space: 80px;
  --scrollbar-width: 12px;
  --border-radius: 4px;
}
```

### Themed Variables (Change with Light/Dark Mode)

**File:** `sass/themes/_light-theme.scss`
```scss
.light {
  --color-infocard-info: #007bff;
  --color-infocard-bg: #e7f3ff;
  --color-infocard-bg--hover: #d0e7ff;
}
```

**File:** `sass/themes/_dark-theme.scss`
```scss
@media (prefers-color-scheme: dark) {
  :root {
    --color-infocard-info: #4dabf7;
    --color-infocard-bg: #041e49;
    --color-infocard-bg--hover: #0a2f5c;
  }
}
```

## When to Use Scoped Variables

### ✅ Use --_ When:
- Applying color transformations (`color-mix()`, `color()`)
- Calculating values (`calc()`)
- Responsive overrides
- State variations within component
- Combining multiple global vars

### ❌ Don't Use --_ When:
- Just copying global var directly
- No transformation needed
- Simple value assignment

## Example: Info Card Component
```scss
@use "../utils/" as *;

.info-card {
  // Color transformations
  --_bg-overlay: color-mix(in srgb, var(--color-infocard-bg) 85%, transparent);
  --_border-soft: color-mix(in srgb, var(--color-infocard-info) 15%, transparent);

  // Non-color transformations
  --_padding: calc(var(--spacing-base) * 2);
  --_shadow: var(--box-shadow-300);

  background: var(--_bg-overlay);
  border: 1px solid var(--_border-soft);
  padding: var(--_padding);
  box-shadow: var(--_shadow);

  &__icon {
    color: var(--color-infocard-info); // Direct global (no transformation)
  }

  @include mobile-only {
    --_padding: var(--spacing-base); // Smaller on mobile
    --_shadow: var(--box-shadow-100); // Lighter shadow
  }

  &:hover {
    --_shadow: var(--box-shadow-500); // Deeper shadow on hover
  }
}
```

## File Locations
- Non-themed: `sass/utils/_variables.scss`
- Light theme: `sass/themes/_light-theme.scss`
- Dark theme: `sass/themes/_dark-theme.scss`
