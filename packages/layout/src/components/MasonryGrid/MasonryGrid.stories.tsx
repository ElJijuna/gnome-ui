import type { Meta, StoryObj } from "@storybook/react";
import { MasonryGrid } from "./MasonryGrid";

const HEIGHTS = [180, 120, 260, 100, 200, 140, 300, 160, 220, 90, 170, 240];

const Card = ({ label, height }: { label: string; height: number }) => (
  <div
    style={{
      height,
      background: "var(--gnome-card-bg, #f6f5f4)",
      border: "1px solid var(--gnome-border-color, #deddda)",
      borderRadius: 12,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 500,
      color: "var(--gnome-dim-label-color, #77767b)",
      fontSize: 14,
    }}
  >
    {label}
  </div>
);

const meta: Meta<typeof MasonryGrid> = {
  title: "Layout/MasonryGrid",
  component: MasonryGrid,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
Masonry layout that distributes variable-height items across columns using a
**shortest-column-first** algorithm — each new item is placed in the column
with the least accumulated height, minimising gaps.

Layout is computed in JavaScript via \`ResizeObserver\`, so it adapts automatically
when the container or any item changes size. Enable \`fresh\` to continuously
monitor individual item heights.

\`\`\`tsx
import { MasonryGrid } from "@gnome-ui/layout";

<MasonryGrid columns={{ xs: 1, sm: 2, md: 3 }} gap="md">
  <Card />
  <Card />
  <Card />
</MasonryGrid>
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    columns: { control: false },
    gap: {
      control: { type: "radio" },
      options: ["sm", "md", "lg"],
    },
    fresh: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof MasonryGrid>;

export const Default: Story = {
  args: { columns: 3, gap: "md" },
  render: (args) => (
    <MasonryGrid {...args}>
      {HEIGHTS.map((h, i) => (
        <Card key={i} label={`Item ${i + 1}`} height={h} />
      ))}
    </MasonryGrid>
  ),
};

export const ResponsiveColumns: Story = {
  render: () => (
    <MasonryGrid columns={{ xs: 1, sm: 2, md: 3, lg: 4 }} gap="md">
      {HEIGHTS.map((h, i) => (
        <Card key={i} label={`Item ${i + 1}`} height={h} />
      ))}
    </MasonryGrid>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "1 column on mobile, 2 at sm, 3 at md, 4 at lg. Resize the window to see the layout reflow.",
      },
    },
  },
};

export const TwoColumns: Story = {
  render: () => (
    <MasonryGrid columns={2} gap="lg">
      {HEIGHTS.slice(0, 6).map((h, i) => (
        <Card key={i} label={`Item ${i + 1}`} height={h} />
      ))}
    </MasonryGrid>
  ),
  parameters: {
    docs: { description: { story: "Fixed 2-column layout with large gap." } },
  },
};

export const GapVariants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
      {(["sm", "md", "lg"] as const).map((gap) => (
        <div key={gap}>
          <p style={{ marginBottom: 8, fontWeight: 600, fontSize: 13 }}>
            gap="{gap}"
          </p>
          <MasonryGrid columns={3} gap={gap}>
            {HEIGHTS.slice(0, 6).map((h, i) => (
              <Card key={i} label={`${i + 1}`} height={h} />
            ))}
          </MasonryGrid>
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: { description: { story: "All three gap sizes." } },
  },
};
