import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { SpinButton } from "./SpinButton";
import { Text } from "../Text";

const meta: Meta<typeof SpinButton> = {
  title: "Components/SpinButton",
  component: SpinButton,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Numeric input with − and + buttons following the Adwaita \`GtkSpinButton\` style.

### Guidelines
- Use for small bounded integer or decimal values (font size, quantity, opacity…).
- Always set meaningful \`min\`, \`max\`, and \`step\`.
- Prefer a **Slider** when the range is large or the exact value matters less than relative position.
- Keyboard: ↑/↓ step once, Page Up/Down step ×10, Home/End jump to min/max.
- The \`−\` button disables automatically at \`min\`; \`+\` at \`max\`.
        `,
      },
    },
  },
  argTypes: {
    value:    { control: { type: "number" } },
    min:      { control: { type: "number" } },
    max:      { control: { type: "number" } },
    step:     { control: { type: "number" } },
    disabled: { control: "boolean" },
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value ?? 50);
    return <SpinButton {...args} value={value} onChange={setValue} />;
  },
  args: { min: 0, max: 100, step: 1, value: 50, disabled: false },
};

export default meta;
type Story = StoryObj<typeof SpinButton>;

// ─── Default ───────────────────────────────────────────────────────────────────

export const Default: Story = {};

// ─── Decimal step ─────────────────────────────────────────────────────────────

export const DecimalStep: Story = {
  args: { value: 1.5, min: 0, max: 5, step: 0.5 },
  render: function Render(args) {
    const [value, setValue] = useState(args.value ?? 1.5);
    return <SpinButton {...args} value={value} onChange={setValue} />;
  },
  parameters: {
    docs: {
      description: {
        story: "`decimals` is derived automatically from `step` — `step=0.5` shows one decimal place.",
      },
    },
  },
};

// ─── At boundaries ────────────────────────────────────────────────────────────

export const AtBoundaries: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <SpinButton value={0} min={0} max={10} onChange={() => {}} />
        <Text variant="caption" color="dim">at min</Text>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <SpinButton value={10} min={0} max={10} onChange={() => {}} />
        <Text variant="caption" color="dim">at max</Text>
      </div>
    </div>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: "The − button disables at `min` and + at `max`." },
    },
  },
};

// ─── Disabled ─────────────────────────────────────────────────────────────────

export const Disabled: Story = {
  args: { value: 42, disabled: true },
  render: function Render(args) {
    const [value, setValue] = useState(args.value ?? 42);
    return <SpinButton {...args} value={value} onChange={setValue} />;
  },
};

// ─── In a form ────────────────────────────────────────────────────────────────

export const InForm: Story = {
  render: function InFormStory() {
    const [qty,     setQty]     = useState(1);
    const [opacity, setOpacity] = useState(100);
    const [size,    setSize]    = useState(14);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 280 }}>
        {[
          { label: "Quantity",    value: qty,     onChange: setQty,     min: 1,  max: 99,  step: 1 },
          { label: "Opacity (%)", value: opacity, onChange: setOpacity, min: 0,  max: 100, step: 5 },
          { label: "Font size",   value: size,    onChange: setSize,    min: 8,  max: 72,  step: 1 },
        ].map(({ label, ...rest }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <Text variant="body">{label}</Text>
            <SpinButton aria-label={label} {...rest} />
          </div>
        ))}
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};
