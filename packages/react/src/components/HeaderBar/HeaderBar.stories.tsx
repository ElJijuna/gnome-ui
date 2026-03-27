import type { Meta, StoryObj } from "@storybook/react";
import { HeaderBar } from "./HeaderBar";
import { Button } from "../Button";
import { Text } from "../Text";

const meta: Meta<typeof HeaderBar> = {
  title: "Components/HeaderBar",
  component: HeaderBar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
Title bar with centered title and leading/trailing action slots.

Mirrors the Adwaita \`AdwHeaderBar\` pattern.

### Guidelines
- Use **flat** buttons (\`variant="flat"\`) for all controls inside the header bar.
- Keep the title short and centered — it should name the current view, not the app.
- Place primary navigation controls (back, menu) on the **leading** side.
- Place secondary actions (add, share, overflow menu) on the **trailing** side.
- Use at most 2–3 actions per side; move the rest into an overflow menu.
- Use \`flat\` on the topmost bar of a full-window layout to blend with the window chrome.
        `,
      },
    },
  },
  argTypes: {
    title: { control: "text" },
    flat: { control: "boolean" },
  },
  args: {
    title: "Inbox",
    flat: false,
  },
};

export default meta;
type Story = StoryObj<typeof HeaderBar>;

// ─── Default ───────────────────────────────────────────────────────────────────

export const Default: Story = {};

// ─── With actions ─────────────────────────────────────────────────────────────

export const WithActions: Story = {
  args: {
    title: "Contacts",
    start: <Button variant="flat" aria-label="Back">← Back</Button>,
    end: <Button variant="flat" aria-label="Add contact">+ Add</Button>,
  },
};

// ─── Multiple trailing actions ────────────────────────────────────────────────

export const MultipleActions: Story = {
  args: {
    title: "Files",
    start: (
      <Button variant="flat" aria-label="Toggle sidebar">☰</Button>
    ),
    end: (
      <>
        <Button variant="flat" aria-label="New folder">+ Folder</Button>
        <Button variant="flat" aria-label="Search">⌕</Button>
        <Button variant="flat" aria-label="View options">⋮</Button>
      </>
    ),
  },
  parameters: { controls: { disable: true } },
};

// ─── Flat variant ─────────────────────────────────────────────────────────────

export const Flat: Story = {
  args: {
    title: "Settings",
    flat: true,
    end: <Button variant="flat">Done</Button>,
  },
  parameters: {
    docs: {
      description: {
        story: "Use `flat` for the topmost bar — removes the bottom border so it merges with the window chrome.",
      },
    },
  },
};

// ─── Custom title ─────────────────────────────────────────────────────────────

export const CustomTitle: Story = {
  render: () => (
    <HeaderBar
      title={
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
          <Text variant="heading">Music</Text>
          <Text variant="caption" color="dim">42 songs</Text>
        </div>
      }
      start={<Button variant="flat">← Back</Button>}
      end={<Button variant="flat">⋮</Button>}
    />
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Pass a custom element to `title` for a two-line title (name + subtitle).",
      },
    },
  },
};

// ─── In a full layout ─────────────────────────────────────────────────────────

export const InLayout: Story = {
  render: () => (
    <div
      style={{
        border: "1px solid rgba(0,0,0,0.1)",
        borderRadius: 12,
        overflow: "hidden",
        maxWidth: 480,
      }}
    >
      <HeaderBar
        title="Preferences"
        start={<Button variant="flat">← Back</Button>}
        end={<Button variant="suggested" size="sm">Save</Button>}
      />
      <div style={{ padding: 24, fontFamily: "sans-serif", opacity: 0.4 }}>
        View content area
      </div>
    </div>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "The header bar sits at the top of a view, spanning its full width.",
      },
    },
  },
};
