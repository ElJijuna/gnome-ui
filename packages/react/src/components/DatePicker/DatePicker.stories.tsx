import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Text } from '@/components/Text';

import { DatePicker } from './DatePicker';
import readme from './README.md?raw';

const meta: Meta<typeof DatePicker> = {
  title: 'Components/DatePicker',
  component: DatePicker,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: readme,
      },
    },
  },
  args: {
    label: 'Date',
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: 420 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

// ─── Basic ────────────────────────────────────────────────────────────────────

export const Basic: Story = {};

// ─── Preselected ──────────────────────────────────────────────────────────────

export const Preselected: Story = {
  args: { defaultValue: new Date(2026, 7, 15) },
};

// ─── Controlled ───────────────────────────────────────────────────────────────

export const Controlled: Story = {
  render: function ControlledStory(args) {
    const [date, setDate] = useState<Date | null>(new Date(2026, 7, 20));

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <DatePicker {...args} value={date} onChange={setDate} />
        <Text variant="body" color="dim">
          Selected: {date ? date.toISOString().slice(0, 10) : 'none'}
        </Text>
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};

// ─── Restricted range ─────────────────────────────────────────────────────────

export const RestrictedRange: Story = {
  args: {
    defaultValue: new Date(2026, 7, 15),
    min: new Date(2026, 7, 10),
    max: new Date(2026, 7, 24),
    label: 'Delivery date',
  },
};

// ─── Full format, Sunday start, week numbers ──────────────────────────────────

export const FullFormat: Story = {
  args: {
    defaultValue: new Date(2026, 7, 15),
    formatOptions: { dateStyle: 'full' },
    weekStartsOn: 0,
    showWeekNumbers: true,
    label: 'Appointment',
  },
};

// ─── Localized (Spanish) ──────────────────────────────────────────────────────

export const Localized: Story = {
  args: {
    defaultValue: new Date(2026, 7, 15),
    locale: 'es-ES',
    formatOptions: { dateStyle: 'long' },
    label: 'Fecha',
  },
};

// ─── Disabled ─────────────────────────────────────────────────────────────────

export const Disabled: Story = {
  args: { defaultValue: new Date(2026, 7, 15), disabled: true },
};

// ─── With time ────────────────────────────────────────────────────────────────

/**
 * `showTime` adds hour/minute columns under the calendar. Picking a day then
 * keeps the popover open — the selection is finished by Done.
 */
export const WithTime: Story = {
  args: {
    label: 'Appointment',
    showTime: true,
    defaultValue: new Date(2026, 7, 15, 9, 30),
  },
};

// ─── With time (12-hour) ──────────────────────────────────────────────────────

export const WithTwelveHourClock: Story = {
  args: {
    label: 'Appointment',
    showTime: true,
    hourCycle: 12,
    minuteStep: 15,
    defaultValue: new Date(2026, 7, 15, 14, 45),
  },
};
