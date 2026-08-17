import type { Meta, StoryObj } from '@storybook/react';

import { BulletChart } from './BulletChart';
import readme from './README.md?raw';

const meta: Meta<typeof BulletChart> = {
  title: 'Charts/BulletChart',
  component: BulletChart,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: { description: { component: readme } },
  },
  argTypes: {
    ranges: { control: false },
    valueFormatter: { control: false },
    className: { control: false },
    value: { control: { type: 'number' } },
    target: { control: { type: 'number' } },
    min: { control: { type: 'number' } },
    max: { control: { type: 'number' } },
    height: { control: { type: 'number', min: 12, max: 64, step: 4 } },
    showValue: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof BulletChart>;

export const Default: Story = {
  args: {
    value: 72,
    target: 90,
    label: 'Revenue',
  },
};

export const WithRanges: Story = {
  args: {
    value: 72,
    target: 90,
    label: 'CPU',
    ranges: [{ value: 50 }, { value: 80 }, { value: 100 }],
  },
};

export const StatusRanges: Story = {
  args: {
    value: 82,
    target: 95,
    label: 'SLA compliance',
    ranges: [
      { value: 70, color: 'var(--gnome-red-1, #f66151)' },
      { value: 90, color: 'var(--gnome-yellow-1, #f9e2af)' },
      { value: 100, color: 'var(--gnome-green-1, #8ff0a4)' },
    ],
  },
};

export const CustomRangeAndFormatting: Story = {
  args: {
    value: 4200,
    target: 5000,
    min: 0,
    max: 6000,
    label: 'Revenue',
    valueFormatter: (v: number) => `$${v.toLocaleString()}`,
  },
};

export const NoTarget: Story = {
  args: {
    value: 45,
    label: 'Disk usage',
  },
};

export const Dashboard: StoryObj = {
  name: 'Dashboard rows',
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 360 }}>
      <BulletChart
        value={72}
        target={90}
        label="Revenue"
        ranges={[{ value: 50 }, { value: 80 }, { value: 100 }]}
      />
      <BulletChart
        value={58}
        target={75}
        label="Signups"
        ranges={[{ value: 40 }, { value: 70 }, { value: 100 }]}
      />
      <BulletChart
        value={93}
        target={85}
        label="Uptime"
        ranges={[{ value: 70 }, { value: 90 }, { value: 100 }]}
      />
    </div>
  ),
};
