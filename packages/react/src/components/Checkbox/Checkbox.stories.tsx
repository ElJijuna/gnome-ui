import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "./Checkbox";
import { Text } from "../Text";

const meta: Meta<typeof Checkbox> = {
  title: "Components/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Checkbox for multi-selection, following the GNOME HIG and Adwaita style.

### Guidelines
- Use for multi-selection where multiple items can be active at once.
- Prefer \`Switch\` over \`Checkbox\` for settings that take effect immediately.
- Use the \`indeterminate\` state for "select all" controls when only some items are selected.
- Always pair with a visible label or supply \`aria-label\`.
- Changes should not take effect until the user confirms (e.g. a Save button).
        `,
      },
    },
  },
  argTypes: {
    checked: { control: "boolean" },
    indeterminate: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    disabled: false,
    indeterminate: false,
  },
  decorators: [
    (Story) => (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

// ─── Default (uncontrolled) ────────────────────────────────────────────────────

export const Default: Story = {
  args: { defaultChecked: false, "aria-label": "Option" },
};

// ─── Checked ──────────────────────────────────────────────────────────────────

export const Checked: Story = {
  args: { defaultChecked: true, "aria-label": "Option" },
};

// ─── Indeterminate ────────────────────────────────────────────────────────────

export const Indeterminate: Story = {
  args: { indeterminate: true, "aria-label": "Select all" },
  parameters: {
    docs: {
      description: {
        story:
          "The indeterminate (mixed) state is used when only some items in a group are selected. Set the `indeterminate` prop — it writes `input.indeterminate` via a ref.",
      },
    },
  },
};

// ─── Disabled ─────────────────────────────────────────────────────────────────

export const Disabled: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16 }}>
      <Checkbox disabled aria-label="Disabled unchecked" />
      <Checkbox disabled defaultChecked aria-label="Disabled checked" />
      <Checkbox disabled indeterminate aria-label="Disabled indeterminate" />
    </div>
  ),
  parameters: { controls: { disable: true } },
};

// ─── With labels ──────────────────────────────────────────────────────────────

export const WithLabels: Story = {
  render: () => {
    const options = ["Music", "Photos", "Videos", "Documents"];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {options.map((opt) => (
          <label
            key={opt}
            style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
          >
            <Checkbox defaultChecked={opt === "Music" || opt === "Photos"} />
            <Text variant="body">{opt}</Text>
          </label>
        ))}
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};

// ─── Select all (indeterminate parent) ────────────────────────────────────────

export const SelectAll: Story = {
  render: function SelectAllStory() {
    const items = ["Music", "Photos", "Videos", "Documents"];
    const [checked, setChecked] = useState<Record<string, boolean>>({
      Music: true,
      Photos: true,
      Videos: false,
      Documents: false,
    });

    const allChecked = items.every((i) => checked[i]);
    const someChecked = items.some((i) => checked[i]);

    function toggleAll() {
      const next = !allChecked;
      setChecked(Object.fromEntries(items.map((i) => [i, next])));
    }

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <Checkbox
            checked={allChecked}
            indeterminate={!allChecked && someChecked}
            onChange={toggleAll}
            aria-label="Select all"
          />
          <Text variant="body" style={{ fontWeight: 600 }}>Select all</Text>
        </label>
        <div style={{ paddingLeft: 26, display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((item) => (
            <label key={item} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <Checkbox
                checked={checked[item]}
                onChange={(e) => setChecked((prev) => ({ ...prev, [item]: e.target.checked }))}
              />
              <Text variant="body">{item}</Text>
            </label>
          ))}
        </div>
      </div>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Classic select-all pattern: the parent checkbox shows `indeterminate` when only some children are checked.",
      },
    },
  },
};
