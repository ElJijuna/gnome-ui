import type { Meta, StoryObj } from "@storybook/react";
import { SplitButton } from "./SplitButton";

/** Simple menu item helper for story dropdown content. */
function MenuItem({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "block",
        width: "100%",
        padding: "8px 12px",
        background: "transparent",
        border: "none",
        borderRadius: "6px",
        font: "inherit",
        fontSize: "0.9375rem",
        textAlign: "start",
        cursor: "pointer",
        color: "var(--gnome-window-fg-color, rgba(0,0,0,0.8))",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
          "var(--gnome-hover-overlay)")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent")
      }
    >
      {label}
    </button>
  );
}

const sampleMenu = (
  <div>
    <MenuItem label="Save as Template" onClick={() => alert("template")} />
    <MenuItem label="Save a Copy" onClick={() => alert("copy")} />
    <MenuItem label="Export…" onClick={() => alert("export")} />
  </div>
);

const meta: Meta<typeof SplitButton> = {
  title: "Components/SplitButton",
  component: SplitButton,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Primary action button with an attached dropdown arrow.

Clicking the **label** half fires \`onClick\`. Clicking the **arrow** half opens a floating panel
with \`dropdownContent\` (menus, options, etc.).

Mirrors \`AdwSplitButton\` — supports \`default\`, \`suggested\`, and \`destructive\` variants.

### Guidelines
- Put the most common action in the primary half with a clear imperative label.
- Use \`dropdownContent\` for secondary variants of the same action (e.g. "Save as Template").
- Prefer \`suggested\` when this is the primary CTA in a dialog or toolbar.
- Never use \`destructive\` unless the primary action is irreversible.
        `,
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: "48px 24px", display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "suggested", "destructive"],
    },
    label: { control: "text" },
    disabled: { control: "boolean" },
  },
  args: {
    label: "Save",
    variant: "default",
    disabled: false,
    dropdownContent: sampleMenu,
    onClick: () => alert("Save"),
  },
};

export default meta;
type Story = StoryObj<typeof SplitButton>;

// ─── Default ───────────────────────────────────────────────────────────────────

export const Default: Story = {};

// ─── Variants ─────────────────────────────────────────────────────────────────

export const Variants: Story = {
  render: () => (
    <>
      <SplitButton
        label="Save"
        variant="default"
        dropdownContent={sampleMenu}
        onClick={() => alert("default save")}
      />
      <SplitButton
        label="Apply"
        variant="suggested"
        dropdownContent={sampleMenu}
        onClick={() => alert("suggested apply")}
      />
      <SplitButton
        label="Delete"
        variant="destructive"
        dropdownContent={
          <div>
            <MenuItem label="Delete for Everyone" onClick={() => alert("all")} />
            <MenuItem label="Delete for Me" onClick={() => alert("me")} />
          </div>
        }
        onClick={() => alert("destructive delete")}
      />
    </>
  ),
  parameters: { controls: { disable: true } },
};

// ─── Disabled ─────────────────────────────────────────────────────────────────

export const Disabled: Story = {
  args: {
    label: "Save",
    variant: "suggested",
    disabled: true,
    dropdownContent: sampleMenu,
  },
  parameters: { controls: { disable: true } },
};
