import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { CheckRow } from "./CheckRow";
import { BoxedList } from "../BoxedList";

const meta: Meta<typeof CheckRow> = {
  title: "Components/CheckRow",
  component: CheckRow,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Activatable row with an integrated checkbox.

The entire row is a button — clicking anywhere toggles the checkbox. Use inside a
\`BoxedList\` when a user must select or deselect individual items in a list.

### Guidelines
- Use for multi-select scenarios (e.g., selecting files, features, or permissions).
- For a single on/off setting, prefer \`SwitchRow\`.
- Supports controlled (\`checked\`) and uncontrolled (\`defaultChecked\`) modes.
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
    checked: { control: "boolean" },
    disabled: { control: "boolean" },
    title: { control: "text" },
    subtitle: { control: "text" },
  },
  args: {
    title: "Enable feature",
    subtitle: "Turn this feature on or off",
    defaultChecked: false,
  },
};

export default meta;
type Story = StoryObj<typeof CheckRow>;

// ─── Default ───────────────────────────────────────────────────────────────────

export const Default: Story = {};

// ─── In a BoxedList ────────────────────────────────────────────────────────────

export const InBoxedList: Story = {
  render: () => (
    <BoxedList>
      <CheckRow title="Send usage statistics" subtitle="Help improve the app anonymously" defaultChecked />
      <CheckRow title="Enable crash reports" subtitle="Automatically submit crash reports" />
      <CheckRow title="Beta features" subtitle="Try experimental functionality" />
    </BoxedList>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Multiple `CheckRow` items inside a `BoxedList` for multi-select settings.",
      },
    },
  },
};

// ─── Controlled ────────────────────────────────────────────────────────────────

export const Controlled: Story = {
  render: () => {
    const [items, setItems] = useState({ stats: true, crash: false, beta: false });
    const toggle = (key: keyof typeof items) =>
      setItems((prev) => ({ ...prev, [key]: !prev[key] }));

    return (
      <BoxedList>
        <CheckRow title="Send usage statistics" checked={items.stats} onCheckedChange={() => toggle("stats")} />
        <CheckRow title="Enable crash reports" checked={items.crash} onCheckedChange={() => toggle("crash")} />
        <CheckRow title="Beta features" checked={items.beta} onCheckedChange={() => toggle("beta")} />
      </BoxedList>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: "Controlled mode — manage state externally with `checked` + `onCheckedChange`." },
    },
  },
};

// ─── Disabled ─────────────────────────────────────────────────────────────────

export const Disabled: Story = {
  render: () => (
    <BoxedList>
      <CheckRow title="Crash reports" subtitle="Requires diagnostics permission" defaultChecked disabled />
      <CheckRow title="Beta features" subtitle="Not available in your region" disabled />
    </BoxedList>
  ),
  parameters: { controls: { disable: true } },
};
