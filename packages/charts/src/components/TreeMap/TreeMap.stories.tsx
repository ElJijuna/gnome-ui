import type { Meta, StoryObj } from "@storybook/react";
import { GnomeProvider } from "@gnome-ui/react";
import { TreeMap } from "./TreeMap";

const meta: Meta<typeof TreeMap> = {
  title: "Charts/TreeMap",
  component: TreeMap,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof TreeMap>;

const FLAT_DATA = [
  { label: "React", value: 4200 },
  { label: "Vue", value: 2100 },
  { label: "Angular", value: 1800 },
  { label: "Svelte", value: 900 },
  { label: "Solid", value: 600 },
];

const GROUPED_DATA = [
  { label: "React", value: 4200, group: "Frontend" },
  { label: "Vue", value: 2100, group: "Frontend" },
  { label: "Node.js", value: 3800, group: "Backend" },
  { label: "Python", value: 5100, group: "Backend" },
  { label: "PostgreSQL", value: 2900, group: "Database" },
];

export const Flat: Story = {
  args: {
    data: FLAT_DATA,
    height: 400,
  },
};

export const Grouped: Story = {
  args: {
    data: GROUPED_DATA,
    height: 400,
  },
};

export const NoLabels: Story = {
  args: {
    data: GROUPED_DATA,
    height: 400,
    showLabels: false,
  },
};

export const WithLocale: Story = {
  render: (args) => (
    <GnomeProvider locale="de-DE">
      <TreeMap {...args} />
    </GnomeProvider>
  ),
  args: {
    data: [
      { label: "React", value: 42000, group: "Frontend" },
      { label: "Vue", value: 21000, group: "Frontend" },
      { label: "Node.js", value: 38000, group: "Backend" },
      { label: "Python", value: 51000, group: "Backend" },
    ],
    height: 400,
  },
};
