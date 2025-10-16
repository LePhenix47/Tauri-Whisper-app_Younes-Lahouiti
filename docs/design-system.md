# Design System

## Philosophy

- **Customization first**: Comprehensive resets with CSS variables for easy theming
- **Cross-browser consistency**: One variable changes styles across all browsers
- **Accessibility-first**: Reduced motion, screen readers, high contrast support
- **No framework bloat**: Pure SASS, no Bootstrap/Tailwind

---

## Colors

### Light Theme (Default)
Defined in `sass/utils/_variables.scss`:

```scss
:root {
  // Backgrounds
  --bg-primary: white;
  --bg-secondary: white;
  --semi-transparent-bg: rgba(255, 255, 255, 70%);

  // Text Colors
  --color-primary: #323232;          // Main text
  --color-primary--hover: #3c3c3c;   // Hover state
  --color-primary--active: #474747;  // Active state
  --color-secondary: #757575;        // Secondary text

  // UI Elements
  --border-color: #DBDBDB;
  --editor-bg-color: #F5F5F5;

  // Scrollbar
  --scrollbar-track-bg-color: white;
  --scrollbar-thumb-bg-color: #545454;
  --scrollbar-thumb-bg-color--hover: #757575;
  --scrollbar-thumb-bg-color--active: #b0b0b0;
}
```

### Dark Theme
Auto-activated via `@media (prefers-color-scheme: dark)`:

```scss
:root {
  --bg-primary: #0f0f0f;
  --bg-secondary: black;
  --color-primary: #cdcdcd;
  --color-primary--hover: #bfbfbf;
  --color-primary--active: #a3a3a3;
  // ... etc
}
```

### Usage
```scss
.component {
  background-color: var(--bg-primary);
  color: var(--color-primary);
  border: 1px solid var(--border-color);

  &:hover {
    color: var(--color-primary--hover);
  }
}
```

---

## Typography

### Font Stack
```scss
body {
  font-family: "Roboto", system-ui, -apple-system, BlinkMacSystemFont,
    'Segoe UI', Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue',
    sans-serif;
}
```

### Font Weights
- 100: Thin
- 400: Regular
- 500: Medium
- 700: Bold

### Scale (To be defined)
```scss
// Example scale
h1 { font-size: 2.5rem; }
h2 { font-size: 2rem; }
h3 { font-size: 1.75rem; }
p  { font-size: 1rem; }
```

---

## Spacing

### To Be Defined
Current custom properties:
```scss
--timeline-space: 100px;
```

**TODO**: Establish consistent spacing scale (4px, 8px, 16px, 24px, 32px, etc.)

---

## Components

### Buttons
Use the `link-btn-styling` mixin:

```scss
@use "../utils/" as *;

.my-button {
  @include link-btn-styling;

  // Override defaults if needed
  width: 200px;
}
```

**Default styling:**
- Width: 240px (160px on mobile)
- Padding: 20px 25px (10px 15px on mobile)
- Border radius: 15px
- Background: `--color-primary`
- Color: `--bg-secondary`
- Transitions on hover/active

### Inputs
Use the `inputs-styling` mixin:

```scss
input,
textarea {
  @include inputs-styling;
}
```

**Default styling:**
- Transparent background
- 2px border with `--border-color`
- Focus: border becomes `--scrollbar-thumb-bg-color`
- Padding: 10px 15px
- Border radius: 5px

### Cards
Use the `card-styling` mixin:

```scss
.card {
  @include card-styling;
  padding: 20px;
}
```

**Default styling:**
- 2px border with `--border-color`
- Border radius: 10px
- Semi-transparent background

---

## Layout Utilities

### Flexbox

#### Center (Horizontal + Vertical)
```scss
.container {
  @include center-flex(10px); // 10px gap
}
```

#### Center Column
```scss
.container {
  @include center-flex-column(15px);
}
```

### Grid
```scss
.grid {
  @include grid($rows: 3, $columns: 4, $gap: 20px);
}
```

### Absolute Center
```scss
.modal {
  @include absolute-center;
  // Positions at 50% inset with -50% translate
}
```

---

## Responsive Design

### Breakpoints
```scss
@include mobile-only {
  // width ≤ 768px
}

@include tablet-only {
  // 768px ≤ width ≤ 992px
}

@include laptop-only {
  // 992px ≤ width ≤ 1150px
}

@include desktop-small-only {
  // 1150px ≤ width ≤ 1475px
}

@include desktop-only {
  // width ≥ 1475px
}
```

