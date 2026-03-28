import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { SwitchRow } from "./SwitchRow";
import { BoxedList } from "../BoxedList";

const meta: Meta<typeof SwitchRow> = {
  title: "Components/SwitchRow",
  component: SwitchRow,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Activatable row with an integrated switch.

Mirrors \`AdwSwitchRow\` — the entire row is a button that toggles the switch when clicked.
This differs from \`ActionRow\` with a \`trailing\` switch: here the row itself carries the
\`role="switch"\` and clicking anywhere (title, subtitle, or the visual switch) toggles state.

### Guidelines
- Use when a single boolean setting should occupy a full list row.
- Prefer \`SwitchRow\` over \`ActionRow + Switch trailing\` when there is no other trailing widget needed.
- Supports controlled (\`checked\`) and uncontrolled (\`defaultChecked\`) modes.
- Wrap in \`BoxedList\` for the canonical GNOME settings appearance.
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
    title: "Wi-Fi",
    subtitle: "Connect to wireless networks",
    defaultChecked: true,
  },
};

export default meta;
type Story = StoryObj<typeof SwitchRow>;

// ─── Default ───────────────────────────────────────────────────────────────────

export const Default: Story = {};

// ─── In a BoxedList ────────────────────────────────────────────────────────────

export const InBoxedList: Story = {
  render: () => (
    <BoxedList>
      <SwitchRow title="Wi-Fi" subtitle="Connect to wireless networks" defaultChecked />
      <SwitchRow title="Bluetooth" subtitle="Connect to nearby devices" />
      <SwitchRow title="Airplane Mode" />
    </BoxedList>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Use `SwitchRow` inside a `BoxedList` for the canonical GNOME settings appearance.",
      },
    },
  },
};

// ─── Controlled ────────────────────────────────────────────────────────────────

export const Controlled: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <BoxedList>
        <SwitchRow
          title="Automatic Updates"
          subtitle={checked ? "Updates will install automatically" : "Updates require manual install"}
          checked={checked}
          onCheckedChange={setChecked}
        />
      </BoxedList>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Use `checked` + `onCheckedChange` for controlled mode. The subtitle can reflect current state.",
      },
    },
  },
};

// ─── Disabled ─────────────────────────────────────────────────────────────────

export const Disabled: Story = {
  render: () => (
    <BoxedList>
      <SwitchRow title="Wi-Fi" subtitle="No hardware detected" defaultChecked disabled />
      <SwitchRow title="Bluetooth" disabled />
    </BoxedList>
  ),
  parameters: { controls: { disable: true } },
};

// ─── With leading icon ────────────────────────────────────────────────────────

export const WithLeadingIcon: Story = {
  render: () => (
    <BoxedList>
      <SwitchRow
        title="Notifications"
        subtitle="Show app alerts"
        leading={<span style={{ fontSize: 20 }}>🔔</span>}
        defaultChecked
      />
      <SwitchRow
        title="Location"
        subtitle="Allow location access"
        leading={<span style={{ fontSize: 20 }}>📍</span>}
      />
    </BoxedList>
  ),
  parameters: { controls: { disable: true } },
};
