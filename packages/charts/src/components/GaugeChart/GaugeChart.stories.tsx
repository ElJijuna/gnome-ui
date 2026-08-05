import type { Meta, StoryObj } from '@storybook/react';

import { GaugeChart } from './GaugeChart';
import readme from './README.md?raw';

const meta: Meta<typeof GaugeChart> = {
  title: 'Charts/GaugeChart',
  component: GaugeChart,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: { description: { component: readme } },
  },
  argTypes: {
    thresholds: { control: false },
    valueFormatter: { control: false },
    className: { control: false },
    value: { control: { type: 'number' } },
    min: { control: { type: 'number' } },
    max: { control: { type: 'number' } },
    height: { control: { type: 'number', min: 120, max: 500, step: 20 } },
    showValue: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof GaugeChart>;

export const Default: Story = {
  args: {
    value: 72,
    label: 'CPU',
  },
};

export const CustomRange: Story = {
  args: {
    value: 4200,
    min: 0,
    max: 5000,
    label: 'Revenue',
    valueFormatter: (v: number) => `$${v.toLocaleString()}`,
  },
};

export const StatusThresholds: StoryObj<typeof GaugeChart> = {
  args: {
    value: 90,
    label: 'Disk usage',
    thresholds: [
      { value: 0, color: 'var(--gnome-green-4, #2ec27e)' },
      { value: 60, color: 'var(--gnome-yellow-5, #e5a50a)' },
      { value: 85, color: 'var(--gnome-red-3, #e01b24)' },
    ],
  },
};

export const NoValueLabel: Story = {
  args: {
    value: 45,
    showValue: false,
  },
};

export const Gallery: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      <div style={{ width: 220 }}>
        <GaugeChart
          value={30}
          label="CPU"
          thresholds={[
            { value: 0, color: 'var(--gnome-green-4, #2ec27e)' },
            { value: 60, color: 'var(--gnome-yellow-5, #e5a50a)' },
            { value: 85, color: 'var(--gnome-red-3, #e01b24)' },
          ]}
        />
      </div>
      <div style={{ width: 220 }}>
        <GaugeChart
          value={72}
          label="Memory"
          thresholds={[
            { value: 0, color: 'var(--gnome-green-4, #2ec27e)' },
            { value: 60, color: 'var(--gnome-yellow-5, #e5a50a)' },
            { value: 85, color: 'var(--gnome-red-3, #e01b24)' },
          ]}
        />
      </div>
      <div style={{ width: 220 }}>
        <GaugeChart
          value={93}
          label="Disk"
          thresholds={[
            { value: 0, color: 'var(--gnome-green-4, #2ec27e)' },
            { value: 60, color: 'var(--gnome-yellow-5, #e5a50a)' },
            { value: 85, color: 'var(--gnome-red-3, #e01b24)' },
          ]}
        />
      </div>
    </div>
  ),
};
