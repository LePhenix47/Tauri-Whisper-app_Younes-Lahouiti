# Coding Standards

## TypeScript/React

### Component Structure
```typescript
import { useState } from "react";
import "./ComponentName.scss";

interface ComponentNameProps {
  title: string;
  onAction: () => void;
}

function ComponentName({ title, onAction }: ComponentNameProps) {
  const [state, setState] = useState<string>("");

  return (
    <div className="component-name">
      <h2>{title}</h2>
      <button onClick={onAction}>Action</button>
    </div>
  );
}

export default ComponentName;
```

### Rules
- ✅ Functional components only (no class components)
- ✅ TypeScript strict mode
- ✅ Props interfaces for all components
- ✅ Avoid `any` types - use `unknown` if truly unknown
- ✅ Use descriptive variable names
- ❌ No inline styles (use SASS)
- ❌ No default exports for utilities (named exports only)

---

## SASS

### File Organization (7-1 Pattern)
```
sass/
├── base/           # Resets, typography
├── components/     # Component-specific styles
├── layout/         # Layout elements (header, footer)
├── pages/          # Page-specific styles
├── themes/         # Theme variations
├── utils/          # Variables, mixins, functions
└── main.scss       # Main entry (imports all)
```

### Importing Utils
```scss
@use "../utils/" as *;

.my-component {
  @include center-flex(10px);

  background-color: var(--bg-primary);
  color: var(--color-primary);
}
```

### CSS Variables
- ✅ Use existing variables from `utils/_variables.scss`
- ✅ Define component-specific variables with `--_` prefix (scoped)
- ✅ Use semantic names (`--color-primary` not `--blue`)
- ❌ Don't hardcode colors/spacing (use variables)

### Example Component Style
```scss
@use "../utils/" as *;

.button {
  --_bg: var(--color-primary);
  --_color: var(--bg-primary);
  --_padding: 10px 20px;

  background-color: var(--_bg);
  color: var(--_color);
  padding: var(--_padding);

  @include mobile-only {
    padding: 8px 16px;
  }

  &:hover {
    --_bg: var(--color-primary--hover);
  }
}
```

### Responsive Design
Use mixins from `utils/_mixins.scss`:
```scss
.element {
  font-size: 16px;

  @include mobile-only {
    font-size: 14px;
  }

  @include desktop-only {
    font-size: 18px;
  }
}
```

**Breakpoints:**
- Mobile: ≤768px
- Tablet: 768px–992px
- Laptop: 992px–1150px
- Desktop Small: 1150px–1475px
- Desktop: ≥1475px

---

## Rust

### Tauri Commands
```rust
#[tauri::command]
fn process_audio(file_path: String) -> Result<String, String> {
    // Process audio file
    match do_processing(&file_path) {
        Ok(result) => Ok(result),
        Err(e) => Err(e.to_string()),
    }
}

// Register in main()
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![process_audio])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### Rules
- ✅ Use `Result<T, E>` for functions that can fail
- ✅ Convert errors to strings for frontend: `Err(e.to_string())`
- ✅ Keep commands small and focused
- ✅ Use meaningful function/variable names
- ❌ No unwrap() in production code (use proper error handling)

---

## Git

### Commit Messages
```
<type>: <short description>

- Change 1
- Change 2
- Change 3

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style (formatting, no logic change)
- `refactor` - Code refactoring
- `test` - Adding/updating tests
- `chore` - Maintenance (deps, config)

### Branch Naming
- `feature/feature-name`
- `fix/bug-description`
- `docs/update-readme`

---

## Naming Conventions

### Files
- React components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- SASS partials: `_lowercase.scss`
- SASS main: `lowercase.scss`

### Variables/Functions
- TypeScript: `camelCase`
- React components: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- CSS classes: `kebab-case`
- CSS variables: `--kebab-case`
- SASS variables: `$kebab-case`

### Examples
```typescript
// TypeScript
const audioFilePath = "/path/to/file.mp3";
const MAX_FILE_SIZE = 100 * 1024 * 1024;

function processAudioFile(path: string): void {}

// React
function AudioPlayer({ fileName }: AudioPlayerProps) {}

// CSS
.audio-player {
  --_player-bg: var(--bg-primary);
}
```

---

## Accessibility

### Required
- ✅ Semantic HTML (`<button>`, `<nav>`, `<main>`, etc.)
- ✅ Alt text for images
- ✅ Keyboard navigation support
- ✅ ARIA labels where needed
- ✅ Color contrast (WCAG AA minimum)
- ✅ Respect `prefers-reduced-motion`

### Example
```tsx
<button
  onClick={handleClick}
  aria-label="Play audio"
  disabled={isProcessing}
>
  {isProcessing ? "Processing..." : "Play"}
</button>
```

---

## Performance

### React
- ✅ Use `useMemo` for expensive calculations
- ✅ Use `useCallback` for event handlers passed to children
- ✅ Lazy load routes/components
- ❌ Don't optimize prematurely

### SASS
- ✅ Keep selectors shallow (max 3 levels)
- ✅ Avoid overly complex selectors
- ✅ Use CSS variables instead of SASS variables when possible (themeable)

---

## Testing (Future)

### Unit Tests
- Component logic
- Utility functions
- Rust functions

### Integration Tests
- Frontend ↔ Backend communication
- File processing workflows

### E2E Tests
- Critical user flows
- Subtitle generation end-to-end

---

**Last Updated**: 2025-10-04
