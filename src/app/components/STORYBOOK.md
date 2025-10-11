# Storybook Usage Guide

## The Modern Way (CSF3)

Creating stories is now **dead simple** with CSF3 (Component Story Format 3).

### Basic Pattern

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { MyComponent } from "./MyComponent";

const meta = {
  title: "Category/MyComponent", // Shows in sidebar
  component: MyComponent,
  tags: ["autodocs"], // Auto-generates documentation
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

// Each export is a story - that's it!
export const Default: Story = {
  args: {
    prop1: "value",
    prop2: true,
  },
};

export const AnotherVariant: Story = {
  args: {
    prop1: "different value",
  },
};
```

### That's It!

No classes, no decorators, no complex config. Just:
1. Define `meta` with your component
2. Export stories as objects with `args`

## Real Example

See [Card.stories.tsx](./shared/Card/Card.stories.tsx) for a complete example.

## File Structure

```
src/app/components/
├── shared/                # Reusable shared components
│   ├── Card/
│   │   ├── Card.tsx
│   │   └── Card.stories.tsx
│   ├── Sidebar/
│   │   ├── Sidebar.tsx
│   │   └── Sidebar.stories.ts
└── STORYBOOK.md           # This file
```

## Running Storybook

```bash
bun run storybook
# Opens at http://localhost:6006
```

## Meta Configuration Properties

The `meta` object configures your component's Storybook setup. Here's every property explained:

### `title` (string)
Where your component appears in the Storybook sidebar.

```tsx
title: "Example/Button"
// Creates: Example > Button in sidebar

title: "UI/Forms/Input"
// Creates: UI > Forms > Input (nested folders)
```

Use `/` to organize components hierarchically.

---

### `component` (React Component)
The component you're documenting.

```tsx
component: Button
// Storybook extracts props, types, and JSDoc comments automatically
```

**Pro tip:** Add JSDoc comments to your props - they show up in auto-generated docs!

```tsx
interface ButtonProps {
  /** Is this the principal call to action on the page? */
  primary?: boolean;
  /** How large should the button be? */
  size?: 'small' | 'medium' | 'large';
}
```

---

### `tags` (string[])
Enable special features.

```tsx
tags: ["autodocs"]
// Auto-generates a documentation page from your component's props and JSDoc
```

Other useful tags:
- `"dev-only"` - Only show in development
- `"test"` - Mark as test story

---

### `parameters` (object)
Configure how stories are displayed.

#### `layout`
Controls story canvas layout:

```tsx
parameters: {
  layout: "centered"    // Centers component (good for buttons, cards)
  // OR
  layout: "fullscreen"  // Full viewport (good for headers, pages)
  // OR
  layout: "padded"      // Default, adds padding around component
}
```

#### `backgrounds`
Customize background colors:

```tsx
parameters: {
  backgrounds: {
    default: "dark",
    values: [
      { name: "light", value: "#fff" },
      { name: "dark", value: "#333" },
      { name: "brand", value: "#ff0000" },
    ],
  },
}
```

#### Other useful parameters:
```tsx
parameters: {
  // Control viewport sizes
  viewport: {
    defaultViewport: "iphone6",
  },

  // Add padding/margin
  layout: "centered",

  // Disable specific addons for this story
  a11y: { disable: true },
}
```

---

### `argTypes` (object)
Customize controls for props.

```tsx
argTypes: {
  // Color picker
  backgroundColor: {
    control: "color"
  },

  // Dropdown select
  variant: {
    control: "select",
    options: ["primary", "secondary", "tertiary"],
  },

  // Radio buttons
  size: {
    control: "radio",
    options: ["small", "medium", "large"],
  },

  // Range slider
  opacity: {
    control: { type: "range", min: 0, max: 1, step: 0.1 },
  },

  // Text input
  label: {
    control: "text",
  },

  // Boolean toggle
  disabled: {
    control: "boolean",
  },

  // Date picker
  createdAt: {
    control: "date",
  },

  // Hide from controls
  onClick: {
    control: false,
  },
}
```

**Available control types:**
- `boolean` - Checkbox
- `text` - Text input
- `number` - Number input
- `range` - Slider
- `color` - Color picker
- `date` - Date picker
- `select` - Dropdown
- `radio` - Radio buttons
- `object` - JSON editor
- `file` - File upload

---

### `args` (object)
Default prop values shared across all stories.

```tsx
const meta = {
  component: Button,
  args: {
    onClick: fn(),  // Track all onClick calls
    disabled: false, // Default to enabled
  },
};

// Now all stories inherit these args
export const Primary: Story = {
  args: {
    label: "Click me",  // Only override what's different
  },
};
```

Use `fn()` from `storybook/test` to spy on function calls - they appear in the **Actions** panel.

---

### `decorators` (function[])
Wrap stories with extra UI (providers, padding, etc.).

```tsx
const meta = {
  component: MyComponent,
  decorators: [
    (Story) => (
      <div style={{ margin: "3em" }}>
        <Story />
      </div>
    ),
  ],
};
```

**Common use cases:**
```tsx
// Add theme provider
decorators: [
  (Story) => (
    <ThemeProvider theme={darkTheme}>
      <Story />
    </ThemeProvider>
  ),
],

// Add router context
decorators: [
  (Story) => (
    <MemoryRouter>
      <Story />
    </MemoryRouter>
  ),
],

// Add Zustand store
decorators: [
  (Story) => (
    <QueryProvider>
      <Story />
    </QueryProvider>
  ),
],
```

---

### `render` (function)
Custom rendering logic (advanced).

```tsx
const meta = {
  component: Button,
  render: (args) => {
    const [count, setCount] = useState(0);
    return (
      <Button {...args} onClick={() => setCount(count + 1)}>
        Clicked {count} times
      </Button>
    );
  },
};
```

Use this when you need state or complex logic.

---

## Story Configuration Properties

Individual stories can override meta settings.

```tsx
export const LargeButton: Story = {
  args: {
    size: "large",
    label: "Big Button",
  },

  parameters: {
    layout: "fullscreen", // Override layout for this story only
  },

  // Custom rendering for this story
  render: (args) => (
    <div style={{ display: "flex", gap: "1rem" }}>
      <Button {...args} />
      <Button {...args} label="Another one" />
    </div>
  ),
};
```

---

## Complete Example (Annotated)

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Button } from "./Button";

const meta = {
  // Sidebar location
  title: "UI/Button",

  // Your component
  component: Button,

  // Center it on the canvas
  parameters: {
    layout: "centered",
  },

  // Auto-generate documentation
  tags: ["autodocs"],

  // Customize controls
  argTypes: {
    backgroundColor: { control: "color" },
    size: {
      control: "select",
      options: ["small", "medium", "large"],
    },
  },

  // Default args for all stories
  args: {
    onClick: fn(), // Track clicks in Actions panel
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// ✅ Primary variant
export const Primary: Story = {
  args: {
    primary: true,
    label: "Button",
  },
};

// ✅ Secondary variant
export const Secondary: Story = {
  args: {
    label: "Button",
  },
};

// ✅ Different size
export const Large: Story = {
  args: {
    size: "large",
    label: "Button",
  },
};
```

## Common Patterns

### Layout Centering
```tsx
parameters: {
  layout: "centered",
}
```

### Background Colors
```tsx
parameters: {
  backgrounds: {
    default: "dark",
    values: [
      { name: "dark", value: "#333" },
      { name: "light", value: "#fff" },
    ],
  },
}
```

### Mocking Tauri Invoke
```tsx
// In your story
import { fn } from "storybook/test";

export const WithMockedBackend: Story = {
  args: {
    onDownload: fn(async () => "Download complete!"),
  },
};
```

## Tips

1. **Keep stories next to components** - easier to maintain
2. **One story per component variant** - makes testing easier
3. **Use `args` for data** - enables interactive controls
4. **Add JSDoc comments** - they appear in auto-docs
5. **Test edge cases** - empty states, loading, errors

## Resources

- [Storybook Docs](https://storybook.js.org/docs/react/writing-stories/introduction)
- [CSF3 Format](https://storybook.js.org/docs/react/api/csf)
- [Example: Card Component](./shared/Card/Card.stories.tsx)
