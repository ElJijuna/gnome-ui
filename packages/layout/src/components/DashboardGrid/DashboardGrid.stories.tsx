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
Responsive 12-column grid container for dashboard widgets and panels.

## Breakpoints

| Breakpoint | Min-width |
|---|---|
| xs | — (base) |
| sm | 576px |
| md | 768px |
| lg | 992px |
| xl | 1200px |
| xxl | 1600px |

## Usage

\`\`\`tsx
import { DashboardGrid } from "@gnome-ui/layout";

// Static layout
<DashboardGrid columns={12} gap="md">
  <DashboardGrid.Item span={6} offset={3}>
    <Card />
  </DashboardGrid.Item>
</DashboardGrid>

// Responsive layout
<DashboardGrid columns={{ xs: 1, sm: 2, md: 3, lg: 4 }} gap={{ xs: "sm", md: "md" }}>
  <DashboardGrid.Item span={{ xs: 12, sm: 6, md: 4 }}>
    <StatCard />
  </DashboardGrid.Item>
</DashboardGrid>
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    columns: { control: false },
    gap: { control: false },
    layout: {
      control: { type: "radio" },
      options: ["grid", "column"],
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

export const TwelveColumnGrid: Story = {
  render: () => (
    <DashboardGrid columns={12} gap="sm">
      {Array.from({ length: 12 }, (_, i) => (
        <DashboardGrid.Item key={i}>
          <Placeholder label={String(i + 1)} height={60} />
        </DashboardGrid.Item>
      ))}
    </DashboardGrid>
  ),
  parameters: {
    docs: {
      description: {
        story: "12-column base grid. Each item occupies one column.",
      },
    },
  },
};

export const ResponsiveColumns: Story = {
  render: () => (
    <DashboardGrid columns={{ xs: 1, sm: 2, md: 3, lg: 4, xl: 6 }} gap="md">
      {["Users", "Revenue", "Sessions", "Errors", "Latency", "Uptime"].map(
        (label) => (
          <DashboardGrid.Item key={label}>
            <Placeholder label={label} />
          </DashboardGrid.Item>
        ),
      )}
    </DashboardGrid>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Responsive columns: 1 on mobile, 2 at sm, 3 at md, 4 at lg, 6 at xl.",
      },
    },
  },
};

export const ResponsiveSpan: Story = {
  render: () => (
    <DashboardGrid columns={12} gap="md">
      <DashboardGrid.Item span={{ xs: 12, md: 8 }}>
        <Placeholder label="Main chart (xs=12, md=8)" height={200} />
      </DashboardGrid.Item>
      <DashboardGrid.Item span={{ xs: 12, md: 4 }}>
        <Placeholder label="Sidebar (xs=12, md=4)" height={200} />
      </DashboardGrid.Item>
      <DashboardGrid.Item span={{ xs: 12, sm: 6, md: 4 }}>
        <Placeholder label="Stat A (xs=12, sm=6, md=4)" />
      </DashboardGrid.Item>
      <DashboardGrid.Item span={{ xs: 12, sm: 6, md: 4 }}>
        <Placeholder label="Stat B (xs=12, sm=6, md=4)" />
      </DashboardGrid.Item>
      <DashboardGrid.Item span={{ xs: 12, sm: 6, md: 4 }}>
        <Placeholder label="Stat C (xs=12, sm=6, md=4)" />
      </DashboardGrid.Item>
    </DashboardGrid>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Each item declares its own responsive span. Resize the window to see the layout adapt.",
      },
    },
  },
};

export const WithOffset: Story = {
  render: () => (
    <DashboardGrid columns={12} gap="md">
      <DashboardGrid.Item span={6}>
        <Placeholder label="span=6" height={80} />
      </DashboardGrid.Item>
      <DashboardGrid.Item span={4} offset={2}>
        <Placeholder label="span=4 offset=2" height={80} />
      </DashboardGrid.Item>
      <DashboardGrid.Item span={8} offset={2}>
        <Placeholder label="span=8 offset=2 (centered)" height={80} />
      </DashboardGrid.Item>
      <DashboardGrid.Item span={4} offset={4}>
        <Placeholder label="span=4 offset=4" height={80} />
      </DashboardGrid.Item>
    </DashboardGrid>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Use `offset` to skip columns before an item. `offset={2}` on a 12-column grid pushes the item right by 2 columns.",
      },
    },
  },
};

export const ResponsiveGap: Story = {
  render: () => (
    <DashboardGrid
      columns={{ xs: 1, sm: 2, md: 3 }}
      gap={{ xs: "sm", md: "md", xl: "lg" }}
    >
      {["A", "B", "C", "D", "E", "F"].map((label) => (
        <DashboardGrid.Item key={label}>
          <Placeholder label={label} height={80} />
        </DashboardGrid.Item>
      ))}
    </DashboardGrid>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Gap adapts to the breakpoint: `sm` at mobile, `md` at 768px+, `lg` at 1200px+.",
      },
    },
  },
};

export const ColumnLayout: Story = {
  args: {
    layout: "column",
    gap: "md",
  },
  render: (args) => (
    <DashboardGrid {...args}>
      {["Queue", "Workers", "Deployments"].map((label) => (
        <DashboardGrid.Item key={label}>
          <Placeholder label={label} height={88} />
        </DashboardGrid.Item>
      ))}
    </DashboardGrid>
  ),
  parameters: {
    docs: {
      description: {
        story: "`layout=\"column\"` stacks children vertically.",
      },
    },
  },
};

export const RealisticDashboard: Story = {
  render: () => (
    <DashboardGrid columns={12} gap="md">
      {/* KPI row: 3 cols each on md+, full width on mobile */}
      <DashboardGrid.Item span={{ xs: 12, sm: 6, md: 3 }}>
        <Placeholder label="Total Users" height={100} />
      </DashboardGrid.Item>
      <DashboardGrid.Item span={{ xs: 12, sm: 6, md: 3 }}>
        <Placeholder label="Revenue" height={100} />
      </DashboardGrid.Item>
      <DashboardGrid.Item span={{ xs: 12, sm: 6, md: 3 }}>
        <Placeholder label="Active Sessions" height={100} />
      </DashboardGrid.Item>
      <DashboardGrid.Item span={{ xs: 12, sm: 6, md: 3 }}>
        <Placeholder label="Error Rate" height={100} />
      </DashboardGrid.Item>

      {/* Chart + sidebar */}
      <DashboardGrid.Item span={{ xs: 12, md: 8 }}>
        <Placeholder label="Traffic Chart" height={240} />
      </DashboardGrid.Item>
      <DashboardGrid.Item span={{ xs: 12, md: 4 }}>
        <Placeholder label="Top Pages" height={240} />
      </DashboardGrid.Item>

      {/* Half-width panels */}
      <DashboardGrid.Item span={{ xs: 12, md: 6 }}>
        <Placeholder label="Recent Events" height={160} />
      </DashboardGrid.Item>
      <DashboardGrid.Item span={{ xs: 12, md: 6 }}>
        <Placeholder label="Device Breakdown" height={160} />
      </DashboardGrid.Item>

      {/* Centered narrow panel using offset */}
      <DashboardGrid.Item span={{ xs: 12, md: 8 }} offset={2}>
        <Placeholder label="System Status (offset=2 at md+)" height={80} />
      </DashboardGrid.Item>
    </DashboardGrid>
  ),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story:
          "Full 12-column responsive dashboard with KPIs, charts, panels, and an offset-centered status bar.",
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
