import type { Meta, StoryObj } from '@storybook/react';

import { CopyField } from './CopyField';
import readme from './README.md?raw';

const meta: Meta<typeof CopyField> = {
  title: 'Components/CopyField',
  component: CopyField,
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
    value: { control: 'text' },
    helperText: { control: 'text' },
    error: { control: 'text' },
    monospace: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'API key',
    value: 'sk-live-4242424242424242',
    disabled: false,
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 380 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CopyField>;

// ─── Default ───────────────────────────────────────────────────────────────────

export const Default: Story = {};

// ─── With helper text ──────────────────────────────────────────────────────────

export const WithHelperText: Story = {
  args: {
    helperText: 'This key is only shown once — store it securely.',
  },
};

// ─── Error state ───────────────────────────────────────────────────────────────

export const Error: Story = {
  args: {
    error: 'This key has been revoked.',
  },
};

// ─── Non-monospace ──────────────────────────────────────────────────────────────

export const NonMonospace: Story = {
  args: {
    label: 'Webhook URL',
    value: 'https://example.com/hooks/abc123',
    monospace: false,
  },
};

// ─── Disabled ─────────────────────────────────────────────────────────────────

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

// ─── Multiple fields ────────────────────────────────────────────────────────────

export const MultipleFields: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <CopyField label="Public key" value="pk_live_a1b2c3d4e5f6" />
      <CopyField
        label="Secret key"
        value="sk_live_z9y8x7w6v5u4"
        helperText="Never share this key."
      />
      <CopyField label="Account ID" value="acct_1PABC2XYZ" monospace={false} />
    </div>
  ),
  parameters: { controls: { disable: true } },
};
