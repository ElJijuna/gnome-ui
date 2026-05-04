import type { Meta, StoryObj } from "@storybook/react";
import { Icon } from "@gnome-ui/react";
import { Applications, Error, Person, Refresh } from "@gnome-ui/icons";
import { StatCard } from "./StatCard";

const meta: Meta<typeof StatCard> = {
  title: "Layout/StatCard",
  component: StatCard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
Metric card for dashboards with optional unit, trend indicator, icon, and loading state.

\`\`\`tsx
import { StatCard } from "@gnome-ui/layout";

<StatCard
  label="Active Users"
  value={1284}
  unit="users"
  trend={{ direction: "up", value: 12, period: "vs last week" }}
/>
\`\`\`
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof StatCard>;

export const UpTrend: Story = {
  args: {
    label: "Active Users",
    value: 1284,
    unit: "users",
    icon: <Icon icon={Person} size="lg" />,
    trend: { direction: "up", value: 12, period: "vs last week" },
  },
};

export const DownTrend: Story = {
  args: {
    label: "Error Rate",
    value: 2.4,
    unit: "%",
    icon: <Icon icon={Error} size="lg" />,
    trend: { direction: "down", value: -8, period: "vs yesterday" },
  },
};

export const NeutralTrend: Story = {
  args: {
    label: "Latency",
    value: 42,
    unit: "ms",
    icon: <Icon icon={Refresh} size="lg" />,
    trend: { direction: "neutral", value: 0, period: "stable" },
  },
};

export const Loading: Story = {
  args: {
    label: "Requests",
    value: 0,
    loading: true,
    icon: <Icon icon={Applications} size="lg" />,
  },
};

export const Dashboard: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 16, width: 880 }}>
      <StatCard
        label="Active Users"
        value={1284}
        unit="users"
        icon={<Icon icon={Person} size="lg" />}
        trend={{ direction: "up", value: 12, period: "vs last week" }}
      />
      <StatCard
        label="Requests"
        value="24.8k"
        icon={<Icon icon={Applications} size="lg" />}
        trend={{ direction: "up", value: 6, period: "today" }}
      />
      <StatCard
        label="Error Rate"
        value={2.4}
        unit="%"
        icon={<Icon icon={Error} size="lg" />}
        trend={{ direction: "down", value: -8, period: "vs yesterday" }}
      />
      <StatCard
        label="Latency"
        value={42}
        unit="ms"
        icon={<Icon icon={Refresh} size="lg" />}
        trend={{ direction: "neutral", value: 0, period: "stable" }}
      />
    </div>
  ),
};
