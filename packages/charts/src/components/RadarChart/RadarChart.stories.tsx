import type { Meta, StoryObj } from "@storybook/react";
import { RadarChart } from "./RadarChart";

const meta: Meta<typeof RadarChart> = {
  title: "Charts/RadarChart",
  component: RadarChart,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof RadarChart>;

const SKILLS_DATA = [
  { skill: "TypeScript", alice: 90, bob: 70 },
  { skill: "React", alice: 85, bob: 80 },
  { skill: "CSS", alice: 60, bob: 75 },
  { skill: "Testing", alice: 75, bob: 55 },
  { skill: "DevOps", alice: 50, bob: 65 },
  { skill: "Accessibility", alice: 80, bob: 45 },
];

export const Default: Story = {
  args: {
    data: SKILLS_DATA,
    series: [{ dataKey: "alice", name: "Alice" }],
    angleKey: "skill",
  },
};

export const MultiSeries: Story = {
  args: {
    data: SKILLS_DATA,
    series: [
      { dataKey: "alice", name: "Alice" },
      { dataKey: "bob", name: "Bob" },
    ],
    angleKey: "skill",
    showLegend: true,
  },
};

export const Filled: Story = {
  args: {
    data: SKILLS_DATA,
    series: [
      { dataKey: "alice", name: "Alice" },
      { dataKey: "bob", name: "Bob" },
    ],
    angleKey: "skill",
    filled: true,
    showLegend: true,
  },
};

export const SingleFilled: Story = {
  args: {
    data: SKILLS_DATA,
    series: [{ dataKey: "alice", name: "Alice" }],
    angleKey: "skill",
    filled: true,
  },
};
