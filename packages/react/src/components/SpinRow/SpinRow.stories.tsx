import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { SpinRow } from "./SpinRow";
import { BoxedList } from "../BoxedList";

const meta: Meta<typeof SpinRow> = {
  title: "Components/SpinRow",
  component: SpinRow,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Settings row with an integrated spin button for numeric values.

Mirrors \`AdwSpinRow\` — a standard row layout with − and + buttons at the trailing
edge. Use inside a \`BoxedList\` for settings with numeric ranges such as volume,
timeout durations, item counts, or font sizes.

### Guidelines
- Set \`min\`, \`max\`, and \`step\` to constrain the allowed range.
- Use \`subtitle\` to clarify the unit (e.g. "seconds", "pixels").
- Supports controlled (\`value\`) and uncontrolled (\`defaultValue\`) modes.
- Keyboard: ↑/↓ step by one, Page Up/Down step by 10×, Home/End jump to min/max.
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
    subtitle: { control: "text" },
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
    disabled: { control: "boolean" },
  },
  args: {
    title: "Volume",
    defaultValue: 50,
    min: 0,
    max: 100,
    step: 1,
  },
};

export default meta;
type Story = StoryObj<typeof SpinRow>;

// ─── Default ───────────────────────────────────────────────────────────────────

export const Default: Story = {};

// ─── In a BoxedList ────────────────────────────────────────────────────────────

export const InBoxedList: Story = {
  render: () => (
    <BoxedList>
      <SpinRow title="Volume" subtitle="System output" defaultValue={75} min={0} max={100} />
      <SpinRow title="Brightness" defaultValue={80} min={0} max={100} />
      <SpinRow title="Idle Delay" subtitle="Minutes" defaultValue={5} min={1} max={60} />
    </BoxedList>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Multiple `SpinRow` items inside a `BoxedList`.",
      },
    },
  },
};

// ─── Controlled ────────────────────────────────────────────────────────────────

export const Controlled: Story = {
  render: () => {
    const [volume, setVolume] = useState(75);
    const [delay, setDelay] = useState(5);

    return (
      <BoxedList>
        <SpinRow
          title="Volume"
          subtitle={`${volume}%`}
          value={volume}
          onValueChange={setVolume}
          min={0}
          max={100}
        />
        <SpinRow
          title="Idle Delay"
          subtitle={`${delay} minute${delay !== 1 ? "s" : ""}`}
          value={delay}
          onValueChange={setDelay}
          min={1}
          max={60}
        />
      </BoxedList>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: "Use `value` + `onValueChange` for controlled mode. The subtitle can reflect the current value." },
    },
  },
};

// ─── Decimal step ─────────────────────────────────────────────────────────────

export const DecimalStep: Story = {
  render: () => (
    <BoxedList>
      <SpinRow title="Font Scale" defaultValue={1.0} min={0.5} max={3.0} step={0.1} />
      <SpinRow title="Line Spacing" defaultValue={1.5} min={1.0} max={3.0} step={0.25} />
    </BoxedList>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Use a decimal `step` for fractional values — `decimals` is derived automatically from `step`.",
      },
    },
  },
};

// ─── Disabled ─────────────────────────────────────────────────────────────────

export const Disabled: Story = {
  render: () => (
    <BoxedList>
      <SpinRow title="Volume" subtitle="No audio device found" defaultValue={0} disabled />
    </BoxedList>
  ),
  parameters: { controls: { disable: true } },
};
