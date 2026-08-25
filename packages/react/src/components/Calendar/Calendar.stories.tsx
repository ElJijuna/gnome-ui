import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Text } from '@/components/Text';

import { Calendar } from './Calendar';
import readme from './README.md?raw';

const meta: Meta<typeof Calendar> = {
  title: 'Components/Calendar',
  component: Calendar,
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
  },
};

export default meta;
type Story = StoryObj<typeof Calendar>;

// ─── Basic (uncontrolled) ─────────────────────────────────────────────────────

export const Basic: Story = {};

// ─── Preselected ──────────────────────────────────────────────────────────────

export const Preselected: Story = {
  args: {
    defaultValue: new Date(2026, 7, 15),
    defaultMonth: new Date(2026, 7, 1),
  },
};

// ─── Controlled ───────────────────────────────────────────────────────────────

export const Controlled: Story = {
  render: function ControlledStory(args) {
    const [date, setDate] = useState<Date | null>(new Date(2026, 7, 20));

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 320 }}>
        <Calendar {...args} value={date} onChange={setDate} />
        <Text variant="body" color="dim">
          Selected: {date ? date.toLocaleDateString() : 'none'}
        </Text>
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};

// ─── Restricted range ─────────────────────────────────────────────────────────

export const RestrictedRange: Story = {
  args: {
    defaultMonth: new Date(2026, 7, 1),
    min: new Date(2026, 7, 10),
    max: new Date(2026, 7, 24),
  },
};

// ─── Week numbers, Sunday start ───────────────────────────────────────────────

export const WithWeekNumbers: Story = {
  args: {
    defaultMonth: new Date(2026, 7, 1),
    showWeekNumbers: true,
    weekStartsOn: 0,
  },
};

// ─── No heading (embedded) ────────────────────────────────────────────────────

export const NoHeading: Story = {
  args: {
    defaultMonth: new Date(2026, 7, 1),
    showHeading: false,
  },
};

// ─── Localized (Spanish) ──────────────────────────────────────────────────────

export const Localized: Story = {
  args: {
    defaultMonth: new Date(2026, 7, 1),
    locale: 'es-ES',
    weekStartsOn: 1,
  },
};
