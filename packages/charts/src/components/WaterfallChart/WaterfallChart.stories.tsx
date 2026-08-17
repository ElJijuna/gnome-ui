import type { Meta, StoryObj } from '@storybook/react';

import { WaterfallChart } from './WaterfallChart';
import readme from './README.md?raw';

const meta: Meta<typeof WaterfallChart> = {
  title: 'Charts/WaterfallChart',
  component: WaterfallChart,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: { description: { component: readme } },
  },
  argTypes: {
    data: { control: false },
    valueFormatter: { control: false },
    className: { control: false },
    height: { control: { type: 'number', min: 100, max: 800, step: 50 } },
    showGrid: { control: 'boolean' },
    showValues: { control: 'boolean' },
    increaseColor: { control: 'color' },
    decreaseColor: { control: 'color' },
    totalColor: { control: 'color' },
  },
};

export default meta;
type Story = StoryObj<typeof WaterfallChart>;

const REVENUE_BRIDGE = [
  { label: 'Starting revenue', value: 42000, isTotal: true },
  { label: 'New sales', value: 12000 },
  { label: 'Upsells', value: 4000 },
  { label: 'Churn', value: -6000 },
  { label: 'Refunds', value: -1500 },
  { label: 'Ending revenue', value: 50500, isTotal: true },
];

export const Default: Story = {
  args: {
    data: REVENUE_BRIDGE,
    showValues: true,
  },
};

export const NoGrid: Story = {
  args: {
    data: REVENUE_BRIDGE,
    showGrid: false,
    showValues: true,
  },
};

export const CustomColorsAndFormatting: Story = {
  args: {
    data: REVENUE_BRIDGE,
    increaseColor: 'var(--gnome-blue-3, #3584e4)',
    decreaseColor: 'var(--gnome-orange-3, #ff7800)',
    totalColor: 'var(--gnome-purple-3, #9141ac)',
    showValues: true,
    valueFormatter: (v: number) => `$${v.toLocaleString()}`,
  },
};

export const BudgetBreakdown: Story = {
  args: {
    data: [
      { label: 'Budget', value: 100000, isTotal: true },
      { label: 'Engineering', value: -45000 },
      { label: 'Marketing', value: -22000 },
      { label: 'Operations', value: -18000 },
      { label: 'Remaining', value: 15000, isTotal: true },
    ],
    showValues: true,
  },
};
