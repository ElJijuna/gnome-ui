import type { Meta, StoryObj } from "@storybook/react";
import { LinkedGroup } from "./LinkedGroup";
import { Button } from "../Button";
import { TextField } from "../TextField";

const meta: Meta<typeof LinkedGroup> = {
  title: "Components/LinkedGroup",
  component: LinkedGroup,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Renders children as a single visually-connected unit with no gap and merged borders.

The canonical GNOME pattern for button groups and segmented inputs — mirrors the
libadwaita \`.linked\` style class.

### How it works
- First child retains its outer border radius (left side or top side).
- Last child retains its outer border radius (right side or bottom side).
- All middle children have their border radius removed.
- Adjacent borders are collapsed to a single pixel via \`margin: -1px\`.
- Hovered and focused children are raised with \`z-index\` so their border stays visible.

### Guidelines
- Use for tightly related actions that form a logical group (Cut/Copy/Paste, Zoom −/+).
- Use \`vertical\` for stacked inputs or option lists.
- Prefer \`ToggleGroup\` for mutually-exclusive toggle buttons — \`LinkedGroup\` is for generic grouping.
- Avoid mixing very different widget types (e.g. a button and a text field) unless the UX warrants it.
        `,
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    vertical: { control: "boolean" },
  },
  args: {
    vertical: false,
  },
};

export default meta;
type Story = StoryObj<typeof LinkedGroup>;

// ─── Default — button group ────────────────────────────────────────────────────

export const Default: Story = {
  render: (args) => (
    <LinkedGroup {...args}>
      <Button>Cut</Button>
      <Button>Copy</Button>
      <Button>Paste</Button>
    </LinkedGroup>
  ),
};

// ─── Suggested ─────────────────────────────────────────────────────────────────

export const Suggested: Story = {
  render: () => (
    <LinkedGroup>
      <Button variant="suggested">Day</Button>
      <Button variant="suggested">Week</Button>
      <Button variant="suggested">Month</Button>
    </LinkedGroup>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "All children share the same `variant`. Works with any Button variant.",
      },
    },
  },
};

// ─── Zoom controls ─────────────────────────────────────────────────────────────

export const ZoomControls: Story = {
  render: () => (
    <LinkedGroup>
      <Button aria-label="Zoom out">−</Button>
      <Button aria-label="Reset zoom">100 %</Button>
      <Button aria-label="Zoom in">+</Button>
    </LinkedGroup>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "A common use case: zoom controls where − and + are tightly coupled.",
      },
    },
  },
};

// ─── Search + button ───────────────────────────────────────────────────────────

export const SearchWithButton: Story = {
  render: () => (
    <LinkedGroup>
      <TextField label="" placeholder="Search…" aria-label="Search" />
      <Button variant="suggested">Go</Button>
    </LinkedGroup>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Mix different widget types that belong together — a text field and a submit button rendered as one unit.",
      },
    },
  },
};

// ─── Vertical ─────────────────────────────────────────────────────────────────

export const Vertical: Story = {
  render: () => (
    <LinkedGroup vertical>
      <Button>Top</Button>
      <Button>Middle</Button>
      <Button>Bottom</Button>
    </LinkedGroup>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Use `vertical` to stack children in a column. Border collapse and radius restoration apply to top/bottom edges.",
      },
    },
  },
};

// ─── Inside Toolbar ────────────────────────────────────────────────────────────

export const InsideToolbar: Story = {
  render: () => (
    <div
      style={{
        background: "var(--gnome-headerbar-bg-color, #ebebeb)",
        borderRadius: 8,
        width: "100%",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: 6 }}>
        <Button variant="flat">←</Button>
        <Button variant="flat">→</Button>
        <LinkedGroup>
          <Button variant="flat">Bold</Button>
          <Button variant="flat">Italic</Button>
          <Button variant="flat">Underline</Button>
        </LinkedGroup>
        <div style={{ flex: 1 }} />
        <Button variant="flat">⋮</Button>
      </div>
    </div>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "`LinkedGroup` inside a `Toolbar` — the connected group stands out from the surrounding flat buttons.",
      },
    },
  },
};
