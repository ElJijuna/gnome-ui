import type { Meta, StoryObj } from "@storybook/react";
import { PasswordEntryRow } from "./PasswordEntryRow";
import { BoxedList } from "../BoxedList";
import { EntryRow } from "../EntryRow";

const meta: Meta<typeof PasswordEntryRow> = {
  title: "Components/PasswordEntryRow",
  component: PasswordEntryRow,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Password entry row with a built-in reveal/conceal toggle.

Mirrors \`AdwPasswordEntryRow\` — an \`EntryRow\` variant that defaults to
\`type="password"\` and provides a trailing icon button to show or hide the
entered text. Use inside a \`BoxedList\` for password settings fields.

### Guidelines
- Use \`title\` as the floating label (e.g. "Password", "Confirm Password").
- The reveal button is always present; do not replicate it via \`trailing\`.
- Supports controlled (\`value\`) and uncontrolled (\`defaultValue\`) modes.
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
    title: { control: "text" },
    disabled: { control: "boolean" },
  },
  args: {
    title: "Password",
    defaultValue: "",
  },
};

export default meta;
type Story = StoryObj<typeof PasswordEntryRow>;

// ─── Default ───────────────────────────────────────────────────────────────────

export const Default: Story = {};

// ─── In a BoxedList ────────────────────────────────────────────────────────────

export const InBoxedList: Story = {
  render: () => (
    <BoxedList>
      <EntryRow title="Username" defaultValue="" />
      <PasswordEntryRow title="Password" defaultValue="" />
      <PasswordEntryRow title="Confirm Password" defaultValue="" />
    </BoxedList>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Typical sign-up form combining `EntryRow` and `PasswordEntryRow` inside a `BoxedList`.",
      },
    },
  },
};

// ─── Pre-filled ────────────────────────────────────────────────────────────────

export const PreFilled: Story = {
  render: () => (
    <BoxedList>
      <PasswordEntryRow title="Current Password" defaultValue="hunter2" />
      <PasswordEntryRow title="New Password" defaultValue="" />
    </BoxedList>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Click the eye button to reveal the masked password.",
      },
    },
  },
};

// ─── Disabled ─────────────────────────────────────────────────────────────────

export const Disabled: Story = {
  render: () => (
    <BoxedList>
      <PasswordEntryRow title="Password" defaultValue="hunter2" disabled />
    </BoxedList>
  ),
  parameters: { controls: { disable: true } },
};
