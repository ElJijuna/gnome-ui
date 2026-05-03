import type { Meta, StoryObj } from "@storybook/react";
import { Skeleton } from "./Skeleton";
import { Card } from "../Card";

const meta: Meta<typeof Skeleton> = {
  title: "Components/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Content-shaped loading placeholder for skeleton screens.

GNOME HIG recommends \`Spinner\` and \`ProgressBar\` for loading states. \`Skeleton\`
is provided as a pragmatic web-style extension for dashboards and data-heavy
views where placeholders reduce layout shift.
        `,
      },
    },
  },
  argTypes: {
    variant: { control: "select", options: ["rect", "circle", "text"] },
    width: { control: "text" },
    height: { control: "text" },
    size: { control: { type: "number", min: 8, max: 160, step: 1 } },
    lines: { control: { type: "number", min: 1, max: 8, step: 1 } },
    animated: { control: "boolean" },
  },
  args: {
    variant: "rect",
    width: 200,
    height: 20,
    size: 40,
    lines: 3,
    animated: true,
  },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

// Rectangular

export const Rectangular: Story = {};

// Circle

export const Circle: Story = {
  args: {
    variant: "circle",
    size: 48,
  },
};

// Text

export const Text: Story = {
  args: {
    variant: "text",
    lines: 4,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
};

// All variants

export const Variants: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 20, maxWidth: 360 }}>
      <Skeleton width="100%" height={24} />
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Skeleton variant="circle" size={48} />
        <Skeleton variant="text" lines={2} />
      </div>
      <Skeleton variant="text" lines={4} />
    </div>
  ),
  parameters: { controls: { disable: true } },
};

// Card skeleton

export const CardSkeleton: Story = {
  render: () => (
    <Card style={{ width: 320 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Skeleton variant="circle" size={44} />
        <div style={{ flex: 1 }}>
          <Skeleton variant="text" lines={2} />
        </div>
      </div>
      <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
        <Skeleton height={72} />
        <Skeleton variant="text" lines={3} />
      </div>
    </Card>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "A realistic card placeholder that mirrors avatar, title, summary, and content regions while data loads.",
      },
    },
  },
};
