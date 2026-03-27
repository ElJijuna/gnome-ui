import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Button component following the [GNOME Human Interface Guidelines](https://developer.gnome.org/hig/patterns/controls/buttons.html).

### Guidelines
- Use **suggested** for the single primary/affirmative action in a view. Never use more than one per screen.
- Use **destructive** only for irreversible or dangerous actions (e.g. "Delete", "Format").
- Use **flat** inside header bars and toolbars where a border would add visual clutter.
- Button labels must use **imperative verbs** with **Header Capitalization** (e.g. "Save Changes", "Cancel").
- Avoid buttons that mix an icon and a label outside of header bars.
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "suggested", "destructive", "flat", "raised"],
      description: "Visual style of the button.",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Size of the button.",
    },
    shape: {
      control: "select",
      options: ["default", "pill", "circular"],
      description:
        '"pill" for primary open-space actions, "circular" for icon-only buttons.',
    },
    disabled: {
      control: "boolean",
    },
    children: {
      control: "text",
    },
  },
  args: {
    children: "Save Changes",
    variant: "default",
    size: "md",
    shape: "default",
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// ─── Variants ─────────────────────────────────────────────────────────────────

export const Default: Story = {};

export const Suggested: Story = {
  args: { variant: "suggested", children: "Apply" },
};

export const Destructive: Story = {
  args: { variant: "destructive", children: "Delete File" },
};

/** Flat buttons live inside header bars. The gray background simulates one. */
export const Flat: Story = {
  args: { variant: "flat", children: "Cancel" },
  decorators: [
    (Story) => (
      <div
        style={{
          backgroundColor: "var(--gnome-headerbar-bg-color, #ebebeb)",
          padding: "8px 12px",
          borderRadius: "8px",
          display: "flex",
          gap: "8px",
          alignItems: "center",
        }}
      >
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          "Used inside header bars and toolbars. Shown here against a simulated header bar background.",
      },
    },
  },
};

// ─── Sizes ─────────────────────────────────────────────────────────────────────

export const Small: Story = {
  args: { size: "sm", children: "Compact" },
};

export const Large: Story = {
  args: { size: "lg", variant: "suggested", children: "Get Started" },
};

// ─── Shapes ───────────────────────────────────────────────────────────────────

export const Pill: Story = {
  args: { shape: "pill", variant: "suggested", children: "New Document" },
  parameters: {
    docs: {
      description: {
        story:
          "Pill buttons are used for primary actions in open space (e.g. welcome screens, empty states).",
      },
    },
  },
};

export const Circular: Story = {
  args: { shape: "circular", variant: "suggested", children: "+" },
  parameters: {
    docs: {
      description: {
        story:
          "Circular buttons are used for icon-only actions placed close together.",
      },
    },
  },
};

// ─── Raised ───────────────────────────────────────────────────────────────────

/** Raised buttons have explicit elevation inside flat/toolbar contexts. */
export const Raised: Story = {
  args: { variant: "raised", children: "Open" },
  decorators: [
    (Story) => (
      <div
        style={{
          backgroundColor: "var(--gnome-headerbar-bg-color, #ebebeb)",
          padding: "8px 12px",
          borderRadius: "8px",
          display: "flex",
          gap: "8px",
          alignItems: "center",
        }}
      >
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          "Use `raised` inside toolbar or flat contexts to give a button explicit elevation — mirrors the `.raised` style class.",
      },
    },
  },
};

// ─── OSD ──────────────────────────────────────────────────────────────────────

/** OSD buttons are placed over images or media. */
export const Osd: Story = {
  args: { osd: true, children: "Play" },
  decorators: [
    (Story) => (
      <div
        style={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          padding: "40px 24px",
          borderRadius: "12px",
          display: "flex",
          gap: "8px",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          "Use `osd` for buttons overlaid on media or images. Always dark semi-transparent regardless of system theme — mirrors the `.osd` style class.",
      },
    },
  },
};

// ─── States ───────────────────────────────────────────────────────────────────

export const Disabled: Story = {
  args: { disabled: true, children: "Unavailable" },
};

// ─── All Variants ─────────────────────────────────────────────────────────────

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
      <Button variant="default">Default</Button>
      <Button variant="suggested">Suggested</Button>
      <Button variant="destructive">Destructive</Button>
      <div
        style={{
          backgroundColor: "var(--gnome-headerbar-bg-color, #ebebeb)",
          padding: "4px 8px",
          borderRadius: "6px",
          display: "flex",
          gap: "8px",
        }}
      >
        <Button variant="flat">Flat</Button>
        <Button variant="raised">Raised</Button>
      </div>
      <div
        style={{
          background: "linear-gradient(135deg, #1a1a2e, #0f3460)",
          padding: "4px 8px",
          borderRadius: "6px",
          display: "flex",
        }}
      >
        <Button osd>OSD</Button>
      </div>
      <Button disabled>Disabled</Button>
    </div>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "All variants side by side. Flat is shown against its natural header bar background.",
      },
    },
  },
};
