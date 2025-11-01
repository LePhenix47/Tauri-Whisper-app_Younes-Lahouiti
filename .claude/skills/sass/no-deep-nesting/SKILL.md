---
name: sass-no-deep-nesting
description: Keep SASS selectors shallow (≤3 levels) to avoid specificity issues and improve performance.
---

# No Deep Nesting in SASS

## Rule
Maximum 3 levels of nesting.

## ✅ Good (Shallow)
```scss
.card {
  padding: 20px;

  &__header {
    font-size: 1.5rem;
  }

  &__body {
    margin-top: 10px;

    &--expanded {
      height: auto;
    }
  }
}
```

## ❌ Bad (Deep Nesting)
```scss
.card {
  .header {
    .title {
      .icon {
        .svg {
          // 5 levels deep!
        }
      }
    }
  }
}
```

## Why?
- High specificity is hard to override
- Slower CSS performance
- Harder to maintain
- Creates tight coupling

## Refactoring Tip
Use BEM instead of nesting:
```scss
// Instead of deep nesting
.modal {
  .content {
    .body {
      .text { }
    }
  }
}

// Use BEM
.modal__content { }
.modal__body { }
.modal__text { }
```
