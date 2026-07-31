import type { Meta, StoryObj } from '@storybook/react';

import { Text } from '../Text';

import { LevelBar } from './LevelBar';
import readme from './README.md?raw';

const meta: Meta<typeof LevelBar> = {
  title: 'Components/LevelBar',
  component: LevelBar,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: readme,
      },
    },
  },
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 1, step: 0.01 } },
    variant: { control: 'select', options: ['accent', 'success', 'warning', 'error'] },
    lowVariant: { control: 'select', options: ['accent', 'success', 'warning', 'error'] },
    highVariant: { control: 'select', options: ['accent', 'success', 'warning', 'error'] },
  },
  args: {
    value: 0.6,
    'aria-label': 'Level',
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 400 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof LevelBar>;

// ─── Basic ────────────────────────────────────────────────────────────────────

export const Basic: Story = {
  args: { value: 0.6 },
};

// ─── Low/high offset zones ────────────────────────────────────────────────────

export const OffsetZones: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Text variant="caption">Low zone (battery at 15 %)</Text>
        <LevelBar value={0.15} low={0.25} aria-label="Battery level" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Text variant="caption">Normal zone (battery at 60 %)</Text>
        <LevelBar value={0.6} low={0.25} high={0.9} aria-label="Battery level" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Text variant="caption">High zone (disk at 94 %)</Text>
        <LevelBar value={0.94} high={0.9} aria-label="Disk usage" />
      </div>
    </div>
  ),
  parameters: { controls: { disable: true } },
};

// ─── Custom range ─────────────────────────────────────────────────────────────

export const CustomRange: Story = {
  args: {
    value: 4200,
    min: 0,
    max: 8000,
    high: 7000,
    'aria-label': 'Memory usage (MB)',
  },
};

// ─── Discrete mode ─────────────────────────────────────────────────────────────

export const Discrete: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Text variant="caption">Signal strength</Text>
        <LevelBar value={0.6} discrete numBlocks={5} aria-label="Wi-Fi signal strength" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Text variant="caption">Low battery</Text>
        <LevelBar value={0.2} low={0.25} discrete numBlocks={10} aria-label="Battery level" />
      </div>
    </div>
  ),
  parameters: { controls: { disable: true } },
};

// ─── Multiple bars ────────────────────────────────────────────────────────────

export const DiskUsage: Story = {
  render: () => {
    const volumes = [
      { label: 'Music', value: 0.82, high: 0.9 },
      { label: 'Photos', value: 0.45, high: 0.9 },
      { label: 'Videos', value: 0.94, high: 0.9 },
      { label: 'Documents', value: 0.13, high: 0.9 },
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {volumes.map(({ label, value, high }) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text variant="caption">{label}</Text>
              <Text variant="caption" color="dim">
                {Math.round(value * 100)} %
              </Text>
            </div>
            <LevelBar value={value} high={high} aria-label={`${label} disk usage`} />
          </div>
        ))}
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};
