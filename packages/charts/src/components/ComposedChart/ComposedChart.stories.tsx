import type { Meta, StoryObj } from '@storybook/react';

import { ComposedChart } from './ComposedChart';
import readme from './README.md?raw';

const meta: Meta<typeof ComposedChart> = {
  title: 'Charts/ComposedChart',
  component: ComposedChart,
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
type Story = StoryObj<typeof ComposedChart>;

const MONTHLY_DATA = [
  { month: 'Jan', revenue: 4200, expenses: 2400, profit: 1800 },
  { month: 'Feb', revenue: 3800, expenses: 2200, profit: 1600 },
  { month: 'Mar', revenue: 5100, expenses: 2600, profit: 2500 },
  { month: 'Apr', revenue: 4700, expenses: 2900, profit: 1800 },
  { month: 'May', revenue: 6300, expenses: 3100, profit: 3200 },
  { month: 'Jun', revenue: 7100, expenses: 3400, profit: 3700 },
];

export const Default: Story = {
  args: {
    data: MONTHLY_DATA,
    xAxisKey: 'month',
    showLegend: true,
    legendPosition: 'bottom',
    series: [
      { dataKey: 'revenue', type: 'bar', name: 'Revenue' },
      { dataKey: 'expenses', type: 'area', name: 'Expenses' },
      { dataKey: 'profit', type: 'line', name: 'Profit' },
    ],
  },
};

export const BarAndLine: Story = {
  args: {
    data: MONTHLY_DATA,
    xAxisKey: 'month',
    showLegend: true,
    legendPosition: 'bottom',
    series: [
      { dataKey: 'revenue', type: 'bar', name: 'Revenue' },
      { dataKey: 'profit', type: 'line', name: 'Profit' },
    ],
  },
};

export const NoGrid: Story = {
  args: {
    data: MONTHLY_DATA,
    xAxisKey: 'month',
    showGrid: false,
    showLegend: true,
    series: [
      { dataKey: 'revenue', type: 'bar', name: 'Revenue' },
      { dataKey: 'expenses', type: 'area', name: 'Expenses' },
    ],
  },
};
