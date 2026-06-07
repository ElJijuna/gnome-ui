import type { Meta, StoryObj } from '@storybook/react';
import readme from './README.md?raw';
import { StatusIndicator } from './StatusIndicator';

const meta: Meta<typeof StatusIndicator> = {
  title: 'Layout/StatusIndicator',
  component: StatusIndicator,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: readme,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof StatusIndicator>;

export const Online: Story = {
  args: { status: 'online', label: 'Database' },
};

export const Warning: Story = {
  args: { status: 'warning', label: 'API Gateway', description: 'High latency detected' },
};

export const Error: Story = {
  args: { status: 'error', label: 'Payment Service', description: 'Connection refused' },
};

export const Offline: Story = {
  args: { status: 'offline', label: 'Backup Service' },
};

export const Loading: Story = {
  args: { status: 'loading', label: 'Connecting…' },
  parameters: {
    docs: {
      description: {
        story: 'The dot pulses. Animation is disabled when `prefers-reduced-motion` is set.',
      },
    },
  },
};

export const SmallSize: Story = {
  args: { status: 'online', label: 'Database', size: 'sm' },
  parameters: {
    docs: { description: { story: '`size="sm"` for dense lists or compact panels.' } },
  },
};

export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <StatusIndicator status="online" label="Database" description="Connected — 3ms avg latency" />
      <StatusIndicator status="warning" label="API Gateway" description="High latency detected" />
      <StatusIndicator status="error" label="Payment Service" description="Connection refused" />
      <StatusIndicator status="offline" label="Backup Service" />
      <StatusIndicator status="loading" label="Cache" description="Reconnecting…" />
    </div>
  ),
  parameters: {
    docs: { description: { story: 'All five statuses in a realistic service list.' } },
  },
};
