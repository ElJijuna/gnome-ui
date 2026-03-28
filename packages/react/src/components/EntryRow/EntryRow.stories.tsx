import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { EntryRow } from "./EntryRow";
import { BoxedList } from "../BoxedList";
import { Button } from "../Button";

const meta: Meta<typeof EntryRow> = {
  title: "Components/EntryRow",
  component: EntryRow,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Row with an inline text entry field.

Mirrors \`AdwEntryRow\` — the \`title\` acts as a floating label that rises above the
input when the field is focused or has content. Use inside a \`BoxedList\` for
settings that require free-form text input.

### Guidelines
- Use \`title\` as the label, not as a placeholder — it is always visible.
- Add \`trailing\` widgets for actions like copy, clear, or reveal-password.
- For passwords, set \`type="password"\` and provide a trailing reveal button.
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
    title: "Name",
    defaultValue: "",
  },
};

export default meta;
type Story = StoryObj<typeof EntryRow>;

// ─── Default ───────────────────────────────────────────────────────────────────

export const Default: Story = {};

// ─── In a BoxedList ────────────────────────────────────────────────────────────

export const InBoxedList: Story = {
  render: () => (
    <BoxedList>
      <EntryRow title="Full Name" defaultValue="Jane Smith" />
      <EntryRow title="Email Address" defaultValue="" type="email" />
      <EntryRow title="Website" defaultValue="" type="url" />
    </BoxedList>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Multiple `EntryRow` fields inside a `BoxedList`. The label floats when a field is focused or has content.",
      },
    },
  },
};

// ─── Controlled ────────────────────────────────────────────────────────────────

export const Controlled: Story = {
  render: () => {
    const [name, setName] = useState("Jane Smith");
    const [email, setEmail] = useState("");

    return (
      <BoxedList>
        <EntryRow title="Full Name" value={name} onValueChange={setName} />
        <EntryRow title="Email Address" value={email} onValueChange={setEmail} type="email" />
      </BoxedList>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: "Use `value` + `onValueChange` for controlled mode." },
    },
  },
};

// ─── With trailing button ──────────────────────────────────────────────────────

export const WithTrailing: Story = {
  render: () => {
    const [value, setValue] = useState("https://example.com");

    return (
      <BoxedList>
        <EntryRow
          title="Website"
          value={value}
          onValueChange={setValue}
          trailing={
            <Button
              variant="flat"
              size="sm"
              aria-label="Copy URL"
              onClick={() => navigator.clipboard.writeText(value)}
            >
              Copy
            </Button>
          }
        />
      </BoxedList>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Use `trailing` for action widgets like copy or clear buttons.",
      },
    },
  },
};

// ─── Disabled ─────────────────────────────────────────────────────────────────

export const Disabled: Story = {
  render: () => (
    <BoxedList>
      <EntryRow title="Username" defaultValue="janedoe" disabled />
      <EntryRow title="Account ID" defaultValue="usr-8472" disabled />
    </BoxedList>
  ),
  parameters: { controls: { disable: true } },
};
