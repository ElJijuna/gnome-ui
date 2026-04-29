import type { Meta, StoryObj } from "@storybook/react";
import { PieChart } from "./PieChart";

const meta: Meta<typeof PieChart> = {
  title: "Charts/PieChart",
  component: PieChart,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof PieChart>;

const BROWSER_DATA = [
  { label: "Chrome", value: 62 },
  { label: "Firefox", value: 18 },
  { label: "Safari", value: 11 },
  { label: "Edge", value: 6 },
  { label: "Other", value: 3 },
];

export const Default: Story = {
  args: {
    data: BROWSER_DATA,
  },
};

export const WithLabels: Story = {
  args: {
    data: BROWSER_DATA,
    showLabels: true,
  },
};

export const WithLegend: Story = {
  args: {
    data: BROWSER_DATA,
    showLegend: true,
  },
};

export const Donut: Story = {
  args: {
    data: BROWSER_DATA,
    donut: true,
    showLegend: true,
  },
};

export const DonutWithLabels: Story = {
  args: {
    data: BROWSER_DATA,
    donut: true,
    showLabels: true,
    showLegend: true,
  },
};

export const CustomColors: Story = {
  args: {
    data: [
      { label: "Passed", value: 74, color: "var(--gnome-green-4, #2ec27e)" },
      { label: "Failed", value: 12, color: "var(--gnome-red-3, #e01b24)" },
      { label: "Skipped", value: 14, color: "var(--gnome-yellow-5, #e5a50a)" },
    ],
    donut: true,
    showLegend: true,
  },
};
