import type { Meta, StoryObj } from '@storybook/react';
import { PasswordField } from './PasswordField';
import readme from './README.md?raw';

const meta: Meta<typeof PasswordField> = {
  title: 'Components/PasswordField',
  component: PasswordField,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: readme,
      },
    },
  },
  argTypes: {
    label: { control: 'text' },
    helperText: { control: 'text' },
    error: { control: 'text' },
    placeholder: { control: 'text' },
    revealable: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Password',
    placeholder: 'Enter password',
    disabled: false,
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 360 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PasswordField>;

// ─── Default ───────────────────────────────────────────────────────────────────

export const Default: Story = {};

// ─── With helper text ──────────────────────────────────────────────────────────

export const WithHelperText: Story = {
  args: {
    helperText: 'Must be at least 8 characters.',
  },
};

// ─── Error state ───────────────────────────────────────────────────────────────

export const Error: Story = {
  args: {
    label: 'Confirm password',
    defaultValue: 'hunter2',
    error: 'Passwords do not match.',
  },
};

// ─── Disabled ─────────────────────────────────────────────────────────────────

export const Disabled: Story = {
  args: {
    defaultValue: 'hunter2',
    disabled: true,
  },
};

// ─── Not revealable ────────────────────────────────────────────────────────────

export const NotRevealable: Story = {
  args: {
    label: 'PIN',
    placeholder: '••••',
    revealable: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Set `revealable={false}` for high-security fields where the value should never be displayable, e.g. a PIN pad.',
      },
    },
  },
};

// ─── Form example ─────────────────────────────────────────────────────────────

export const FormExample: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PasswordField label="Password" helperText="Must be at least 8 characters." />
      <PasswordField label="Confirm password" error="Passwords do not match." />
    </div>
  ),
  parameters: { controls: { disable: true } },
};
