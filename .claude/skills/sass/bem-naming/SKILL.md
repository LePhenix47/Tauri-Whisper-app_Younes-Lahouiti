---
name: sass-bem-naming
description: Use BEM (Block Element Modifier) naming convention for all CSS class names in SASS files.
---

# SASS BEM Naming

## Pattern
`.block__element--modifier`

## ✅ Good (BEM)
```scss
.audio-player { // Block
  &__controls { // Element
    &--disabled { // Modifier
      opacity: 0.5;
    }
  }

  &__button { // Element
    &--primary { // Modifier
      background: blue;
    }
  }
}
```

Compiles to:
```css
.audio-player { }
.audio-player__controls { }
.audio-player__controls--disabled { }
.audio-player__button { }
.audio-player__button--primary { }
```

## ❌ Bad (Not BEM)
```scss
.audioPlayer { } // camelCase
.audio_player { } // snake_case
.audio-player .controls { } // Nested without __
.audio-player-disabled { } // Missing --
```

## BEM Rules
- **Block**: `.component-name` (kebab-case)
- **Element**: `__element-name` (double underscore)
- **Modifier**: `--modifier-name` (double hyphen)

## When to Use
- Block: Independent component
- Element: Part of a block (can't exist alone)
- Modifier: Variation of block or element
