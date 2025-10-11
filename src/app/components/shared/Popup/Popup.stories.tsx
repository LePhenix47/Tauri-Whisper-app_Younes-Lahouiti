import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@heroui/react";
import { Popup } from "./Popup";

const meta = {
  title: "Components/Popup",
  component: Popup,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    isOpen: {
      control: "boolean",
      description: "Toggle popup open/closed state",
    },
    variant: {
      control: "select",
      options: ["center", "sliding", "bottom-sheet"],
      description: "The popup variant (center modal, sliding panel, or bottom sheet)",
    },
    title: {
      control: "text",
      description: "Title shown in the header",
    },
    showCloseButton: {
      control: "boolean",
      description: "Show/hide the close button in header",
    },
    closeOnMaskClick: {
      control: "boolean",
      description: "Allow closing by clicking the backdrop mask",
    },
    enableAnimation: {
      control: "boolean",
      description: "Enable/disable open and close animations",
    },
    usePortal: {
      control: "boolean",
      description: "Render in portal (body) or inline",
    },
    className: {
      control: "text",
      description: "Custom CSS class for the popup",
    },
    maskClassName: {
      control: "text",
      description: "Custom CSS class for the mask",
    },
    onClose: {
      description: "Callback when popup closes",
    },
    children: {
      control: false,
      description: "Popup content (React nodes)",
    },
  },
  args: {
    onClose: () => console.log("Popup closed"),
  },
} satisfies Meta<typeof Popup>;

export default meta;
type Story = StoryObj<typeof meta>;

// Playground with full controls
export const Playground: Story = {
  args: {
    isOpen: true,
    variant: "center",
    title: "Interactive Playground",
    showCloseButton: true,
    closeOnMaskClick: true,
    enableAnimation: true,
    usePortal: true,
    children: (
      <div>
        <h3>🎮 Interactive Playground</h3>
        <p>
          Use the <strong>Controls</strong> panel below to customize this popup!
        </p>
        <ul>
          <li>
            <strong>isOpen:</strong> Toggle to open/close the popup
          </li>
          <li>
            <strong>Variant:</strong> center, sliding, or bottom-sheet
          </li>
          <li>
            <strong>Title:</strong> Text shown in header
          </li>
          <li>
            <strong>Show Close Button:</strong> Toggle close button
          </li>
          <li>
            <strong>Close On Mask Click:</strong> Click backdrop to close
          </li>
          <li>
            <strong>Enable Animation:</strong> Toggle animations
          </li>
          <li>
            <strong>Use Portal:</strong> Render in portal vs inline
          </li>
        </ul>
        <p
          style={{
            marginTop: "2rem",
            padding: "1rem",
            background: "var(--bg-secondary)",
            borderRadius: "8px",
          }}
        >
          💡 <strong>Tip:</strong> Try toggling isOpen and changing the variant!
        </p>
      </div>
    ),
  },
};

// Center popup examples
export const CenterBasic: Story = {
  args: {
    isOpen: true,
    variant: "center",
    title: "Center Popup",
    children: (
      <div>
        <p>This is a basic centered popup.</p>
        <p>It appears in the middle of the screen with a fade + scale animation.</p>
      </div>
    ),
  },
};

export const CenterWithForm: Story = {
  args: {
    isOpen: true,
    variant: "center",
    title: "Settings",
    children: (
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>Username</label>
          <input
            type="text"
            placeholder="Enter username"
            style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid var(--border-color)" }}
          />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>Email</label>
          <input
            type="email"
            placeholder="Enter email"
            style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid var(--border-color)" }}
          />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>Bio</label>
          <textarea
            placeholder="Tell us about yourself"
            rows={4}
            style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid var(--border-color)" }}
          />
        </div>
        <Button color="primary" style={{ marginTop: "1rem" }}>
          Save Changes
        </Button>
      </div>
    ),
  },
};

export const CenterLongContent: Story = {
  args: {
    isOpen: true,
    variant: "center",
    title: "Terms of Service",
    children: (
      <div>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
          incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
          exercitation ullamco laboris.
        </p>
        <p>
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
          nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
          deserunt mollit anim id est laborum.
        </p>
        <p>
          Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque
          laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi
          architecto beatae vitae dicta sunt explicabo.
        </p>
        <p>
          Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia
          consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
        </p>
        <p>
          Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci
          velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam
          quaerat voluptatem.
        </p>
        <Button color="primary" style={{ marginTop: "1rem" }}>
          I Agree
        </Button>
      </div>
    ),
  },
};

