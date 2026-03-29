import type { Meta, StoryObj } from "@storybook/react";
import { ShortcutLabel } from "./ShortcutLabel";
import { BoxedList } from "../BoxedList";
import { ActionRow } from "../ActionRow";

const meta: Meta<typeof ShortcutLabel> = {
  title: "Components/ShortcutLabel",
  component: ShortcutLabel,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Read-only display of a keyboard shortcut with per-key key-cap styling.

Each token in the \`shortcut\` string (split by \`+\`) is rendered as a
separate \`<kbd>\` element. Modifier keys are normalised to their Unicode
symbols by default (\`Ctrl\` → \`⌃\`, \`Shift\` → \`⇧\`, etc.).

Mirrors \`GtkShortcutLabel\`.

### Usage
- Pass the shortcut as a \`+\`-separated string, e.g. \`"Ctrl+S"\`.
- Set \`symbols={false}\` to keep raw token names instead of symbols.
- Use as the \`suffix\` of an \`ActionRow\` in a \`BoxedList\`.
        `,
      },
    },
  },
  argTypes: {
    shortcut: { control: "text" },
    symbols: { control: "boolean" },
  },
  args: {
    shortcut: "Ctrl+S",
    symbols: true,
  },
};

export default meta;
type Story = StoryObj<typeof ShortcutLabel>;

// ─── Default ───────────────────────────────────────────────────────────────────

export const Default: Story = {};

// ─── Common shortcuts ─────────────────────────────────────────────────────────

export const CommonShortcuts: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <ShortcutLabel shortcut="Ctrl+S" />
      <ShortcutLabel shortcut="Ctrl+Shift+Z" />
      <ShortcutLabel shortcut="Ctrl+Alt+Delete" />
      <ShortcutLabel shortcut="Super+L" />
      <ShortcutLabel shortcut="F5" />
      <ShortcutLabel shortcut="Escape" />
    </div>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "A range of common shortcuts showing modifier normalisation.",
      },
    },
  },
};

// ─── Raw tokens (no symbols) ──────────────────────────────────────────────────

export const RawTokens: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <ShortcutLabel shortcut="Ctrl+S" symbols={false} />
      <ShortcutLabel shortcut="Ctrl+Shift+Z" symbols={false} />
    </div>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "`symbols={false}` renders the raw token names without normalisation.",
      },
    },
  },
};

// ─── As ActionRow suffix ──────────────────────────────────────────────────────

export const AsActionRowSuffix: Story = {
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <BoxedList>
        <ActionRow title="Save" trailing={<ShortcutLabel shortcut="Ctrl+S" />} />
        <ActionRow title="Undo" trailing={<ShortcutLabel shortcut="Ctrl+Z" />} />
        <ActionRow title="Redo" trailing={<ShortcutLabel shortcut="Ctrl+Shift+Z" />} />
        <ActionRow title="Find" trailing={<ShortcutLabel shortcut="Ctrl+F" />} />
        <ActionRow title="Quit" trailing={<ShortcutLabel shortcut="Ctrl+Q" />} />
      </BoxedList>
    </div>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Typical use: keyboard shortcut displayed as the suffix of an `ActionRow` in a shortcuts list.",
      },
    },
  },
};
