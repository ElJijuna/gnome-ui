import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Text } from '@/components/Text';
import readme from './README.md?raw';
import { TimePicker, type TimeValue } from './TimePicker';

const meta: Meta<typeof TimePicker> = {
  title: 'Components/TimePicker',
  component: TimePicker,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: readme,
      },
    },
  },
  args: {
    label: 'Time',
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: 240 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TimePicker>;

// ─── Basic (24-hour) ──────────────────────────────────────────────────────────

export const Basic: Story = {};

// ─── Preselected ──────────────────────────────────────────────────────────────

export const Preselected: Story = {
  args: { defaultValue: { hours: 14, minutes: 30 } },
};

// ─── 12-hour with AM/PM ───────────────────────────────────────────────────────

export const TwelveHour: Story = {
  args: { hourCycle: 12, defaultValue: { hours: 9, minutes: 5 } },
};

// ─── Five-minute step ─────────────────────────────────────────────────────────

export const MinuteStep: Story = {
  args: { minuteStep: 5, defaultValue: { hours: 8, minutes: 0 } },
};

// ─── Controlled ───────────────────────────────────────────────────────────────

export const Controlled: Story = {
  render: function ControlledStory(args) {
    const [time, setTime] = useState<TimeValue | null>({ hours: 14, minutes: 30 });

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <TimePicker {...args} value={time} onChange={setTime} />
        <Text variant="body" color="dim">
          Selected:{' '}
          {time
            ? `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}`
            : 'none'}
        </Text>
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};

// ─── Disabled ─────────────────────────────────────────────────────────────────

export const Disabled: Story = {
  args: { defaultValue: { hours: 14, minutes: 30 }, disabled: true },
};
