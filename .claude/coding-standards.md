
# 🧭 CODING STANDARDS

Consistent, scalable, and readable code across the stack:
React + TypeScript (Frontend) · SASS (Styling) · Rust (Backend) · Git (Version Control)

1. TYPESCRIPT & REACT

### 1.1 COMPONENT STRUCTURE

```tsx
import { useState } from "react";
import "./ComponentName.scss";

type ComponentNameProps = {
  title: string;
  onAction: () => void;
};

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

### 1.2 RULES

✅ DO:

- Use function declarations for React components.
- Use arrow functions in classes to avoid `this` binding.
- Strongly type props, state, and return values.
- Enable TypeScript strict mode.
- Use descriptive, self-explanatory variable names.
- Prefer `unknown` over `any`
- Use guard clause to avoid nesting if() statements when possible

❌ DON'T:

- Use `interface` to declare types (prefer `type`)
- Use inline styles
- Default-export utilities
- Forget to remove event listeners in the `useEffect` if we added one

2. SASS / STYLING

### 2.1 FOLDER ORGANIZATION (7-1 PATTERN)

```
sass/
├ base/           # Resets, typography
├ components/     # Component-specific styles
├ layout/         # Layout elements (header, footer)
├ pages/          # Page-specific styles
├ themes/         # Theme variations
├ utils/          # Variables, mixins, functions
└ main.scss       # Main entry (imports all)
```

### 2.2 NAMING & METHODOLOGY

✅ DO:

- Use BEM (Block–Element–Modifier) for class naming.
  Example: .button__icon--active
- Keep selectors shallow (avoid over-nesting).
- Use semantic, purpose-driven class names (.sidebar__toggle, not .left-btn).
- Create SASS functions to improve DX

❌ DON'T:

- Use camelCase or snake_case in class names.
- Mix utility and semantic classes.
- Create SASS functions which aren't needed

### 2.3 CSS VARIABLES

✅ DO:

- Define and reuse variables from utils/_variables.scss.
- Use scoped component variables with --_ prefix.
- Use semantic variable names (--color-primary, not --blue).

❌ DON'T:

- Hardcode colors, sizes, or spacing.
- Use SASS $variables for theme values (use CSS vars instead).

### 2.4 EXAMPLE

```scss
@use "../utils/" as *;

.paragraph {
  --_bg: var(--color-primary);
  --_color: var(--bg-primary);
  --_padding: 20px;

  background-color: var(--_bg);
  color: var(--_color);
  padding: var(--_padding);

  inline-size: calc(100% - var(--_padding));

  @include mobile-only {
    --_padding: 8px;
  }

  &:hover {
    --_bg: var(--color-primary--hover);
  }
}
```

3. RUST (TAURI BACKEND)

### 3.1 EXAMPLE COMMAND

```rust
#[tauri::command]
fn process_audio(file_path: String) -> Result<String, String> {
    match do_processing(&file_path) {
        Ok(result) => Ok(result),
        Err(e) => Err(e.to_string()),
    }
}
```

### 3.2 RULES

✅ DO:

- Use Result<T, E> for fallible operations.
- Convert errors to strings for frontend consumption.
- Keep each command small and focused.

❌ DON'T:

- Use unwrap() or expect() in production.

4. GIT STANDARDS

### 4.1 COMMIT MESSAGES

```
<type>: <short summary>

- Change 1
- Change 2

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

**TYPES:**

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting only
- `refactor` - Code restructuring
- `test` - Tests
- `chore` - Maintenance / config

### 4.2 BRANCH NAMING

```
feature/<name>
fix/<description>
docs/<topic>
```

5. NAMING CONVENTIONS

Context               | Convention       | Example
┼┼
React Components      | PascalCase       | AudioPlayer.tsx
Variables / Functions | camelCase        | processAudioFile()
Constants             | UPPER_SNAKE_CASE | MAX_FILE_SIZE
CSS Classes           | kebab-case       | .audio-player-card
Global CSS Vars       | --kebab-case     | --color-primary
Local CSS Vars        | --_kebab-case    | --_padding-inline
SASS Partials         | _lowercase.scss  |_mixins.scss

6. ACCESSIBILITY

✅ DO:

- Use semantic HTML (<button>, <main>, <nav>, etc.)
- Add alt text and ARIA labels.
- Ensure full keyboard navigation.
- Maintain WCAG AA contrast ratio.
- Respect prefers-reduced-motion.

**Example:**

```tsx
<button
  onClick={handleClick}
  aria-label="Play audio"
  disabled={isProcessing}
>
  {isProcessing ? "Processing..." : "Play"}
</button>
```

7. PERFORMANCE

### 7.1 REACT

✅ DO:

- Use useMemo and useCallback for expensive work.
- Lazy-load components and routes.
- Use useReducer or useTransition for complex state.

❌ DON'T:

- Optimize prematurely.

### 7.2 SASS

✅ DO:

- Keep selectors shallow (≤3 levels).
- Use CSS variables for theming.

❌ DON'T:

- Over-nest selectors.

8. TESTING (FUTURE)

Type            | Scope
┼
Unit Tests      | Component logic, utilities, Rust functions
Integration     | Frontend ↔ Backend communication
E2E Tests       | Core user flows, subtitle generation

Potential Storybook integration for UI testing.

LAST UPDATED: 2025-10-04
