import type { Meta, StoryObj } from '@storybook/react';

import { Text } from '../Text';
import readme from './README.md?raw';
import { Spinner } from './Spinner';

const meta: Meta<typeof Spinner> = {
  title: 'Components/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: readme,
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    label: { control: 'text' },
  },
  args: {
    size: 'md',
    label: 'Loading\u2026',
  },
};

export default meta;
type Story = StoryObj<typeof Spinner>;

// ─── Default ───────────────────────────────────────────────────────────────────

export const Default: Story = {};

// ─── Sizes ─────────────────────────────────────────────────────────────────────

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <Spinner size="sm" />
        <Text variant="caption" color="dim">
          sm
        </Text>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <Spinner size="md" />
        <Text variant="caption" color="dim">
          md
        </Text>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <Spinner size="lg" />
        <Text variant="caption" color="dim">
          lg
        </Text>
      </div>
    </div>
  ),
  parameters: { controls: { disable: true } },
};

// ─── Inline with text ──────────────────────────────────────────────────────────

export const InlineWithText: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Spinner size="sm" label="" />
      <Text variant="body">Saving changes…</Text>
    </div>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Use `size="sm"` and `label=""` when a visible text label already describes the action.',
      },
    },
  },
};

// ─── Full page loading ─────────────────────────────────────────────────────────

export const Centered: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        height: 160,
      }}
    >
      <Spinner size="lg" />
      <Text variant="body" color="dim">
        Loading content…
      </Text>
    </div>
  ),
  parameters: { controls: { disable: true } },
};
