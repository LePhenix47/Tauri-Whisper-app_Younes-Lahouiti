import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card } from "./Card";

/**
 * Card component for displaying content in a structured container.
 *
 * ## Usage
 * ```tsx
 * <Card title="My Title" description="Description text" variant="highlighted">
 *   <p>Card content goes here</p>
 * </Card>
 * ```
 */
const meta = {
  title: "UI/Card",
  component: Card,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "highlighted"],
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic card with just title
export const Default: Story = {
  args: {
    title: "Card Title",
  },
};

// Card with description
export const WithDescription: Story = {
  args: {
    title: "Card with Description",
    description: "This is a description of the card content",
  },
};

// Card with children content
export const WithContent: Story = {
  args: {
    title: "Card with Content",
    description: "This card has child content",
    children: (
      <div>
        <p>This is custom content inside the card.</p>
        <button>Action Button</button>
      </div>
    ),
  },
};

// Highlighted variant
export const Highlighted: Story = {
  args: {
    title: "Highlighted Card",
    description: "This card uses the highlighted variant",
    variant: "highlighted",
  },
};
