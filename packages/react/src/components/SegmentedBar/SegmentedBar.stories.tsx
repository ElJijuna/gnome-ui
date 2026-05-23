import type { Meta, StoryObj } from "@storybook/react";
import { SegmentedBar } from "./SegmentedBar";
import { Text } from "../Text";

const meta: Meta<typeof SegmentedBar> = {
  title: "Components/SegmentedBar",
  component: SegmentedBar,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
Horizontal bar split into proportional segments, one per category.

Hover any segment to highlight it and reveal a tooltip with its label and percentage.
Values are automatically normalized if they don't sum to exactly 100.

Typical use case: repository language distribution (similar to GitHub's language bar).

\`\`\`tsx
<SegmentedBar
  values={[
    { label: "TypeScript", value: 60, color: "#3178c6" },
    { label: "JavaScript", value: 30, color: "#f7df1e" },
    { label: "CSS",        value: 10, color: "#563d7c" },
  ]}
/>
\`\`\`
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof SegmentedBar>;

// ─── Default (custom colors — language bar use case) ──────────────────────────

export const Default: Story = {
  render: function DefaultStory() {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 600 }}>
        <div>
          <Text variant="caption" color="dim" style={{ marginBottom: 8 }}>
            my-app repository
          </Text>
          <SegmentedBar
            values={[
              { label: "TypeScript", value: 58.4, color: "#3178c6" },
              { label: "JavaScript", value: 22.1, color: "#f7df1e" },
              { label: "CSS",        value: 12.3, color: "#563d7c" },
              { label: "HTML",       value: 5.8,  color: "#e44d26" },
              { label: "Shell",      value: 1.4,  color: "#89e051" },
            ]}
          />
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px" }}>
          {[
            { label: "TypeScript", color: "#3178c6", pct: "58.4%" },
            { label: "JavaScript", color: "#f7df1e", pct: "22.1%" },
            { label: "CSS",        color: "#563d7c", pct: "12.3%" },
            { label: "HTML",       color: "#e44d26", pct: "5.8%"  },
            { label: "Shell",      color: "#89e051", pct: "1.4%"  },
          ].map(({ label, color, pct }) => (
            <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: color, flexShrink: 0 }} />
              <Text variant="caption">{label}</Text>
              <Text variant="caption" color="dim">{pct}</Text>
            </span>
          ))}
        </div>
      </div>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Language distribution bar with explicit per-language colors, matching the common repository overview pattern.",
      },
    },
  },
};

// ─── Auto colors (GNOME token palette) ───────────────────────────────────────

export const AutoColors: Story = {
  render: function AutoColorsStory() {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 600 }}>
        <SegmentedBar
          values={[
            { label: "Design",      value: 35 },
            { label: "Engineering", value: 40 },
            { label: "Marketing",   value: 15 },
            { label: "Operations",  value: 10 },
          ]}
        />
        <Text variant="caption" color="dim">
          Colors assigned automatically from the GNOME token palette when no <code>color</code> prop is provided.
        </Text>
      </div>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "When `color` is omitted, each segment receives a color from the GNOME design token palette (`--gnome-blue-3`, `--gnome-green-3`, `--gnome-purple-3`, …) cycling through 8 distinct colors.",
      },
    },
  },
};

// ─── Single segment ───────────────────────────────────────────────────────────

export const SingleSegment: Story = {
  render: function SingleSegmentStory() {
    return (
      <div style={{ maxWidth: 600 }}>
        <SegmentedBar
          values={[{ label: "Go", value: 100, color: "#00add8" }]}
        />
      </div>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Edge case: a single segment at 100% fills the full bar with no gaps.",
      },
    },
  },
};
