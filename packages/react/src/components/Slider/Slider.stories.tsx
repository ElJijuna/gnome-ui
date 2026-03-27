import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Slider } from "./Slider";
import { Text } from "../Text";
import { SpinButton } from "../SpinButton";

const meta: Meta<typeof Slider> = {
  title: "Components/Slider",
  component: Slider,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Draggable range control following the Adwaita \`GtkScale\` pattern.

### Guidelines
- Use when the range is large or the exact value matters less than relative position (volume, zoom, brightness).
- Prefer **SpinButton** when the user needs to enter a precise value.
- Always set meaningful \`min\`, \`max\`, and \`step\`.
- Provide an \`aria-label\` or associate with a visible label via \`aria-labelledby\`.
- Keyboard: ← / → move by one step; Page Up/Down by 10 steps; Home/End jump to bounds.
        `,
      },
    },
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value ?? 40);
    return <Slider {...args} value={value} onChange={setValue} />;
  },
  args: { min: 0, max: 100, step: 1, value: 40 },
  argTypes: {
    value:    { control: { type: "number" } },
    min:      { control: { type: "number" } },
    max:      { control: { type: "number" } },
    step:     { control: { type: "number" } },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Slider>;

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: { "aria-label": "Volume" },
};

// ─── With live value display ──────────────────────────────────────────────────

export const WithValue: Story = {
  render: function WithValueStory() {
    const [value, setValue] = useState(60);
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 16, maxWidth: 360 }}>
        <Slider
          aria-label="Brightness"
          value={value}
          onChange={setValue}
          style={{ flex: 1 }}
        />
        <Text variant="body" style={{ minWidth: 32, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
          {value}%
        </Text>
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};

// ─── Paired with SpinButton ───────────────────────────────────────────────────

export const WithSpinButton: Story = {
  render: function SpinStory() {
    const [value, setValue] = useState(14);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 340 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Text variant="body">Font size</Text>
          <SpinButton value={value} min={8} max={72} step={1} onChange={setValue} aria-label="Font size" />
        </div>
        <Slider
          aria-label="Font size"
          value={value}
          onChange={setValue}
          min={8}
          max={72}
          step={1}
        />
      </div>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Slider paired with a SpinButton — both controls stay in sync via shared state.",
      },
    },
  },
};

// ─── Decimal step ─────────────────────────────────────────────────────────────

export const DecimalStep: Story = {
  render: function DecimalStory() {
    const [value, setValue] = useState(1.0);
    return (
      <div style={{ maxWidth: 340 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <Text variant="body">Opacity</Text>
          <Text variant="body" style={{ fontVariantNumeric: "tabular-nums" }}>{value.toFixed(1)}</Text>
        </div>
        <Slider
          aria-label="Opacity"
          value={value}
          onChange={setValue}
          min={0}
          max={1}
          step={0.1}
        />
      </div>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: "Decimal steps — `step=0.1` snaps to one decimal place." },
    },
  },
};

// ─── With marks ───────────────────────────────────────────────────────────────

export const WithMarks: Story = {
  render: function MarksStory() {
    const [value, setValue] = useState(2);
    return (
      <div style={{ maxWidth: 340, paddingBottom: 8 }}>
        <Text variant="body" style={{ marginBottom: 8, display: "block" }}>Quality</Text>
        <Slider
          aria-label="Quality"
          value={value}
          onChange={setValue}
          min={0}
          max={4}
          step={1}
          marks={[
            { value: 0, label: "Low" },
            { value: 1, label: "SD" },
            { value: 2, label: "HD" },
            { value: 3, label: "FHD" },
            { value: 4, label: "4K" },
          ]}
        />
      </div>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: "Tick marks with labels — useful for discrete named values." },
    },
  },
};

// ─── Disabled ─────────────────────────────────────────────────────────────────

export const Disabled: Story = {
  args: { value: 65, disabled: true, "aria-label": "Volume" },
};

// ─── Settings panel ───────────────────────────────────────────────────────────

export const InSettings: Story = {
  render: function SettingsStory() {
    const [volume,     setVolume]     = useState(75);
    const [brightness, setBrightness] = useState(50);
    const [zoom,       setZoom]       = useState(100);

    const rows = [
      { label: "Volume",      value: volume,     onChange: setVolume,     min: 0,  max: 100, step: 1,  suffix: "%" },
      { label: "Brightness",  value: brightness, onChange: setBrightness, min: 0,  max: 100, step: 5,  suffix: "%" },
      { label: "Zoom",        value: zoom,       onChange: setZoom,       min: 50, max: 200, step: 10, suffix: "%" },
    ];

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 380 }}>
        {rows.map(({ label, value, onChange, min, max, step, suffix }) => (
          <div key={label} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Text variant="body">{label}</Text>
              <Text variant="body" color="dim" style={{ fontVariantNumeric: "tabular-nums" }}>
                {value}{suffix}
              </Text>
            </div>
            <Slider
              aria-label={label}
              value={value}
              onChange={onChange}
              min={min}
              max={max}
              step={step}
            />
          </div>
        ))}
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};
