---
name: sass-loops
description: Use SASS loops (@for, @each, @while) to generate repetitive CSS patterns efficiently.
---

# SASS Loops

## @for Loop
Use for **numeric iterations**.

### Syntax
```scss
@for $i from 1 through 5 {
  .column-#{$i} {
    width: calc(100% / 5 * $i);
  }
}
```

**Output:**
```css
.column-1 { width: 20%; }
.column-2 { width: 40%; }
.column-3 { width: 60%; }
.column-4 { width: 80%; }
.column-5 { width: 100%; }
```

### `through` vs `to`
```scss
@for $i from 1 through 3 { } // 1, 2, 3
@for $i from 1 to 3 { }      // 1, 2 (excludes 3)
```

## @each Loop
Use for **iterating over lists or maps**.

### List Iteration
```scss
$sizes: small, medium, large;

@each $size in $sizes {
  .button--#{$size} {
    @if $size == small {
      font-size: 12px;
      padding: 8px;
    } @else if $size == medium {
      font-size: 16px;
      padding: 12px;
    } @else {
      font-size: 20px;
      padding: 16px;
    }
  }
}
```

### Map Iteration
```scss
$colors: (
  primary: #007bff,
  danger: #dc3545,
  success: #28a745
);

@each $name, $color in $colors {
  .bg-#{$name} {
    background-color: $color;
  }

  .text-#{$name} {
    color: $color;
  }
}
```

**Output:**
```css
.bg-primary { background-color: #007bff; }
.text-primary { color: #007bff; }
.bg-danger { background-color: #dc3545; }
/* ... */
```

## @while Loop
Use for **conditional iterations** (rare, prefer @for/@each).

```scss
$i: 1;
@while $i <= 3 {
  .spacing-#{$i} {
    margin: $i * 8px;
  }
  $i: $i + 1;
}
```

## ✅ Good Use Cases

### Circular Positioning (CSS Variables + Trigonometry)
```scss
.circle {
  --_angle: 0deg;
  --_radius: 150px;
  --_cos-theta: calc(cos(var(--_angle)) * var(--_radius));
  --_sin-theta: calc(sin(var(--_angle)) * var(--_radius));
  transform: translateX(var(--_cos-theta)) translateY(var(--_sin-theta));
}

@for $i from 1 through 12 {
  .circle:nth-of-type(#{$i + 1}) {
    --_angle: #{$i * 30deg}; // 360deg / 12 = 30deg per item
  }
}
```

### Z-Index Layers
```scss
$layers: (
  dropdown: 100,
  modal: 200,
  tooltip: 300,
  notification: 400
);

@each $name, $z in $layers {
  .z-#{$name} {
    z-index: $z;
  }
}
```

### Staggered Animation Delays
```scss
@for $i from 1 through 8 {
  .item:nth-child(#{$i}) {
    animation-delay: calc(#{$i} * 0.1s);
  }
}
```

## Multiple Variables in @each
```scss
$icons: (home, "\f015"), (user, "\f007"), (settings, "\f013");

@each $name, $unicode in $icons {
  .icon-#{$name}::before {
    content: $unicode;
  }
}
```

## Don't Overuse
Only use loops when generating **truly repetitive patterns**. Don't use for one-off styles.
