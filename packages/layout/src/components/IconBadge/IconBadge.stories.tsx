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
Rounded-square tinted icon container. Accepts the seven gnome-ui named colors or any hex value (\`#rgb\` / \`#rrggbb\`). In both cases the background is rendered at 15% opacity via \`color-mix\`.

\`\`\`tsx
import { IconBadge } from "@gnome-ui/layout";

<IconBadge color="blue" size="lg">🚀</IconBadge>
<IconBadge color="#6c8ebf" size="md"><Icon icon={GoHome} /></IconBadge>
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

const HEX_COLORS = ["#6c8ebf", "#82b366", "#d79b00", "#ae4132", "#7b64a0", "#5d4037", "#ddd"];

export const HexColors: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
      {HEX_COLORS.map((color) => (
        <IconBadge key={color} color={color} size="md">
          🎨
        </IconBadge>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Arbitrary hex colors (`#rgb` or `#rrggbb`). The same 15% `color-mix` transparency applied to named colors is used here via inline styles.",
      },
    },
  },
};
