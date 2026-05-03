import type { Meta, StoryObj } from "@storybook/react";
import { DashboardGrid } from "./DashboardGrid";

const Placeholder = ({
  label,
  height = 120,
}: {
  label: string;
  height?: number;
}) => (
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

const meta: Meta<typeof DashboardGrid> = {
  title: "Layout/DashboardGrid",
  component: DashboardGrid,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
Responsive grid container for arranging dashboard widgets and panels.

Use \`columns\` to fix the column count or let it adapt automatically with \`"auto"\`.
Wrap each widget in \`DashboardGrid.Item\` and set \`span\` to make it span multiple columns.

\`\`\`tsx
import { DashboardGrid } from "@gnome-ui/layout";

<DashboardGrid columns={3} gap="md">
  <DashboardGrid.Item span={2}>
    <StatCard ... />
  </DashboardGrid.Item>
  <DashboardGrid.Item>
    <ProgressCard ... />
  </DashboardGrid.Item>
</DashboardGrid>
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    columns: {
      control: { type: "select" },
      options: [1, 2, 3, 4, "auto"],
    },
    gap: {
      control: { type: "radio" },
      options: ["sm", "md", "lg"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof DashboardGrid>;

export const Default: Story = {
  args: {
    columns: "auto",
    gap: "md",
  },
  render: (args) => (
    <DashboardGrid {...args}>
      {["Widget A", "Widget B", "Widget C", "Widget D"].map((label) => (
        <DashboardGrid.Item key={label}>
          <Placeholder label={label} />
        </DashboardGrid.Item>
      ))}
    </DashboardGrid>
  ),
};

export const FixedColumns: Story = {
  args: {
    columns: 3,
    gap: "md",
  },
  render: (args) => (
    <DashboardGrid {...args}>
      {["Stats", "Revenue", "Users", "Sessions", "Errors", "Uptime"].map(
        (label) => (
          <DashboardGrid.Item key={label}>
            <Placeholder label={label} />
          </DashboardGrid.Item>
        ),
      )}
    </DashboardGrid>
  ),
  parameters: {
    docs: { description: { story: "Fixed 3-column layout." } },
  },
};

export const WithSpanning: Story = {
  args: {
    columns: 3,
    gap: "md",
  },
  render: (args) => (
    <DashboardGrid {...args}>
      <DashboardGrid.Item span={2}>
        <Placeholder label="Revenue Chart (span 2)" height={200} />
      </DashboardGrid.Item>
      <DashboardGrid.Item>
        <Placeholder label="Quick Stats" height={200} />
      </DashboardGrid.Item>
      <DashboardGrid.Item>
        <Placeholder label="Users" />
      </DashboardGrid.Item>
      <DashboardGrid.Item>
        <Placeholder label="Sessions" />
      </DashboardGrid.Item>
      <DashboardGrid.Item>
        <Placeholder label="Errors" />
      </DashboardGrid.Item>
      <DashboardGrid.Item span={3}>
        <Placeholder label="Activity Feed (span 3)" height={80} />
      </DashboardGrid.Item>
    </DashboardGrid>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Items can span multiple columns via the `span` prop on `DashboardGrid.Item`.",
      },
    },
  },
};

export const GapVariants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {(["sm", "md", "lg"] as const).map((gap) => (
        <div key={gap}>
          <p style={{ marginBottom: 8, fontWeight: 600, fontSize: 13 }}>
            gap="{gap}"
          </p>
          <DashboardGrid columns={3} gap={gap}>
            {["A", "B", "C"].map((l) => (
              <DashboardGrid.Item key={l}>
                <Placeholder label={l} height={80} />
              </DashboardGrid.Item>
            ))}
          </DashboardGrid>
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: { description: { story: "All three gap sizes side by side." } },
  },
};

export const RealisticDashboard: Story = {
  render: () => (
    <DashboardGrid columns={4} gap="md">
      <DashboardGrid.Item>
        <Placeholder label="Total Users" height={100} />
      </DashboardGrid.Item>
      <DashboardGrid.Item>
        <Placeholder label="Revenue" height={100} />
      </DashboardGrid.Item>
      <DashboardGrid.Item>
        <Placeholder label="Active Sessions" height={100} />
      </DashboardGrid.Item>
      <DashboardGrid.Item>
        <Placeholder label="Error Rate" height={100} />
      </DashboardGrid.Item>
      <DashboardGrid.Item span={3}>
        <Placeholder label="Traffic Chart (span 3)" height={220} />
      </DashboardGrid.Item>
      <DashboardGrid.Item>
        <Placeholder label="Top Pages" height={220} />
      </DashboardGrid.Item>
      <DashboardGrid.Item span={2}>
        <Placeholder label="Recent Events (span 2)" height={160} />
      </DashboardGrid.Item>
      <DashboardGrid.Item span={2}>
        <Placeholder label="Device Breakdown (span 2)" height={160} />
      </DashboardGrid.Item>
    </DashboardGrid>
  ),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story:
          "Realistic 4-column dashboard mixing full-width, half-width, and single-column panels.",
      },
    },
  },
};
