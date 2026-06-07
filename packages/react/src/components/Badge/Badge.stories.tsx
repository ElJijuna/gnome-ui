import type { Meta, StoryObj } from '@storybook/react';

import { Avatar } from '../Avatar';
import { Button } from '../Button';
import { Text } from '../Text';

import { Badge } from './Badge';
import readme from './README.md?raw';

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: readme,
      },
    },
  },
  argTypes: {
    variant: { control: 'select', options: ['accent', 'success', 'warning', 'error', 'neutral'] },
    dot: { control: 'boolean' },
    children: { control: 'text' },
  },
  args: {
    variant: 'accent',
    dot: false,
    children: '3',
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

// ─── Default ───────────────────────────────────────────────────────────────────

export const Default: Story = {};

// ─── Variants ─────────────────────────────────────────────────────────────────

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {(['accent', 'success', 'warning', 'error', 'neutral'] as const).map((v) => (
        <div
          key={v}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
        >
          <Badge variant={v}>3</Badge>
          <Text variant="caption" color="dim">
            {v}
          </Text>
        </div>
      ))}
    </div>
  ),
  parameters: { controls: { disable: true } },
};

// ─── Dot variants ─────────────────────────────────────────────────────────────

export const Dots: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {(['accent', 'success', 'warning', 'error', 'neutral'] as const).map((v) => (
        <div
          key={v}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
        >
          <Badge variant={v} dot />
          <Text variant="caption" color="dim">
            {v}
          </Text>
        </div>
      ))}
    </div>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Use `dot` for binary status indicators (online, unread) with no count.',
      },
    },
  },
};

// ─── Anchored on Avatar ────────────────────────────────────────────────────────

export const AnchoredOnAvatar: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <Badge variant="error" anchor={<Avatar name="Jane Doe" size="lg" />}>
          5
        </Badge>
        <Text variant="caption" color="dim">
          unread
        </Text>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <Badge variant="success" dot anchor={<Avatar name="Bob Smith" size="lg" />} />
        <Text variant="caption" color="dim">
          online
        </Text>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <Badge variant="neutral" dot anchor={<Avatar name="Carol White" size="lg" />} />
        <Text variant="caption" color="dim">
          offline
        </Text>
      </div>
    </div>
  ),
  parameters: { controls: { disable: true } },
};

// ─── Anchored on Button ────────────────────────────────────────────────────────

export const AnchoredOnButton: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <Badge variant="error" anchor={<Button variant="flat">Notifications</Button>}>
        12
      </Badge>
      <Badge variant="accent" anchor={<Button variant="default">Inbox</Button>}>
        99+
      </Badge>
    </div>
  ),
  parameters: { controls: { disable: true } },
};

// ─── Overflow count ────────────────────────────────────────────────────────────

export const OverflowCount: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {[1, 9, 42, 100, 999].map((n) => (
        <Badge key={n} variant="accent">
          {n > 99 ? '99+' : n}
        </Badge>
      ))}
    </div>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: 'Cap the display at "99+" for counts above 99.' },
    },
  },
};
