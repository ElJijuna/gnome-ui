import type { Meta, StoryObj } from "@storybook/react";
import { Icon } from "@gnome-ui/react";
import { IconBadge } from "./IconBadge";
import type { IconBadgeColor, IconBadgeSize } from "./IconBadge";
import { GoHome } from "@gnome-ui/icons";

const meta: Meta<typeof IconBadge> = {
  title: "Layout/IconBadge",
  component: IconBadge,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
Rounded-square tinted icon container that follows the gnome-ui color token system.

\`\`\`tsx
import { IconBadge } from "@gnome-ui/layout";

<IconBadge color="blue" size="lg">🚀</IconBadge>
<IconBadge color="green" size="md"><Icon icon={GoHome} /></IconBadge>
<IconBadge size="sm">📄</IconBadge>
\`\`\`
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof IconBadge>;

// ─── All sizes × colors ────────────────────────────────────────────────────────

const COLORS: (IconBadgeColor | undefined)[] = [
  "blue", "green", "yellow", "orange", "red", "purple", "brown", undefined,
];
const SIZES: IconBadgeSize[] = ["xs", "sm", "md", "lg", "xl"];

export const AllColors: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
      {COLORS.map((color) => (
        <IconBadge key={color ?? "neutral"} color={color} size="md">
          🎨
        </IconBadge>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: { story: "All color variants at `md` size. The last badge has no `color` prop — falls back to the neutral overlay." },
    },
  },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      {SIZES.map((size) => (
        <IconBadge key={size} color="blue" size={size}>
          🔵
        </IconBadge>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: { story: "All five size variants (`xs` → `xl`) with `color=\"blue\"`." },
    },
  },
};

export const WithIcon: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
      {COLORS.filter(Boolean).map((color) => (
        <IconBadge key={color} color={color} size="md">
          <Icon icon={GoHome} size="sm" />
        </IconBadge>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: { story: "Using an `<Icon>` as children. The icon inherits the container `color` automatically." },
    },
  },
};

export const WithEmoji: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
      <IconBadge color="blue" size="xl">🚀</IconBadge>
      <IconBadge color="green" size="lg">🌿</IconBadge>
      <IconBadge color="yellow" size="md">⚡</IconBadge>
      <IconBadge color="red" size="sm">🔥</IconBadge>
      <IconBadge size="xs">📄</IconBadge>
    </div>
  ),
  parameters: {
    docs: {
      description: { story: "Emoji content across different sizes and colors." },
    },
  },
};

export const Neutral: Story = {
  args: {
    size: "md",
    children: "📄",
  },
  parameters: {
    docs: {
      description: { story: "When `color` is omitted the background uses `--gnome-hover-overlay` (neutral grey tray)." },
    },
  },
};