export const CenterNoCloseButton: Story = {
  args: {
    isOpen: true,
    variant: "center",
    title: "No Close Button",
    showCloseButton: false,
    children: (
      <div>
        <p>This popup has no close button in the header.</p>
        <p>You can only close it by clicking the mask or pressing Escape.</p>
      </div>
    ),
  },
};

export const CenterNoTitle: Story = {
  args: {
    isOpen: true,
    variant: "center",
    children: (
      <div style={{ textAlign: "center" }}>
        <h2 style={{ marginTop: 0 }}>Custom Title Inside Content</h2>
        <p>This popup has no built-in title.</p>
        <p>The title is part of the content instead.</p>
      </div>
    ),
  },
};

export const CenterPreventMaskClick: Story = {
  args: {
    isOpen: true,
    variant: "center",
    title: "Action Required",
    closeOnMaskClick: false,
    children: (
      <div>
        <p>This popup cannot be closed by clicking the mask.</p>
        <p>You must use the close button or press Escape.</p>
        <p style={{ fontWeight: "bold", color: "red" }}>This is useful for critical actions!</p>
      </div>
    ),
  },
};

export const CenterNoAnimation: Story = {
  args: {
    isOpen: true,
    variant: "center",
    title: "No Animation",
    enableAnimation: false,
    children: (
      <div>
        <p>This popup opens and closes instantly without animation.</p>
        <p>Useful for accessibility or when animations cause performance issues.</p>
      </div>
    ),
  },
};

// Sliding window examples
export const SlidingBasic: Story = {
  args: {
    isOpen: true,
    variant: "sliding",
    title: "Sliding Window",
    children: (
      <div>
        <p>This popup slides in from the right side.</p>
        <p>Perfect for side panels, notifications, or detail views.</p>
      </div>
    ),
  },
};

export const SlidingWithList: Story = {
  args: {
    isOpen: true,
    variant: "sliding",
    title: "Notifications",
    children: (
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              padding: "1rem",
              background: "var(--bg-secondary)",
              borderRadius: "8px",
            }}
          >
            <h4 style={{ margin: "0 0 0.5rem 0" }}>Notification {i}</h4>
            <p style={{ margin: 0, fontSize: "0.9rem" }}>
              This is notification content for item {i}.
            </p>
          </div>
        ))}
      </div>
    ),
  },
};

export const SlidingFullHeight: Story = {
  args: {
    isOpen: true,
    variant: "sliding",
    title: "Long Content",
    children: (
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            style={{
              padding: "1rem",
              background: "var(--bg-secondary)",
              borderRadius: "8px",
            }}
          >
            <p style={{ margin: 0 }}>Item {i + 1}</p>
          </div>
        ))}
      </div>
    ),
  },
};

// Bottom sheet examples
export const BottomSheetBasic: Story = {
  args: {
    isOpen: true,
    variant: "bottom-sheet",
    title: "Bottom Sheet",
    children: (
      <div>
        <p>This popup slides in from the bottom.</p>
        <p>On mobile, it behaves like a native bottom sheet.</p>
        <p>Future: Will support drag-to-dismiss!</p>
      </div>
    ),
  },
};

export const BottomSheetWithActions: Story = {
  args: {
    isOpen: true,
    variant: "bottom-sheet",
    title: "Choose Action",
    children: (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <Button variant="flat" style={{ justifyContent: "flex-start" }}>
          📷 Take Photo
        </Button>
        <Button variant="flat" style={{ justifyContent: "flex-start" }}>
          🖼️ Choose from Library
        </Button>
        <Button variant="flat" style={{ justifyContent: "flex-start" }}>
          📁 Browse Files
        </Button>
        <Button variant="flat" color="danger" style={{ justifyContent: "flex-start" }}>
          🗑️ Remove Photo
        </Button>
      </div>
    ),
  },
};

export const BottomSheetShortContent: Story = {
  args: {
    isOpen: true,
    variant: "bottom-sheet",
    title: "Quick Message",
    children: (
      <div style={{ textAlign: "center" }}>
        <p>This bottom sheet has minimal content.</p>
        <Button color="primary" style={{ marginTop: "1rem" }}>
          Got it!
        </Button>
      </div>
    ),
  },
};
