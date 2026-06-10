import type { Meta, StoryObj } from '@storybook/react';

import { AreaChart } from './AreaChart';
import readme from './README.md?raw';

const meta: Meta<typeof AreaChart> = {
  title: 'Charts/AreaChart',
  component: AreaChart,
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
    stacked: { control: 'boolean' },
    gradient: { control: 'boolean' },
    showLegend: { control: 'boolean' },
    legendPosition: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
      if: { arg: 'showLegend' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof AreaChart>;

const TRAFFIC_DATA = [
  { week: 'W1', downloads: 320, installs: 210 },
  { week: 'W2', downloads: 480, installs: 310 },
  { week: 'W3', downloads: 410, installs: 280 },
  { week: 'W4', downloads: 620, installs: 420 },
  { week: 'W5', downloads: 590, installs: 390 },
  { week: 'W6', downloads: 780, installs: 540 },
];

export const Default: Story = {
  args: {
    data: TRAFFIC_DATA,
    series: [{ dataKey: 'downloads', name: 'Downloads' }],
    xAxisKey: 'week',
    showLegend: false,
    legendPosition: 'bottom',
  },
};

export const MultiSeries: Story = {
  args: {
    data: TRAFFIC_DATA,
    series: [
      { dataKey: 'downloads', name: 'Downloads' },
      { dataKey: 'installs', name: 'Installs' },
    ],
    xAxisKey: 'week',
    showLegend: true,
    legendPosition: 'bottom',
  },
};

export const Stacked: Story = {
  args: {
    data: TRAFFIC_DATA,
    series: [
      { dataKey: 'downloads', name: 'Downloads' },
      { dataKey: 'installs', name: 'Installs' },
    ],
    xAxisKey: 'week',
    showLegend: true,
    stacked: true,
  },
};

export const Gradient: Story = {
  args: {
    data: TRAFFIC_DATA,
    series: [
      { dataKey: 'downloads', name: 'Downloads' },
      { dataKey: 'installs', name: 'Installs' },
    ],
    xAxisKey: 'week',
    showLegend: true,
    gradient: true,
  },
};

export const GradientStacked: Story = {
  args: {
    data: TRAFFIC_DATA,
    series: [
      { dataKey: 'downloads', name: 'Downloads' },
      { dataKey: 'installs', name: 'Installs' },
    ],
    xAxisKey: 'week',
    showLegend: true,
    gradient: true,
    stacked: true,
  },
};
