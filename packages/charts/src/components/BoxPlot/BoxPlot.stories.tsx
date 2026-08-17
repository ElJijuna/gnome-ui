import type { Meta, StoryObj } from '@storybook/react';

import { BoxPlot } from './BoxPlot';
import readme from './README.md?raw';

const meta: Meta<typeof BoxPlot> = {
  title: 'Charts/BoxPlot',
  component: BoxPlot,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: { description: { component: readme } },
  },
  argTypes: {
    data: { control: false },
    valueFormatter: { control: false },
    className: { control: false },
    height: { control: { type: 'number', min: 150, max: 600, step: 25 } },
    showOutliers: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof BoxPlot>;

const RESPONSE_TIMES = [
  { label: 'API', values: [120, 135, 128, 150, 142, 118, 310, 133, 145, 127] },
  { label: 'DB', values: [45, 52, 48, 61, 55, 44, 58, 49, 205, 53] },
  { label: 'Cache', values: [3, 4, 3, 5, 4, 3, 4, 6, 3, 4] },
];

export const Default: Story = {
  args: {
    data: RESPONSE_TIMES,
  },
};

export const NoOutliers: Story = {
  args: {
    data: RESPONSE_TIMES,
    showOutliers: false,
  },
};

export const PrecomputedStats: Story = {
  args: {
    data: [
      { label: 'Team A', min: 9, q1: 13, median: 15.5, q3: 19, max: 22, outliers: [31] },
      { label: 'Team B', min: 7, q1: 8.5, median: 10, q3: 11.5, max: 14 },
      { label: 'Team C', min: 20, q1: 24, median: 27, q3: 31, max: 36 },
    ],
  },
};

export const CustomColorsAndFormatting: Story = {
  args: {
    data: [
      { label: 'API', values: RESPONSE_TIMES[0].values, color: 'var(--gnome-blue-3, #3584e4)' },
      { label: 'DB', values: RESPONSE_TIMES[1].values, color: 'var(--gnome-purple-3, #9141ac)' },
    ],
    valueFormatter: (v: number) => `${v}ms`,
  },
};

export const SingleGroup: Story = {
  args: {
    data: [{ label: 'Latency', values: RESPONSE_TIMES[0].values }],
    height: 260,
  },
};
