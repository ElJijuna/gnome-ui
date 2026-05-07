import type { Meta, StoryObj } from "@storybook/react";
import { GnomeProvider } from "@gnome-ui/react";
import { LineChart } from "./LineChart";

const meta: Meta<typeof LineChart> = {
  title: "Charts/LineChart",
  component: LineChart,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof LineChart>;

const WEEKLY_DATA = [
  { day: "Mon", cpu: 42, memory: 68 },
  { day: "Tue", cpu: 58, memory: 72 },
  { day: "Wed", cpu: 35, memory: 65 },
  { day: "Thu", cpu: 71, memory: 80 },
  { day: "Fri", cpu: 63, memory: 75 },
  { day: "Sat", cpu: 28, memory: 55 },
  { day: "Sun", cpu: 19, memory: 48 },
];

export const Default: Story = {
  args: {
    data: WEEKLY_DATA,
    series: [{ dataKey: "cpu", name: "CPU %" }],
    xAxisKey: "day",
  },
};

export const MultiSeries: Story = {
  args: {
    data: WEEKLY_DATA,
    series: [
      { dataKey: "cpu", name: "CPU %" },
      { dataKey: "memory", name: "Memory %" },
    ],
    xAxisKey: "day",
    showLegend: true,
  },
};

export const NoGrid: Story = {
  args: {
    data: WEEKLY_DATA,
    series: [{ dataKey: "cpu", name: "CPU %" }],
    xAxisKey: "day",
    showGrid: false,
  },
};

const LARGE_METRICS = [
  { day: "Mon", requests: 142000, errors: 1800 },
  { day: "Tue", requests: 158000, errors: 2200 },
  { day: "Wed", requests: 135000, errors: 1500 },
  { day: "Thu", requests: 171000, errors: 2800 },
];

export const WithLocale: Story = {
  render: (args) => (
    <GnomeProvider locale="de-DE">
      <LineChart {...args} />
    </GnomeProvider>
  ),
  args: {
    data: LARGE_METRICS,
    series: [
      { dataKey: "requests", name: "Requests" },
      { dataKey: "errors", name: "Errors" },
    ],
    xAxisKey: "day",
    showLegend: true,
  },
};
