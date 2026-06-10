import type { Meta, StoryObj } from '@storybook/react';

import { RadialBarChart } from './RadialBarChart';
import readme from './README.md?raw';

const meta: Meta<typeof RadialBarChart> = {
  title: 'Charts/RadialBarChart',
  component: RadialBarChart,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: { description: { component: readme } },
  },
  argTypes: {
    data: { control: false },
    className: { control: false },
    height: { control: { type: 'number', min: 100, max: 800, step: 50 } },
    showLabels: { control: 'boolean' },
    showLegend: { control: 'boolean' },
    legendPosition: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
      if: { arg: 'showLegend' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof RadialBarChart>;

const RESOURCE_DATA = [
  { label: 'CPU', value: 72 },
  { label: 'Memory', value: 58 },
  { label: 'Disk', value: 41 },
  { label: 'Network', value: 85 },
];

export const Default: Story = {
  args: {
    data: RESOURCE_DATA,
    showLegend: false,
    legendPosition: 'bottom',
  },
};

export const WithLabels: Story = {
  args: {
    data: RESOURCE_DATA,
    showLabels: true,
  },
};

export const WithLegend: Story = {
  args: {
    data: RESOURCE_DATA,
    showLegend: true,
    legendPosition: 'bottom',
  },
};

export const DonutGap: Story = {
  args: {
    data: RESOURCE_DATA,
    innerRadius: '40%',
    showLegend: true,
    legendPosition: 'bottom',
  },
};

export const CustomColors: Story = {
  args: {
    data: [
      { label: 'Completed', value: 90, color: 'var(--gnome-green-4, #2ec27e)' },
      { label: 'In Progress', value: 60, color: 'var(--gnome-blue-3, #3584e4)' },
      { label: 'Blocked', value: 25, color: 'var(--gnome-red-3, #e01b24)' },
    ],
    showLabels: true,
    showLegend: true,
  },
};
