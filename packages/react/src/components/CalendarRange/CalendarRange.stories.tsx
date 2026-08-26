import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Text } from '@/components/Text';

import { CalendarRange } from './CalendarRange';
import readme from './README.md?raw';
import type { DateRange } from './rangeUtils';

const meta: Meta<typeof CalendarRange> = {
  title: 'Components/CalendarRange',
  component: CalendarRange,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: readme,
      },
    },
  },
  argTypes: {
    weekStartsOn: {
      control: { type: 'inline-radio' },
      options: [0, 1],
    },
    visibleMonths: {
      control: { type: 'inline-radio' },
      options: [1, 2, 3],
    },
    defaultView: {
      control: { type: 'inline-radio' },
      options: ['days', 'months', 'years'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof CalendarRange>;

const AUGUST = new Date(2026, 7, 1);

// ─── Basic (uncontrolled) ─────────────────────────────────────────────────────

export const Basic: Story = {
  args: { defaultMonth: AUGUST },
};

// ─── Preselected ──────────────────────────────────────────────────────────────

export const Preselected: Story = {
  args: {
    defaultMonth: AUGUST,
    defaultValue: { start: new Date(2026, 7, 10), end: new Date(2026, 7, 19) },
  },
};

// ─── Two months side by side ──────────────────────────────────────────────────

/** The usual shape for a range picker: pick across months without navigating. */
export const TwoMonths: Story = {
  args: {
    defaultMonth: AUGUST,
    visibleMonths: 2,
    defaultValue: { start: new Date(2026, 7, 27), end: new Date(2026, 8, 8) },
  },
};

// ─── Three months ─────────────────────────────────────────────────────────────

export const ThreeMonths: Story = {
  args: { defaultMonth: AUGUST, visibleMonths: 3 },
};

// ─── Controlled ───────────────────────────────────────────────────────────────

export const Controlled: Story = {
  render: function ControlledStory(args) {
    const [range, setRange] = useState<DateRange>({
      start: new Date(2026, 7, 4),
      end: new Date(2026, 7, 9),
    });

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 640 }}>
        <CalendarRange {...args} value={range} onChange={setRange} />
        <Text variant="body" color="dim">
          {range.start && range.end
            ? `${range.start.toLocaleDateString()} → ${range.end.toLocaleDateString()}`
            : 'No range selected'}
        </Text>
      </div>
    );
  },
  args: { defaultMonth: AUGUST, visibleMonths: 2 },
  parameters: { controls: { disable: true } },
};

// ─── Length limits ────────────────────────────────────────────────────────────

/** At most a fortnight, at least two days — invalid days grey out while drawing. */
export const LengthLimits: Story = {
  args: { defaultMonth: AUGUST, minRange: 2, maxRange: 14 },
};

// ─── Restricted range ─────────────────────────────────────────────────────────

export const RestrictedRange: Story = {
  args: {
    defaultMonth: AUGUST,
    min: new Date(2026, 7, 10),
    max: new Date(2026, 7, 24),
  },
};

// ─── Week numbers, Sunday start ───────────────────────────────────────────────

export const WithWeekNumbers: Story = {
  args: { defaultMonth: AUGUST, showWeekNumbers: true, weekStartsOn: 0 },
};

// ─── Localized (Spanish) ──────────────────────────────────────────────────────

export const Localized: Story = {
  args: { defaultMonth: AUGUST, locale: 'es-ES', visibleMonths: 2 },
};
