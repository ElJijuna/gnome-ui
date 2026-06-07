import type { Meta, StoryObj } from '@storybook/react';
import readme from './README.md?raw';
import { ScatterChart } from './ScatterChart';

const meta: Meta<typeof ScatterChart> = {
  title: 'Charts/ScatterChart',
  component: ScatterChart,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: { description: { component: readme } },
  },
};

export default meta;
type Story = StoryObj<typeof ScatterChart>;

const CORRELATION_DATA = [
  { x: 10, y: 30 },
  { x: 20, y: 50 },
  { x: 30, y: 40 },
  { x: 40, y: 80 },
  { x: 55, y: 65 },
  { x: 70, y: 90 },
  { x: 80, y: 70 },
  { x: 90, y: 110 },
];

export const Default: Story = {
  args: {
    series: [
      {
        name: 'Observations',
        data: CORRELATION_DATA,
      },
    ],
    xLabel: 'Input',
    yLabel: 'Output',
  },
};

export const MultiSeries: Story = {
  args: {
    series: [
      {
        name: 'Group A',
        data: [
          { x: 10, y: 30 },
          { x: 25, y: 55 },
          { x: 40, y: 45 },
          { x: 55, y: 75 },
        ],
      },
      {
        name: 'Group B',
        data: [
          { x: 15, y: 80 },
          { x: 30, y: 60 },
          { x: 45, y: 100 },
          { x: 60, y: 85 },
        ],
      },
    ],
    showLegend: true,
  },
};

export const BubbleChart: Story = {
  args: {
    series: [
      {
        name: 'Markets',
        data: [
          { x: 10, y: 30, z: 200 },
          { x: 25, y: 55, z: 800 },
          { x: 40, y: 45, z: 400 },
          { x: 55, y: 75, z: 1200 },
          { x: 70, y: 50, z: 600 },
        ],
        zKey: 'z',
      },
    ],
    bubbleRange: [40, 600],
    xLabel: 'Reach',
    yLabel: 'Engagement',
  },
};