### Device Orientation
```scss
@include device-orientation(landscape) {
  // Landscape mode
}

@include device-orientation(portrait) {
  // Portrait mode
}
```

---

## Utility Mixins

### Image Fit
```scss
img {
  @include fit-image;
  // object-fit: cover + object-position: center
}
```

### Text Ellipsis

**Single Line:**
```scss
.title {
  @include single-ellipsis-effect;
}
```

**Multi-line:**
```scss
.description {
  @include multiline-ellipsis-effect($columns: 3);
  // Shows ellipsis after 3 lines
}
```

---

## Utility Classes

### JavaScript Interaction Classes

#### Hide Element
```html
<div class="hide">Hidden</div>
```

#### Screen Readers Only
```html
<span class="screen-readers-only">For screen readers</span>
```

#### No Pointer Events
```html
<div class="no-pointer-events">Not clickable</div>
```

#### Square
```html
<div class="square" style="--_size: 50px;">50x50</div>
```

---

## Scrollbar Customization

### Global Scrollbar
Defined in `sass/components/_scrollbar.scss` - automatically styled.

### Custom Scrollbar Per Component
```scss
.custom-scroll {
  --_scrollbar-width: 10px;
  --_scrollbar-thumb-bg: red;
  --_scrollbar-thumb-bg-hover: darkred;

  overflow-y: auto;
}
```

**Available variables:**
- `--_scrollbar-bg`
- `--_scrollbar-track-bg`
- `--_scrollbar-width` / `--_scrollbar-height`
- `--_scrollbar-thumb-bg`
- `--_scrollbar-thumb-bg-hover`
- `--_scrollbar-thumb-bg-active`
- `--_scrollbar-border-radius`
- `--_scrollbar-margin-block` / `--_scrollbar-margin-inline`

---

## Input Customization

### Range Slider (Default Style)
```scss
input[type="range"] {
  --_track-bg: #e9e9ed;
  --_track-width: 200px;
  --_track-height: 20px;

  --_thumb-bg: #484851;
  --_thumb-width: 20px;
  --_thumb-height: 20px;

  --_inner-track-bg: #2374ff; // Progress color
}
```

### Range Slider (Overflowing Thumb)
```html
<input type="range" data-range-style="overflowing-thumb" />
```

```scss
input[type="range"][data-range-style="overflowing-thumb"] {
  --_progress-bg: blue;
  --_range-bg: rgba(0, 0, 0, 25%);
  --_thumb-size: 20px;
}
```

### Color Input
```scss
input[type="color"] {
  --_color-swatch-border-radius: 50%;
  --_color-swatch-border-width: 2px;
}
```

### File Input
```scss
input[type="file"] {
  --_file-selector-display: none; // Hide default button
}
```

---

## Animations (Future)

### GSAP Integration
- Complex animations
- Timeline-based sequences
- Scroll-triggered effects

### CSS Animations
- Simple transitions (hover, focus)
- Keyframes for loaders/spinners

**TODO**: Define animation library and patterns

---

## Accessibility

### Built-in Features

#### Reduced Motion
Automatically disables animations if user has `prefers-reduced-motion: reduce`:

```scss
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
```

#### Screen Reader Utilities
```html
<span class="screen-readers-only">Hidden from view</span>
<button class="screen-reader-focusable">Visible on focus</button>
```

#### High Contrast Mode
Borders use `transparent` by default - become visible in high contrast mode.

---

## Theme Switching (Future)

### Manual Theme Toggle
Currently auto-detects via `prefers-color-scheme`.

**TODO**: Add manual theme switcher with localStorage persistence.

```typescript
// Example implementation
const [theme, setTheme] = useState<'light' | 'dark'>('light');

useEffect(() => {
  document.documentElement.setAttribute('data-theme', theme);
}, [theme]);
```

```scss
// In SASS
[data-theme="dark"] {
  --bg-primary: #0f0f0f;
  // ...
}
```

---

## Component Library (Future - Storybook?)

**Planned components:**
- Buttons (primary, secondary, icon)
- Inputs (text, file, range, color)
- Cards
- Modals/Dialogs
- Dropzone
- Progress bars
- Loading spinners

**TODO**: Set up Storybook (if we dare 😅)

---

**Last Updated**: 2025-10-04
