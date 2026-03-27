import type { Meta, StoryObj } from "@storybook/react";
import { ButtonRow } from "./ButtonRow";
import { BoxedList } from "../BoxedList";

const meta: Meta<typeof ButtonRow> = {
  title: "Components/ButtonRow",
  component: ButtonRow,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Full-width activatable row styled as a button inside a \`BoxedList\`.

Mirrors \`AdwButtonRow\` — use when an entire list row should trigger a single
action with a centered label. Supports \`suggested\` and \`destructive\` variants
that colour the title text accordingly.

### Guidelines
- Always wrap in \`BoxedList\` for the canonical GNOME settings appearance.
- Use \`suggested\` for primary affirmative actions (e.g. "Save", "Apply").
- Use \`destructive\` for irreversible or dangerous actions (e.g. "Delete Account").
- Use \`leading\` / \`trailing\` for optional icons flanking the label.
- Prefer \`ActionRow\` with \`interactive\` when the row needs title + subtitle layout.
        `,
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "suggested", "destructive"],
    },
    title: { control: "text" },
    disabled: { control: "boolean" },
  },
  args: {
    title: "Confirm",
    variant: "default",
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof ButtonRow>;

// ─── Default ───────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: (args) => (
    <BoxedList>
      <ButtonRow {...args} />
    </BoxedList>
  ),
};

// ─── Variants ─────────────────────────────────────────────────────────────────

export const Variants: Story = {
  render: () => (
    <BoxedList>
      <ButtonRow title="Confirm" variant="default" onClick={() => alert("default")} />
      <ButtonRow title="Save Changes" variant="suggested" onClick={() => alert("suggested")} />
      <ButtonRow title="Delete Account" variant="destructive" onClick={() => alert("destructive")} />
    </BoxedList>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "`default` uses normal foreground colour. `suggested` uses the accent colour. `destructive` uses the destructive (red) colour.",
      },
    },
  },
};

// ─── With icons ───────────────────────────────────────────────────────────────

export const WithIcons: Story = {
  render: () => (
    <BoxedList>
      <ButtonRow
        title="Add Account"
        variant="suggested"
        leading={<span style={{ fontSize: 18 }}>＋</span>}
        onClick={() => alert("add")}
      />
      <ButtonRow
        title="Remove Device"
        variant="destructive"
        leading={<span style={{ fontSize: 18 }}>✕</span>}
        onClick={() => alert("remove")}
      />
    </BoxedList>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Use `leading` or `trailing` for optional icons. They inherit the variant colour.",
      },
    },
  },
};

// ─── Disabled ─────────────────────────────────────────────────────────────────

export const Disabled: Story = {
  render: () => (
    <BoxedList>
      <ButtonRow title="Confirm" variant="default" disabled />
      <ButtonRow title="Save Changes" variant="suggested" disabled />
      <ButtonRow title="Delete Account" variant="destructive" disabled />
    </BoxedList>
  ),
  parameters: { controls: { disable: true } },
};

// ─── Mixed with ActionRow ──────────────────────────────────────────────────────

export const MixedInList: Story = {
  render: () => (
    <BoxedList>
      <ButtonRow title="Export Data" variant="suggested" onClick={() => alert("export")} />
      <ButtonRow title="Reset to Defaults" variant="default" onClick={() => alert("reset")} />
      <ButtonRow title="Delete All Data" variant="destructive" onClick={() => alert("delete")} />
    </BoxedList>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Multiple `ButtonRow` items can be stacked inside a single `BoxedList`.",
      },
    },
  },
};
