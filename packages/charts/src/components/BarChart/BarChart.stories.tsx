import type { Meta, StoryObj } from '@storybook/react';

import { BarChart } from './BarChart';
import readme from './README.md?raw';

const meta: Meta<typeof BarChart> = {
  title: 'Charts/BarChart',
  component: BarChart,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: { description: { component: readme } },
  },
};

export default meta;
type Story = StoryObj<typeof BarChart>;

const MONTHLY_DATA = [
  { month: 'Jan', users: 420, sessions: 680 },
  { month: 'Feb', users: 380, sessions: 590 },
  { month: 'Mar', users: 510, sessions: 820 },
  { month: 'Apr', users: 470, sessions: 760 },
  { month: 'May', users: 630, sessions: 980 },
  { month: 'Jun', users: 710, sessions: 1100 },
];

export const Default: Story = {
  args: {
    data: MONTHLY_DATA,
    series: [{ dataKey: 'users', name: 'Users' }],
    xAxisKey: 'month',
  },
};

export const MultiSeries: Story = {
  args: {
    data: MONTHLY_DATA,
    series: [
      { dataKey: 'users', name: 'Users' },
      { dataKey: 'sessions', name: 'Sessions' },
    ],
    xAxisKey: 'month',
    showLegend: true,
  },
};

export const NoGrid: Story = {
  args: {
    data: MONTHLY_DATA,
    series: [{ dataKey: 'users', name: 'Users' }],
    xAxisKey: 'month',
    showGrid: false,
  },
};
