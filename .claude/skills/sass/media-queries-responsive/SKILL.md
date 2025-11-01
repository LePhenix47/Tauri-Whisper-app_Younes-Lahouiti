---
name: sass-media-queries-responsive
description: Use existing responsive mixins from utils/_mixins.scss for mobile-first responsive design.
---

# SASS Media Queries & Responsive Design

## Rule
Always use the responsive mixins from `sass/utils/_mixins.scss`. Never write raw `@media` queries.

## Available Breakpoints

```scss
@include mobile-only { }        // width <= 768px
@include tablet-only { }        // 768px <= width <= 992px
@include laptop-only { }        // 992px <= width <= 1150px
@include desktop-small-only { } // 1150px <= width <= 1475px
@include desktop-only { }       // width >= 1475px
@include device-orientation(portrait) { }  // or landscape
```

## ✅ Good (Use Mixins)
```scss
.my-component {
  font-size: 18px;
  padding: 20px;

  @include mobile-only {
    font-size: 14px;
    padding: 10px;
  }

  @include tablet-only {
    font-size: 16px;
    padding: 15px;
  }
}
```

## ❌ Bad (Raw Media Queries)
```scss
.my-component {
  font-size: 18px;

  @media screen and (max-width: 768px) {
    font-size: 14px;
  }
}
```

## Mobile-First Approach
Start with mobile styles, then override for larger screens:

```scss
.card {
  // Mobile-first base styles
  padding: 10px;
  font-size: 14px;

  // Tablet and up
  @include tablet-only {
    padding: 15px;
    font-size: 16px;
  }

  // Desktop and up
  @include desktop-only {
    padding: 20px;
    font-size: 18px;
  }
}
```
