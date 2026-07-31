import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '../Button';

import { Divider } from './Divider';
import readme from './README.md?raw';

const meta: Meta<typeof Divider> = {
  title: 'Components/Divider',
  component: Divider,
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
      <div style={{ maxWidth: 320 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Divider>;

// ─── With label ───────────────────────────────────────────────────────────────

export const WithLabel: Story = {
  render: () => <Divider>OR</Divider>,
};

// ─── Longer label ─────────────────────────────────────────────────────────────

export const LongerLabel: Story = {
  render: () => <Divider>Continue with</Divider>,
};

// ─── Without a label ──────────────────────────────────────────────────────────

export const NoLabel: Story = {
  render: () => <Divider />,
};

// ─── Login form use case ──────────────────────────────────────────────────────

export const LoginForm: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Button variant="suggested">Sign in with email</Button>
      <Divider>OR</Divider>
      <Button>Continue with Google</Button>
      <Button>Continue with GitHub</Button>
    </div>
  ),
  parameters: { controls: { disable: true } },
};
