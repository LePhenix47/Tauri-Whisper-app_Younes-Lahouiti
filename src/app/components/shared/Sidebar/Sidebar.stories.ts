import type { Meta, StoryObj } from "@storybook/react";
import { Sidebar } from "./Sidebar";

const meta: Meta<typeof Sidebar> = {
  title: "Shared/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Application sidebar navigation with collapsible functionality. Uses Zustand store for state management and TanStack Router for navigation.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

/**
 * Default sidebar state (open by default based on Zustand initial state)
 */
export const Default: Story = {};

/**
 * Sidebar in open state showing full navigation labels
 */
export const Open: Story = {
  parameters: {
    docs: {
      description: {
        story: "Sidebar expanded showing navigation icons and labels.",
      },
    },
  },
};

/**
 * Sidebar in closed state showing only icons
 */
export const Closed: Story = {
  parameters: {
    docs: {
      description: {
        story: "Sidebar collapsed showing only navigation icons.",
      },
    },
  },
};

/**
 * Dark theme variant
 */
export const DarkTheme: Story = {
  parameters: {
    backgrounds: {
      default: "dark",
    },
    docs: {
      description: {
        story: "Sidebar in dark mode theme.",
      },
    },
  },
  decorators: [
    (Story) => {
      // Apply dark class to preview
      if (typeof document !== "undefined") {
        document.documentElement.classList.add("dark");
      }
      return Story();
    },
  ],
};
