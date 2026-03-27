import { useState, useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ProgressBar } from "./ProgressBar";
import { Text } from "../Text";

const meta: Meta<typeof ProgressBar> = {
  title: "Components/ProgressBar",
  component: ProgressBar,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Determinate and indeterminate progress bar following the Adwaita style.

### Guidelines
- Use **determinate** (\`value\` 0–1) when you know the exact completion percentage.
- Use **indeterminate** (no \`value\`) when duration is unknown — prefer \`Spinner\` for short waits.
- Always provide an \`aria-label\` or \`aria-labelledby\` so screen readers can announce what is loading.
- Pair with a text label to show the percentage or description alongside the bar.
- Respects \`prefers-reduced-motion\` — the indeterminate animation is stopped and the bar shown at full width with reduced opacity.
        `,
      },
    },
  },
  argTypes: {
    value: { control: { type: "range", min: 0, max: 1, step: 0.01 } },
  },
  args: {
    value: 0.6,
    "aria-label": "Loading",
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 400 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ProgressBar>;

// ─── Determinate ──────────────────────────────────────────────────────────────

export const Determinate: Story = {
  args: { value: 0.6 },
};

// ─── Indeterminate ────────────────────────────────────────────────────────────

export const Indeterminate: Story = {
  args: { value: undefined },
  parameters: {
    docs: {
      description: {
        story: "Omit `value` to show the pulsing indeterminate animation.",
      },
    },
  },
};

// ─── With label ───────────────────────────────────────────────────────────────

export const WithLabel: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Text variant="body">Downloading update…</Text>
        <Text variant="body" color="dim">60 %</Text>
      </div>
      <ProgressBar value={0.6} aria-label="Downloading update" />
    </div>
  ),
  parameters: { controls: { disable: true } },
};

// ─── Animated demo ────────────────────────────────────────────────────────────

export const Animated: Story = {
  render: function AnimatedStory() {
    const [value, setValue] = useState(0);

    useEffect(() => {
      if (value >= 1) return;
      const id = setTimeout(() => setValue((v) => Math.min(1, v + 0.02)), 80);
      return () => clearTimeout(id);
    }, [value]);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Text variant="body">{value < 1 ? "Installing…" : "Complete"}</Text>
          <Text variant="body" color="dim">{Math.round(value * 100)} %</Text>
        </div>
        <ProgressBar value={value} aria-label="Installation progress" />
      </div>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Live example — the fill transitions smoothly as `value` changes.",
      },
    },
  },
};

// ─── Multiple bars ────────────────────────────────────────────────────────────

export const MultipleBars: Story = {
  render: () => {
    const items = [
      { label: "Music",     value: 0.82 },
      { label: "Photos",    value: 0.45 },
      { label: "Videos",    value: 0.91 },
      { label: "Documents", value: 0.13 },
    ];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {items.map(({ label, value }) => (
          <div key={label} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Text variant="caption">{label}</Text>
              <Text variant="caption" color="dim">{Math.round(value * 100)} %</Text>
            </div>
            <ProgressBar value={value} aria-label={label} />
          </div>
        ))}
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};
