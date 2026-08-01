import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Text } from '../Text';

import { OtpInput } from './OtpInput';
import readme from './README.md?raw';

const meta: Meta<typeof OtpInput> = {
  title: 'Components/OtpInput',
  component: OtpInput,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: readme,
      },
    },
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value ?? '');

    return <OtpInput {...args} value={value} onChange={setValue} />;
  },
  argTypes: {
    length: { control: { type: 'number' } },
    masked: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: { length: 6, value: '' },
};

export default meta;
type Story = StoryObj<typeof OtpInput>;

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: { label: 'Verification code' },
};

// ─── With completion callback ───────────────────────────────────────────────────

export const WithCompletion: Story = {
  render: function CompletionStory() {
    const [value, setValue] = useState('');
    const [verified, setVerified] = useState(false);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <OtpInput
          label="Verification code"
          helperText="We sent a 6-digit code to your email."
          value={value}
          onChange={(v) => {
            setValue(v);
            setVerified(false);
          }}
          onComplete={() => setVerified(true)}
        />
        {verified && (
          <Text variant="body" color="success">
            Code complete — verifying…
          </Text>
        )}
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};

// ─── Masked ───────────────────────────────────────────────────────────────────

export const Masked: Story = {
  args: { label: 'PIN', length: 4, masked: true },
};

// ─── Error state ───────────────────────────────────────────────────────────────

export const Error: Story = {
  args: {
    label: 'Verification code',
    value: '123456',
    error: 'That code is incorrect. Try again.',
  },
};

// ─── Disabled ─────────────────────────────────────────────────────────────────

export const Disabled: Story = {
  args: { label: 'Verification code', value: '123', disabled: true },
};
