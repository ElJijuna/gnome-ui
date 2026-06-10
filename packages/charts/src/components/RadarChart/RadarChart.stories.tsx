import type { Meta, StoryObj } from '@storybook/react';

import { RadarChart } from './RadarChart';
import readme from './README.md?raw';

const meta: Meta<typeof RadarChart> = {
  title: 'Charts/RadarChart',
  component: RadarChart,
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
    filled: { control: 'boolean' },
    showLegend: { control: 'boolean' },
    legendPosition: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
      if: { arg: 'showLegend' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof RadarChart>;

const SKILLS_DATA = [
  { skill: 'TypeScript', alice: 90, bob: 70 },
  { skill: 'React', alice: 85, bob: 80 },
  { skill: 'CSS', alice: 60, bob: 75 },
  { skill: 'Testing', alice: 75, bob: 55 },
  { skill: 'DevOps', alice: 50, bob: 65 },
  { skill: 'Accessibility', alice: 80, bob: 45 },
];

export const Default: Story = {
  args: {
    data: SKILLS_DATA,
    series: [{ dataKey: 'alice', name: 'Alice' }],
    angleKey: 'skill',
    showLegend: false,
    legendPosition: 'bottom',
  },
};

export const MultiSeries: Story = {
  args: {
    data: SKILLS_DATA,
    series: [
      { dataKey: 'alice', name: 'Alice' },
      { dataKey: 'bob', name: 'Bob' },
    ],
    angleKey: 'skill',
    showLegend: true,
    legendPosition: 'bottom',
  },
};

export const Filled: Story = {
  args: {
    data: SKILLS_DATA,
    series: [
      { dataKey: 'alice', name: 'Alice' },
      { dataKey: 'bob', name: 'Bob' },
    ],
    angleKey: 'skill',
    filled: true,
    showLegend: true,
    legendPosition: 'bottom',
  },
};

export const SingleFilled: Story = {
  args: {
    data: SKILLS_DATA,
    series: [{ dataKey: 'alice', name: 'Alice' }],
    angleKey: 'skill',
    filled: true,
  },
};
