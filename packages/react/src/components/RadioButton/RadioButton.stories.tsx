import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { RadioButton } from "./RadioButton";
import { Text } from "../Text";

const meta: Meta<typeof RadioButton> = {
  title: "Components/RadioButton",
  component: RadioButton,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Single-selection radio button following the GNOME HIG and Adwaita style.

### Guidelines
- Use radio buttons when only one option in a group can be active at a time.
- Always group with a shared \`name\` attribute so the browser enforces mutual exclusion and enables arrow-key navigation.
- Always pre-select a default option — never leave all options unselected.
- Use 2–5 options; for longer lists prefer a **Dropdown/Select**.
- Always pair each radio with a visible \`<label>\`.
- Label the group itself with a heading or \`<fieldset>\` + \`<legend>\`.
        `,
      },
    },
  },
  argTypes: {
    checked: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: { disabled: false },
  decorators: [
    (Story) => (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof RadioButton>;

// ─── Default ───────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: { defaultChecked: false, name: "demo", "aria-label": "Option A" },
};

// ─── Checked ──────────────────────────────────────────────────────────────────

export const Checked: Story = {
  args: { defaultChecked: true, name: "demo2", "aria-label": "Option A" },
};

// ─── Disabled ─────────────────────────────────────────────────────────────────

export const Disabled: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16 }}>
      <RadioButton disabled name="dis" aria-label="Disabled unchecked" />
      <RadioButton disabled defaultChecked name="dis2" aria-label="Disabled checked" />
    </div>
  ),
  parameters: { controls: { disable: true } },
};

// ─── Group with labels ────────────────────────────────────────────────────────

export const Group: Story = {
  render: () => {
    const options = [
      { value: "never",   label: "Never" },
      { value: "weekly",  label: "Weekly" },
      { value: "daily",   label: "Daily (recommended)" },
    ];
    return (
      <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
        <legend style={{ marginBottom: 10 }}>
          <Text variant="body" style={{ fontWeight: 600 }}>Check for updates</Text>
        </legend>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {options.map(({ value, label }) => (
            <label
              key={value}
              style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
            >
              <RadioButton
                name="updates"
                value={value}
                defaultChecked={value === "daily"}
              />
              <Text variant="body">{label}</Text>
            </label>
          ))}
        </div>
      </fieldset>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Group with a shared `name`. Arrow keys cycle through the options natively. Wrap in `<fieldset>` + `<legend>` for screen reader context.",
      },
    },
  },
};

// ─── Controlled ───────────────────────────────────────────────────────────────

export const Controlled: Story = {
  render: function ControlledStory() {
    const plans = ["Free", "Pro", "Enterprise"];
    const [selected, setSelected] = useState("Pro");

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Text variant="body" style={{ fontWeight: 600, marginBottom: 2 }}>Plan</Text>
        {plans.map((plan) => (
          <label
            key={plan}
            style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
          >
            <RadioButton
              name="plan"
              value={plan}
              checked={selected === plan}
              onChange={() => setSelected(plan)}
            />
            <Text variant="body">{plan}</Text>
          </label>
        ))}
        <Text variant="caption" color="dim" style={{ marginTop: 4 }}>
          Selected: {selected}
        </Text>
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};
