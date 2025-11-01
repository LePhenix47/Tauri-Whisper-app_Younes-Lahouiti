---
name: sass-functions
description: Create and use SASS @function for reusable calculations and value transformations.
---

# SASS Functions

## When to Use
Use `@function` for calculations that **return a value**. Use `@mixin` for reusable **style blocks**.

## Basic Syntax
```scss
@function calculate-rem($px) {
  @return ($px / 16) * 1rem;
}

.component {
  font-size: calculate-rem(18); // 1.125rem
  padding: calculate-rem(20);   // 1.25rem
}
```

## ✅ Good Examples

### Color Manipulation
```scss
@function darken-color($color, $amount) {
  @return color-mix(in srgb, $color calc(100% - $amount), black $amount);
}

.button {
  background: var(--color-primary);

  &:hover {
    background: darken-color(var(--color-primary), 10%);
  }
}
```

### Spacing Scale
```scss
@function spacing($multiplier) {
  $base: 8px;
  @return $base * $multiplier;
}

.card {
  padding: spacing(2);     // 16px
  margin-bottom: spacing(3); // 24px
  gap: spacing(1);         // 8px
}
```

### Clamped Values
```scss
@function clamp-size($min, $preferred, $max) {
  @return clamp(#{$min}px, #{$preferred}vw, #{$max}px);
}

.heading {
  font-size: clamp-size(18, 3, 32);
  // clamp(18px, 3vw, 32px)
}
```

### Unit Conversion
```scss
@function strip-unit($value) {
  @return math.div($value, ($value * 0 + 1));
}

@function px-to-rem($px) {
  @return math.div(strip-unit($px), 16) * 1rem;
}
```

## Function vs Mixin

**Use @function when:**
- Returning a single value
- Doing calculations
- Converting units
- Manipulating colors

**Use @mixin when:**
- Outputting CSS rules
- Reusing style blocks
- Accepting @content

## ❌ Bad (Function for Styles)
```scss
@function button-styles() {
  // Functions should return values, not styles!
  @return (
    padding: 10px,
    background: blue
  );
}
```

## ✅ Good (Mixin for Styles)
```scss
@mixin button-styles {
  padding: 10px;
  background: blue;
}
```

## Advanced: Map Functions
```scss
$breakpoints: (
  mobile: 768px,
  tablet: 992px,
  desktop: 1475px
);

@function breakpoint($name) {
  @return map-get($breakpoints, $name);
}

@media (min-width: breakpoint(tablet)) {
  // ...
}
```

## Project Location
Add reusable functions to `sass/utils/_functions.scss`.
