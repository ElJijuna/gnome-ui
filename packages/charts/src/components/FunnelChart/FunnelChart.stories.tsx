import type { Meta, StoryObj } from '@storybook/react';

import { FunnelChart } from './FunnelChart';
import readme from './README.md?raw';

const meta: Meta<typeof FunnelChart> = {
  title: 'Charts/FunnelChart',
  component: FunnelChart,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: { description: { component: readme } },
  },
};

export default meta;
type Story = StoryObj<typeof FunnelChart>;

const PIPELINE_DATA = [
  { name: 'Visits', value: 5000 },
  { name: 'Leads', value: 2400 },
  { name: 'Prospects', value: 1398 },
  { name: 'Demos', value: 800 },
  { name: 'Customers', value: 320 },
];

export const Default: Story = {
  args: {
    data: PIPELINE_DATA,
  },
};

export const NoLabels: Story = {
  args: {
    data: PIPELINE_DATA,
    showLabels: false,
  },
};

export const CustomColors: Story = {
  args: {
    data: [
      { name: 'Awareness', value: 8000, color: '#3584e4' },
      { name: 'Interest', value: 4200, color: '#26a269' },
      { name: 'Consideration', value: 2100, color: '#e5a50a' },
      { name: 'Purchase', value: 750, color: '#c01c28' },
    ],
  },
};
