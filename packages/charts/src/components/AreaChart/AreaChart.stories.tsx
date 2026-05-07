import type { Meta, StoryObj } from "@storybook/react";
import { GnomeProvider } from "@gnome-ui/react";
import { AreaChart } from "./AreaChart";

const meta: Meta<typeof AreaChart> = {
  title: "Charts/AreaChart",
  component: AreaChart,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof AreaChart>;

const TRAFFIC_DATA = [
  { week: "W1", downloads: 320, installs: 210 },
  { week: "W2", downloads: 480, installs: 310 },
  { week: "W3", downloads: 410, installs: 280 },
  { week: "W4", downloads: 620, installs: 420 },
  { week: "W5", downloads: 590, installs: 390 },
  { week: "W6", downloads: 780, installs: 540 },
];

export const Default: Story = {
  args: {
    data: TRAFFIC_DATA,
    series: [{ dataKey: "downloads", name: "Downloads" }],
    xAxisKey: "week",
  },
};

export const MultiSeries: Story = {
  args: {
    data: TRAFFIC_DATA,
    series: [
      { dataKey: "downloads", name: "Downloads" },
      { dataKey: "installs", name: "Installs" },
    ],
    xAxisKey: "week",
    showLegend: true,
  },
};

export const Stacked: Story = {
  args: {
    data: TRAFFIC_DATA,
    series: [
      { dataKey: "downloads", name: "Downloads" },
      { dataKey: "installs", name: "Installs" },
    ],
    xAxisKey: "week",
    showLegend: true,
    stacked: true,
  },
};

export const Gradient: Story = {
  args: {
    data: TRAFFIC_DATA,
    series: [
      { dataKey: "downloads", name: "Downloads" },
      { dataKey: "installs", name: "Installs" },
    ],
    xAxisKey: "week",
    showLegend: true,
    gradient: true,
  },
};

export const GradientStacked: Story = {
  args: {
    data: TRAFFIC_DATA,
    series: [
      { dataKey: "downloads", name: "Downloads" },
      { dataKey: "installs", name: "Installs" },
    ],
    xAxisKey: "week",
    showLegend: true,
    gradient: true,
    stacked: true,
  },
};

const LARGE_TRAFFIC_DATA = [
  { week: "W1", downloads: 32000, installs: 21000 },
  { week: "W2", downloads: 48000, installs: 31000 },
  { week: "W3", downloads: 41000, installs: 28000 },
];

export const WithLocale: Story = {
  render: (args) => (
    <GnomeProvider locale="de-DE">
      <AreaChart {...args} />
    </GnomeProvider>
  ),
  args: {
    data: LARGE_TRAFFIC_DATA,
    series: [
      { dataKey: "downloads", name: "Downloads" },
      { dataKey: "installs", name: "Installs" },
    ],
    xAxisKey: "week",
    showLegend: true,
  },
};
