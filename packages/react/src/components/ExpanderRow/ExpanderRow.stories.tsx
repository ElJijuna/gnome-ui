import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ExpanderRow } from "./ExpanderRow";
import { ActionRow } from "../ActionRow";
import { BoxedList } from "../BoxedList";
import { Switch } from "../Switch";
import { Button } from "../Button";

const meta: Meta<typeof ExpanderRow> = {
  title: "Components/ExpanderRow",
  component: ExpanderRow,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Collapsible \`ActionRow\` that reveals nested rows on activation.

Mirrors \`AdwExpanderRow\` — clicking the header row toggles a smooth reveal
animation exposing child rows. Supports both **controlled** and **uncontrolled**
expand state.

### Guidelines
- Always wrap in \`BoxedList\` for the canonical GNOME appearance.
- Use for settings groups where sub-options only make sense when a parent option is relevant.
- Nest \`ActionRow\`, \`ButtonRow\`, or any row-shaped element as children — separators are inserted automatically.
- Use \`trailing\` for a value label or status indicator; stop event propagation inside interactive trailing widgets.
- Do not nest \`ExpanderRow\` more than one level deep.
      `,
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480, padding: 24 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    title: { control: "text" },
    subtitle: { control: "text" },
    defaultExpanded: { control: "boolean" },
  },
  args: {
    title: "Network",
    subtitle: "Wi-Fi, VPN",
    defaultExpanded: false,
  },
};

export default meta;
type Story = StoryObj<typeof ExpanderRow>;

// ─── Default ───────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: (args) => (
    <BoxedList>
      <ExpanderRow {...args}>
        <ActionRow title="Wi-Fi" trailing={<Switch defaultChecked aria-label="Wi-Fi" />} />
        <ActionRow title="Bluetooth" trailing={<Switch aria-label="Bluetooth" />} />
        <ActionRow title="VPN" trailing={<Switch aria-label="VPN" />} />
      </ExpanderRow>
    </BoxedList>
  ),
};

// ─── Default expanded ──────────────────────────────────────────────────────────

export const DefaultExpanded: Story = {
  render: () => (
    <BoxedList>
      <ExpanderRow title="Display" subtitle="Resolution, refresh rate" defaultExpanded>
        <ActionRow title="Resolution" trailing={<span style={{ fontSize: "0.875rem", opacity: 0.6 }}>1920 × 1080</span>} />
        <ActionRow title="Refresh Rate" trailing={<span style={{ fontSize: "0.875rem", opacity: 0.6 }}>60 Hz</span>} />
        <ActionRow title="Night Light" trailing={<Switch aria-label="Night Light" />} />
      </ExpanderRow>
    </BoxedList>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: "Use `defaultExpanded` to open the row on first render." },
    },
  },
};

// ─── With leading icon ─────────────────────────────────────────────────────────

export const WithLeadingIcon: Story = {
  render: () => (
    <BoxedList>
      <ExpanderRow
        title="Privacy"
        subtitle="Location, camera, microphone"
        leading={<span style={{ fontSize: 20 }}>🔒</span>}
      >
        <ActionRow title="Location Services" trailing={<Switch aria-label="Location" />} />
        <ActionRow title="Camera" trailing={<Switch defaultChecked aria-label="Camera" />} />
        <ActionRow title="Microphone" trailing={<Switch defaultChecked aria-label="Microphone" />} />
      </ExpanderRow>
    </BoxedList>
  ),
  parameters: { controls: { disable: true } },
};

// ─── With trailing widget ──────────────────────────────────────────────────────

export const WithTrailing: Story = {
  render: () => (
    <BoxedList>
      <ExpanderRow
        title="Notifications"
        trailing={
          <Switch
            defaultChecked
            aria-label="Notifications"
            onClick={(e) => e.stopPropagation()}
          />
        }
      >
        <ActionRow title="Sound" trailing={<Switch defaultChecked aria-label="Sound" />} />
        <ActionRow title="Banner" trailing={<Switch defaultChecked aria-label="Banner" />} />
        <ActionRow title="Lock Screen" trailing={<Switch aria-label="Lock Screen" />} />
      </ExpanderRow>
    </BoxedList>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "A `trailing` Switch controls a parent setting while the expander reveals related sub-settings. Call `e.stopPropagation()` in the trailing widget's `onClick` to prevent toggling the expander.",
      },
    },
  },
};

// ─── Multiple expanders in a list ──────────────────────────────────────────────

export const MultipleExpanders: Story = {
  render: () => (
    <BoxedList>
      <ExpanderRow title="Wi-Fi" subtitle="Connected to Home Network">
        <ActionRow interactive title="Home Network" subtitle="Connected" onClick={() => {}} />
        <ActionRow interactive title="Office" subtitle="Saved" onClick={() => {}} />
        <ActionRow interactive title="Other Networks…" onClick={() => {}} />
      </ExpanderRow>
      <ExpanderRow title="Bluetooth" subtitle="Off">
        <ActionRow title="Discoverable" trailing={<Switch aria-label="Discoverable" />} />
        <ActionRow interactive title="Pair New Device…" onClick={() => {}} />
      </ExpanderRow>
      <ActionRow title="Airplane Mode" trailing={<Switch aria-label="Airplane Mode" />} />
    </BoxedList>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Multiple `ExpanderRow` and `ActionRow` items can coexist freely inside a `BoxedList`.",
      },
    },
  },
};

// ─── Controlled ────────────────────────────────────────────────────────────────

export const Controlled: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Button variant="flat" onClick={() => setOpen((v) => !v)}>
          {open ? "Collapse" : "Expand"} externally
        </Button>
        <BoxedList>
          <ExpanderRow
            title="Advanced"
            subtitle="Developer options"
            expanded={open}
            onExpandedChange={setOpen}
          >
            <ActionRow title="Debug Mode" trailing={<Switch aria-label="Debug Mode" />} />
            <ActionRow title="Verbose Logging" trailing={<Switch aria-label="Verbose Logging" />} />
          </ExpanderRow>
        </BoxedList>
      </div>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Use `expanded` + `onExpandedChange` for controlled mode — the expand state can be driven externally.",
      },
    },
  },
};
