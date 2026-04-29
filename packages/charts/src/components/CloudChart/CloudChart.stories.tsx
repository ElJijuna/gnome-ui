import type { Meta, StoryObj } from "@storybook/react";
import { CloudChart } from "./CloudChart";

const meta: Meta<typeof CloudChart> = {
  title: "Charts/CloudChart",
  component: CloudChart,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof CloudChart>;

const TECH_DATA = [
  { text: "TypeScript", value: 95 },
  { text: "React", value: 88 },
  { text: "Node.js", value: 76 },
  { text: "CSS", value: 70 },
  { text: "GraphQL", value: 55 },
  { text: "Docker", value: 52 },
  { text: "PostgreSQL", value: 48 },
  { text: "Rust", value: 42 },
  { text: "Python", value: 38 },
  { text: "Go", value: 30 },
  { text: "Kubernetes", value: 25 },
  { text: "WebAssembly", value: 18 },
];

export const Default: Story = {
  args: {
    data: TECH_DATA,
  },
};

export const NarrowFontRange: Story = {
  args: {
    data: TECH_DATA,
    minFontSize: 14,
    maxFontSize: 28,
  },
};

export const WideFontRange: Story = {
  args: {
    data: TECH_DATA,
    minFontSize: 10,
    maxFontSize: 64,
  },
};

export const CustomColors: Story = {
  args: {
    data: [
      { text: "Accessibility", value: 90, color: "var(--gnome-blue-3, #3584e4)" },
      { text: "Performance", value: 75, color: "var(--gnome-green-4, #2ec27e)" },
      { text: "Security", value: 68, color: "var(--gnome-red-3, #e01b24)" },
      { text: "Usability", value: 82, color: "var(--gnome-purple-3, #9141ac)" },
      { text: "Reliability", value: 60, color: "var(--gnome-orange-3, #ff7800)" },
      { text: "Scalability", value: 55, color: "var(--gnome-yellow-5, #e5a50a)" },
    ],
  },
};

export const EqualWeights: Story = {
  args: {
    data: [
      { text: "Alpha", value: 1 },
      { text: "Beta", value: 1 },
      { text: "Gamma", value: 1 },
      { text: "Delta", value: 1 },
      { text: "Epsilon", value: 1 },
    ],
  },
};
