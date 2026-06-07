import type { Meta, StoryObj } from '@storybook/react';

import { BoxedList } from '../BoxedList';
import { EntryRow } from '../EntryRow';

import { PasswordEntryRow } from './PasswordEntryRow';
import readme from './README.md?raw';

const meta: Meta<typeof PasswordEntryRow> = {
  title: 'Components/PasswordEntryRow',
  component: PasswordEntryRow,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: readme,
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    title: { control: 'text' },
    disabled: { control: 'boolean' },
  },
  args: {
    title: 'Password',
    defaultValue: '',
  },
};

export default meta;
type Story = StoryObj<typeof PasswordEntryRow>;

// ─── Default ───────────────────────────────────────────────────────────────────

export const Default: Story = {};

// ─── In a BoxedList ────────────────────────────────────────────────────────────

export const InBoxedList: Story = {
  render: () => (
    <BoxedList>
      <EntryRow title="Username" defaultValue="" />
      <PasswordEntryRow title="Password" defaultValue="" />
      <PasswordEntryRow title="Confirm Password" defaultValue="" />
    </BoxedList>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Typical sign-up form combining `EntryRow` and `PasswordEntryRow` inside a `BoxedList`.',
      },
    },
  },
};

// ─── Pre-filled ────────────────────────────────────────────────────────────────

export const PreFilled: Story = {
  render: () => (
    <BoxedList>
      <PasswordEntryRow title="Current Password" defaultValue="hunter2" />
      <PasswordEntryRow title="New Password" defaultValue="" />
    </BoxedList>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Click the eye button to reveal the masked password.',
      },
    },
  },
};

// ─── Disabled ─────────────────────────────────────────────────────────────────

export const Disabled: Story = {
  render: () => (
    <BoxedList>
      <PasswordEntryRow title="Password" defaultValue="hunter2" disabled />
    </BoxedList>
  ),
  parameters: { controls: { disable: true } },
};
