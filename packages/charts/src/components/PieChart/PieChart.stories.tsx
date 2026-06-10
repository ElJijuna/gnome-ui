import type { Meta, StoryObj } from '@storybook/react';

import { PieChart } from './PieChart';
import readme from './README.md?raw';

const meta: Meta<typeof PieChart> = {
  title: 'Charts/PieChart',
  component: PieChart,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: { description: { component: readme } },
  },
  argTypes: {
    data: { control: false },
    className: { control: false },
    height: { control: { type: 'number', min: 100, max: 800, step: 50 } },
    donut: { control: 'boolean' },
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
type Story = StoryObj<typeof PieChart>;

const BROWSER_DATA = [
  { label: 'Chrome', value: 62 },
  { label: 'Firefox', value: 18 },
  { label: 'Safari', value: 11 },
  { label: 'Edge', value: 6 },
  { label: 'Other', value: 3 },
];

export const Default: Story = {
  args: {
    data: BROWSER_DATA,
    showLegend: false,
    legendPosition: 'bottom',
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
    legendPosition: 'bottom',
  },
};

export const Donut: Story = {
  args: {
    data: BROWSER_DATA,
    donut: true,
    showLegend: true,
    legendPosition: 'bottom',
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
      { label: 'Passed', value: 74, color: 'var(--gnome-green-4, #2ec27e)' },
      { label: 'Failed', value: 12, color: 'var(--gnome-red-3, #e01b24)' },
      { label: 'Skipped', value: 14, color: 'var(--gnome-yellow-5, #e5a50a)' },
    ],
    donut: true,
    showLegend: true,
  },
};
