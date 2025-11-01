---
name: sass-use-vs-import
description: Always use @use instead of @import for loading SASS modules and utilities.
---

# @use vs @import

## Rule
**ALWAYS** use `@use`, **NEVER** use `@import`.

## Why @use?
- Namespaced imports (no conflicts)
- Loaded once (better performance)
- Private members (_, -prefixed)
- Modern SASS standard
- `@import` is deprecated

## ✅ Good (@use)
```scss
@use "../../../sass/utils/" as *;

.component {
  @include center-flex(16px); // From utils
  color: var(--color-primary);
}
```

## ❌ Bad (@import - Deprecated)
```scss
@import "../../../sass/utils/mixins";
@import "../../../sass/utils/variables";

.component {
  @include center-flex(16px);
}
```

## Import Pattern
Every component SCSS file should start with:
```scss
@use "../../../sass/utils/" as *;
```

The `as *` loads all mixins/variables into global namespace.

## Project Standard
**ALWAYS** import the entire utils folder as global namespace:

```scss
@use "../../../sass/utils/" as *;
```

**NEVER** import individual files (mixins, variables, functions separately).

Adjust path based on file location:
- `src/app/components/`: `@use "../../../sass/utils/" as *;`
- `src/app/routes/`: `@use "../../../sass/utils/" as *;`
- `src/sass/components/`: `@use "../utils/" as *;`

## Important
Always use CSS custom properties (`var(--color-primary)`), not SASS variables (`$primary-color`).
