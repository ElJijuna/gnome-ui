import type { Meta, StoryObj } from "@storybook/react";
import { AvatarRotator } from "./AvatarRotator";
import { Text } from "../Text";

const avatarSources = [
  "https://i.pravatar.cc/128?img=5",
  "https://i.pravatar.cc/128?img=32",
  "https://i.pravatar.cc/128?img=47",
  "https://i.pravatar.cc/128?img=56",
];

const meta: Meta<typeof AvatarRotator> = {
  title: "Components/AvatarRotator",
  component: AvatarRotator,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Single avatar surface that crossfades through multiple image sources.

### Guidelines
- Use when one person or entity has several possible avatar images and the UI should keep a single avatar footprint.
- Keep the rotation interval calm enough that it does not distract from adjacent content.
- Provide \`name\` or \`alt\` so the rotating surface has a stable accessible label.
        `,
      },
    },
  },
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg", "xl"] },
    name: { control: "text" },
    interval: { control: "number" },
    transitionDuration: { control: "number" },
    pauseOnHover: { control: "boolean" },
  },
  args: {
    name: "Ada Lovelace",
    avatars: avatarSources,
    size: "lg",
    interval: 2200,
    transitionDuration: 260,
    pauseOnHover: true,
  },
};

export default meta;
type Story = StoryObj<typeof AvatarRotator>;

// ─── Default ─────────────────────────────────────────────────────────────────

export const Default: Story = {};

// ─── Sizes ───────────────────────────────────────────────────────────────────

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      {(["sm", "md", "lg", "xl"] as const).map((size) => (
        <div
          key={size}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <AvatarRotator
            name="Ada Lovelace"
            avatars={avatarSources}
            size={size}
            interval={1800}
          />
          <Text variant="caption" color="dim">
            {size}
          </Text>
        </div>
      ))}
    </div>
  ),
  parameters: { controls: { disable: true } },
};

// ─── Fallback ────────────────────────────────────────────────────────────────

export const Fallback: Story = {
  args: {
    name: "Ada Lovelace",
    avatars: [],
    color: "purple",
    size: "lg",
  },
  parameters: {
    docs: {
      description: {
        story:
          "When no usable image source is provided, `AvatarRotator` falls back to the regular `Avatar` initials behavior.",
      },
    },
  },
};

// ─── Controlled ──────────────────────────────────────────────────────────────

export const Controlled: Story = {
  args: {
    activeIndex: 2,
    interval: 0,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Use `activeIndex` when the visible avatar should be driven by external state instead of automatic rotation.",
      },
    },
  },
};
