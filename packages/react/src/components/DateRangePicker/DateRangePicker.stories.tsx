import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { addDays, startOfMonth } from '@/components/Calendar/calendarUtils';
import type { DateRange } from '@/components/CalendarRange';
import { Text } from '@/components/Text';

import { DateRangePicker } from './DateRangePicker';
import readme from './README.md?raw';

const meta: Meta<typeof DateRangePicker> = {
  title: 'Components/DateRangePicker',
  component: DateRangePicker,
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
    placement: {
      control: { type: 'inline-radio' },
      options: ['top', 'bottom', 'left', 'right'],
    },
  },
  // The popover needs room to open downwards inside the docs iframe.
  decorators: [
    (Story) => (
      <div style={{ minHeight: 520, padding: 16 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DateRangePicker>;

const AUGUST: DateRange = { start: new Date(2026, 7, 10), end: new Date(2026, 7, 19) };

// ─── Basic ────────────────────────────────────────────────────────────────────

export const Basic: Story = {
  args: { label: 'Stay', placeholder: 'Select a date range' },
};

// ─── Preselected ──────────────────────────────────────────────────────────────

export const Preselected: Story = {
  args: { label: 'Stay', defaultValue: AUGUST, locale: 'en-US' },
};

// ─── One month ────────────────────────────────────────────────────────────────

export const SingleMonth: Story = {
  args: { label: 'Stay', defaultValue: AUGUST, visibleMonths: 1 },
};

// ─── With presets ─────────────────────────────────────────────────────────────

/** Relative shortcuts are functions, so they are computed on click, not on render. */
export const WithPresets: Story = {
  args: {
    label: 'Report period',
    presets: [
      {
        label: 'Last 7 days',
        range: () => ({ start: addDays(new Date(), -6), end: new Date() }),
      },
      {
        label: 'Last 30 days',
        range: () => ({ start: addDays(new Date(), -29), end: new Date() }),
      },
      {
        label: 'This month',
        range: () => ({ start: startOfMonth(new Date()), end: new Date() }),
      },
    ],
  },
};

// ─── Length limits ────────────────────────────────────────────────────────────

export const LengthLimits: Story = {
  args: { label: 'Booking', minRange: 2, maxRange: 14, min: new Date(2026, 7, 1) },
};

// ─── Controlled ───────────────────────────────────────────────────────────────

export const Controlled: Story = {
  render: function ControlledStory(args) {
    const [range, setRange] = useState<DateRange | null>(AUGUST);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <DateRangePicker {...args} value={range} onChange={setRange} />
        <Text variant="body" color="dim">
          {range?.start && range.end
            ? `${range.start.toLocaleDateString()} → ${range.end.toLocaleDateString()}`
            : 'No range selected'}
        </Text>
      </div>
    );
  },
  args: { label: 'Stay' },
  parameters: { controls: { disable: true } },
};

// ─── Disabled ─────────────────────────────────────────────────────────────────

export const Disabled: Story = {
  args: { label: 'Stay', defaultValue: AUGUST, disabled: true },
};
