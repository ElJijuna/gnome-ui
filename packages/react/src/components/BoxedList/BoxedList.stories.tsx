import type { Meta, StoryObj } from "@storybook/react";
import { BoxedList } from "./BoxedList";
import { ActionRow } from "../ActionRow";
import { Switch } from "../Switch";
import { Button } from "../Button";
import { Text } from "../Text";

const meta: Meta<typeof BoxedList> = {
  title: "Components/BoxedList",
  component: BoxedList,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Rounded bordered list — the most common container pattern in GNOME settings and detail views.

Mirrors the Adwaita \`.boxed-list\` style class on \`GtkListBox\`.

### Guidelines
- Use to group a set of related settings or items inside a view.
- Separators between rows are inserted automatically.
- Pair with \`ActionRow\` for the canonical GNOME settings pattern.
- Keep lists focused: 3–8 rows is typical. Split long lists into labelled sections.
- Don't nest \`BoxedList\` inside another \`BoxedList\`.
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
};

export default meta;
type Story = StoryObj<typeof BoxedList>;

// ─── Default ───────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <BoxedList>
      <ActionRow title="Wi-Fi" subtitle="Home Network" trailing={<Switch defaultChecked aria-label="Wi-Fi" />} />
      <ActionRow title="Bluetooth" subtitle="Off" trailing={<Switch aria-label="Bluetooth" />} />
      <ActionRow title="VPN" subtitle="Not connected" trailing={<Switch aria-label="VPN" />} />
    </BoxedList>
  ),
  parameters: { controls: { disable: true } },
};

// ─── Simple rows ──────────────────────────────────────────────────────────────

export const SimpleRows: Story = {
  render: () => (
    <BoxedList>
      {["About", "System", "Users", "Date & Time"].map((label) => (
        <ActionRow key={label} interactive title={label} onClick={() => {}} />
      ))}
    </BoxedList>
  ),
  parameters: { controls: { disable: true } },
};

// ─── With actions ──────────────────────────────────────────────────────────────

export const WithActions: Story = {
  render: () => (
    <BoxedList>
      <ActionRow title="Automatic Updates" subtitle="Install updates automatically" trailing={<Switch defaultChecked aria-label="Automatic Updates" />} />
      <ActionRow title="Usage & Diagnostics" subtitle="Help improve GNOME" trailing={<Switch aria-label="Usage & Diagnostics" />} />
      <ActionRow title="Reset Settings" trailing={<Button variant="destructive" size="sm">Reset</Button>} />
    </BoxedList>
  ),
  parameters: { controls: { disable: true } },
};

// ─── Labelled sections ─────────────────────────────────────────────────────────

export const LabelledSections: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <Text variant="caption-heading" color="dim" style={{ marginBottom: 6, paddingLeft: 12 }}>
          Network
        </Text>
        <BoxedList>
          <ActionRow title="Wi-Fi" subtitle="Home Network" trailing={<Switch defaultChecked aria-label="Wi-Fi" />} />
          <ActionRow title="Ethernet" subtitle="Connected" trailing={<Switch defaultChecked aria-label="Ethernet" />} />
        </BoxedList>
      </div>
      <div>
        <Text variant="caption-heading" color="dim" style={{ marginBottom: 6, paddingLeft: 12 }}>
          Privacy
        </Text>
        <BoxedList>
          <ActionRow title="Location Services" trailing={<Switch aria-label="Location Services" />} />
          <ActionRow title="Usage & Diagnostics" trailing={<Switch aria-label="Usage & Diagnostics" />} />
        </BoxedList>
      </div>
    </div>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Use a `caption-heading` label above each list to group related sections in a settings view.",
      },
    },
  },
};
