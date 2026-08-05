import type { Meta, StoryObj } from '@storybook/react';

import { SankeyChart } from './SankeyChart';
import readme from './README.md?raw';

const meta: Meta<typeof SankeyChart> = {
  title: 'Charts/SankeyChart',
  component: SankeyChart,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: { description: { component: readme } },
  },
  argTypes: {
    nodes: { control: false },
    links: { control: false },
    valueFormatter: { control: false },
    className: { control: false },
    height: { control: { type: 'number', min: 200, max: 800, step: 50 } },
    nodeWidth: { control: { type: 'number', min: 4, max: 40, step: 2 } },
    nodePadding: { control: { type: 'number', min: 4, max: 60, step: 2 } },
    showValues: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof SankeyChart>;

const FUNNEL_NODES = [
  { name: 'Visitors' },
  { name: 'Signups' },
  { name: 'Customers' },
  { name: 'Churn' },
];

const FUNNEL_LINKS = [
  { source: 'Visitors', target: 'Signups', value: 1000 },
  { source: 'Signups', target: 'Customers', value: 600 },
  { source: 'Signups', target: 'Churn', value: 400 },
];

export const Default: Story = {
  args: {
    nodes: FUNNEL_NODES,
    links: FUNNEL_LINKS,
  },
};

export const WithValues: Story = {
  args: {
    nodes: FUNNEL_NODES,
    links: FUNNEL_LINKS,
    showValues: true,
  },
};

export const AcquisitionChannels: Story = {
  args: {
    nodes: [
      { name: 'Organic', color: 'var(--gnome-green-4, #2ec27e)' },
      { name: 'Paid', color: 'var(--gnome-orange-3, #ff7800)' },
      { name: 'Referral', color: 'var(--gnome-purple-3, #9141ac)' },
      { name: 'Trial' },
      { name: 'Converted' },
      { name: 'Churned' },
    ],
    links: [
      { source: 'Organic', target: 'Trial', value: 420 },
      { source: 'Paid', target: 'Trial', value: 260 },
      { source: 'Referral', target: 'Trial', value: 140 },
      { source: 'Trial', target: 'Converted', value: 480 },
      { source: 'Trial', target: 'Churned', value: 340 },
    ],
    showValues: true,
  },
};

export const WideNodes: Story = {
  args: {
    nodes: FUNNEL_NODES,
    links: FUNNEL_LINKS,
    nodeWidth: 28,
    nodePadding: 40,
  },
};
