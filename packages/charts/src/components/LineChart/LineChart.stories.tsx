import type { Meta, StoryObj } from '@storybook/react';

import { LineChart } from './LineChart';
import readme from './README.md?raw';

const meta: Meta<typeof LineChart> = {
  title: 'Charts/LineChart',
  component: LineChart,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: { description: { component: readme } },
  },
  argTypes: {
    data: { control: false },
    series: { control: false },
    className: { control: false },
    height: { control: { type: 'number', min: 100, max: 800, step: 50 } },
    showGrid: { control: 'boolean' },
    showLegend: { control: 'boolean' },
    legendPosition: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
      if: { arg: 'showLegend' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof LineChart>;

const WEEKLY_DATA = [
  { day: 'Mon', cpu: 42, memory: 68 },
  { day: 'Tue', cpu: 58, memory: 72 },
  { day: 'Wed', cpu: 35, memory: 65 },
  { day: 'Thu', cpu: 71, memory: 80 },
  { day: 'Fri', cpu: 63, memory: 75 },
  { day: 'Sat', cpu: 28, memory: 55 },
  { day: 'Sun', cpu: 19, memory: 48 },
];

export const Default: Story = {
  args: {
    data: WEEKLY_DATA,
    series: [{ dataKey: 'cpu', name: 'CPU %' }],
    xAxisKey: 'day',
    showLegend: false,
    legendPosition: 'bottom',
  },
};

export const MultiSeries: Story = {
  args: {
    data: WEEKLY_DATA,
    series: [
      { dataKey: 'cpu', name: 'CPU %' },
      { dataKey: 'memory', name: 'Memory %' },
    ],
    xAxisKey: 'day',
    showLegend: true,
    legendPosition: 'bottom',
  },
};

export const NoGrid: Story = {
  args: {
    data: WEEKLY_DATA,
    series: [{ dataKey: 'cpu', name: 'CPU %' }],
    xAxisKey: 'day',
    showGrid: false,
  },
};
