import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Text } from '@/components/Text';
import { RangeSlider } from './RangeSlider';
import readme from './README.md?raw';

const meta: Meta<typeof RangeSlider> = {
  title: 'Components/RangeSlider',
  component: RangeSlider,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: readme,
      },
    },
  },
  render: function Render(args) {
    const [value, setValue] = useState<[number, number]>(args.value ?? [20, 80]);

    return <RangeSlider {...args} value={value} onChange={setValue} />;
  },
  args: { min: 0, max: 100, step: 1, value: [20, 80] },
  argTypes: {
    min: { control: { type: 'number' } },
    max: { control: { type: 'number' } },
    step: { control: { type: 'number' } },
    minDistance: { control: { type: 'number' } },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof RangeSlider>;

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: { minLabel: 'Minimum value', maxLabel: 'Maximum value' },
};

// ─── Price filter ───────────────────────────────────────────────────────────────

export const PriceFilter: Story = {
  render: function PriceStory() {
    const [range, setRange] = useState<[number, number]>([25, 150]);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 340 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Text variant="body">Price</Text>
          <Text variant="body" color="dim" style={{ fontVariantNumeric: 'tabular-nums' }}>
            ${range[0]} – ${range[1]}
          </Text>
        </div>
        <RangeSlider
          value={range}
          onChange={setRange}
          min={0}
          max={200}
          step={5}
          minLabel="Minimum price"
          maxLabel="Maximum price"
        />
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};

// ─── Minimum distance ───────────────────────────────────────────────────────────

export const MinDistance: Story = {
  args: {
    minDistance: 10,
    minLabel: 'Minimum value',
    maxLabel: 'Maximum value',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Set `minDistance` to keep the thumbs from meeting or crossing — here they must stay at least 10 units apart.',
      },
    },
  },
};

// ─── With marks ───────────────────────────────────────────────────────────────

export const WithMarks: Story = {
  render: function MarksStory() {
    const [range, setRange] = useState<[number, number]>([1, 3]);

    return (
      <div style={{ maxWidth: 340, paddingBottom: 8 }}>
        <Text variant="body" style={{ marginBottom: 8, display: 'block' }}>
          Quality range
        </Text>
        <RangeSlider
          value={range}
          onChange={setRange}
          min={0}
          max={4}
          step={1}
          minLabel="Minimum quality"
          maxLabel="Maximum quality"
          marks={[
            { value: 0, label: 'Low' },
            { value: 1, label: 'SD' },
            { value: 2, label: 'HD' },
            { value: 3, label: 'FHD' },
            { value: 4, label: '4K' },
          ]}
        />
      </div>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: 'Tick marks with labels — useful for discrete named values.' },
    },
  },
};

// ─── Disabled ─────────────────────────────────────────────────────────────────

export const Disabled: Story = {
  args: {
    value: [30, 70],
    disabled: true,
    minLabel: 'Minimum value',
    maxLabel: 'Maximum value',
  },
};
