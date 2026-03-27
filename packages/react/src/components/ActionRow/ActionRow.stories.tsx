import type { Meta, StoryObj } from "@storybook/react";
import { ActionRow } from "./ActionRow";
import { Switch } from "../Switch";
import { Button } from "../Button";
import { BoxedList } from "../BoxedList";

const meta: Meta<typeof ActionRow> = {
  title: "Components/ActionRow",
  component: ActionRow,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Standard settings row with title, optional subtitle, leading icon, and trailing widget.

Mirrors the Adwaita \`AdwActionRow\` pattern — the fundamental building block inside a \`BoxedList\`.

### Guidelines
- Always provide a \`title\`. Use \`subtitle\` for secondary context (current value, description).
- Use \`trailing\` for the primary control: \`Switch\`, \`Button\`, a value label, or a chevron icon.
- Use \`interactive\` for rows that navigate or trigger an action (renders as \`<button>\`).
- Avoid putting interactive elements inside an \`interactive\` row — they create nested buttons.
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
    interactive: { control: "boolean" },
    title: { control: "text" },
    subtitle: { control: "text" },
  },
  args: {
    title: "Wi-Fi",
    subtitle: "Home Network",
    interactive: false,
  },
};

export default meta;
type Story = StoryObj<typeof ActionRow>;

// ─── Default ───────────────────────────────────────────────────────────────────

export const Default: Story = {};

// ─── With Switch ──────────────────────────────────────────────────────────────

export const WithSwitch: Story = {
  render: () => (
    <BoxedList>
      <ActionRow title="Wi-Fi" subtitle="Home Network" trailing={<Switch defaultChecked aria-label="Wi-Fi" />} />
      <ActionRow title="Bluetooth" subtitle="Off" trailing={<Switch aria-label="Bluetooth" />} />
      <ActionRow title="Airplane Mode" trailing={<Switch aria-label="Airplane Mode" />} />
    </BoxedList>
  ),
  parameters: { controls: { disable: true } },
};

// ─── Interactive rows ──────────────────────────────────────────────────────────

export const Interactive: Story = {
  render: () => (
    <BoxedList>
      <ActionRow interactive title="About" subtitle="Device information" onClick={() => alert("About")} />
      <ActionRow interactive title="System" subtitle="Software updates" onClick={() => alert("System")} />
      <ActionRow interactive title="Users" onClick={() => alert("Users")} />
    </BoxedList>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Set `interactive` for rows that navigate or trigger an action. The row renders as `<button>`.",
      },
    },
  },
};

// ─── With leading icon ────────────────────────────────────────────────────────

export const WithLeadingIcon: Story = {
  render: () => (
    <BoxedList>
      <ActionRow
        title="Notifications"
        subtitle="Manage app alerts"
        leading={<span style={{ fontSize: 20 }}>🔔</span>}
        trailing={<Switch defaultChecked aria-label="Notifications" />}
      />
      <ActionRow
        title="Privacy"
        subtitle="Location & diagnostics"
        leading={<span style={{ fontSize: 20 }}>🔒</span>}
        trailing={<Switch aria-label="Privacy" />}
      />
    </BoxedList>
  ),
  parameters: { controls: { disable: true } },
};

// ─── Property variant ─────────────────────────────────────────────────────────

export const Property: Story = {
  render: () => (
    <BoxedList>
      <ActionRow variant="property" title="Operating System" subtitle="GNOME OS 48" />
      <ActionRow variant="property" title="Version" subtitle="48.0 (2026-03-25)" />
      <ActionRow variant="property" title="Kernel" subtitle="Linux 6.8.0" />
      <ActionRow variant="property" title="Memory" subtitle="15.4 GiB" />
    </BoxedList>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "`variant=\"property\"` flips the visual hierarchy: the `title` shrinks to a dim caption label and the `subtitle` becomes the prominent value. Use for read-only property display — mirrors the `.property` style class.",
      },
    },
  },
};

// ─── With button ──────────────────────────────────────────────────────────────

export const WithButton: Story = {
  render: () => (
    <BoxedList>
      <ActionRow title="Storage" subtitle="18.3 GB of 20 GB used" trailing={<Button variant="flat" size="sm">Manage</Button>} />
      <ActionRow title="Reset Settings" trailing={<Button variant="destructive" size="sm">Reset</Button>} />
    </BoxedList>
  ),
  parameters: { controls: { disable: true } },
};
