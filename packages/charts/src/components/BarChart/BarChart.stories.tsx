import type { Meta, StoryObj } from "@storybook/react";
import { BarChart } from "./BarChart";

const formatMillions = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return String(value);
};

const meta: Meta<typeof BarChart> = {
  title: "Charts/BarChart",
  component: BarChart,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof BarChart>;

const MONTHLY_DATA = [
  { month: "Jan", users: 420, sessions: 680 },
  { month: "Feb", users: 380, sessions: 590 },
  { month: "Mar", users: 510, sessions: 820 },
  { month: "Apr", users: 470, sessions: 760 },
  { month: "May", users: 630, sessions: 980 },
  { month: "Jun", users: 710, sessions: 1100 },
];

const LIBRARY_DOWNLOADS = [
  { library: "react",      monthly: 28400000, weekly: 7100000 },
  { library: "vue",        monthly: 4200000,  weekly: 1050000 },
  { library: "angular",    monthly: 3100000,  weekly: 775000  },
  { library: "svelte",     monthly: 1200000,  weekly: 300000  },
  { library: "solid-js",   monthly: 420000,   weekly: 105000  },
  { library: "preact",     monthly: 1800000,  weekly: 450000  },
  { library: "lit",        monthly: 950000,   weekly: 237000  },
  { library: "qwik",       monthly: 310000,   weekly: 77000   },
  { library: "alpine",     monthly: 580000,   weekly: 145000  },
  { library: "ember",      monthly: 260000,   weekly: 65000   },
];

export const Default: Story = {
  args: {
    data: MONTHLY_DATA,
    series: [{ dataKey: "users", name: "Users" }],
    xAxisKey: "month",
  },
};

export const MultiSeries: Story = {
  args: {
    data: MONTHLY_DATA,
    series: [
      { dataKey: "users", name: "Users" },
      { dataKey: "sessions", name: "Sessions" },
    ],
    xAxisKey: "month",
    showLegend: true,
  },
};

export const NoGrid: Story = {
  args: {
    data: MONTHLY_DATA,
    series: [{ dataKey: "users", name: "Users" }],
    xAxisKey: "month",
    showGrid: false,
  },
};

export const LibraryDownloads: Story = {
  args: {
    data: LIBRARY_DOWNLOADS,
    series: [
      { dataKey: "monthly", name: "Monthly downloads" },
      { dataKey: "weekly", name: "Weekly downloads" },
    ],
    xAxisKey: "library",
    showLegend: true,
    layout: "vertical",
    yAxisFormatter: formatMillions,
    height: 480,
  },
};

export const NoXAxis: Story = {
  args: {
    data: MONTHLY_DATA,
    series: [{ dataKey: "users", name: "Users" }],
    xAxisKey: "month",
    showXAxis: false,
  },
};

export const NoYAxis: Story = {
  args: {
    data: MONTHLY_DATA,
    series: [{ dataKey: "users", name: "Users" }],
    xAxisKey: "month",
    showYAxis: false,
  },
};

export const NoAxes: Story = {
  args: {
    data: MONTHLY_DATA,
    series: [{ dataKey: "users", name: "Users" }],
    xAxisKey: "month",
    showXAxis: false,
    showYAxis: false,
  },
};

export const Stacked: Story = {
  args: {
    data: MONTHLY_DATA,
    series: [
      { dataKey: "users", name: "Users" },
      { dataKey: "sessions", name: "Sessions" },
    ],
    xAxisKey: "month",
    showLegend: true,
    stacked: true,
  },
};
