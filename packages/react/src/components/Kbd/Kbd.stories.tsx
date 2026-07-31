import type { Meta, StoryObj } from '@storybook/react';

import readme from './README.md?raw';
import { Kbd } from './Kbd';

const meta: Meta<typeof Kbd> = {
  title: 'Components/Kbd',
  component: Kbd,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: readme,
      },
    },
  },
  argTypes: {
    children: { control: 'text' },
    symbols: { control: 'boolean' },
  },
  args: {
    children: 'Enter',
    symbols: true,
  },
};

export default meta;
type Story = StoryObj<typeof Kbd>;

// ─── Default ───────────────────────────────────────────────────────────────────

export const Default: Story = {};

// ─── Common keys ────────────────────────────────────────────────────────────────

export const CommonKeys: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Kbd>Enter</Kbd>
      <Kbd>Esc</Kbd>
      <Kbd>Tab</Kbd>
      <Kbd>Shift</Kbd>
      <Kbd>Ctrl</Kbd>
      <Kbd>Delete</Kbd>
      <Kbd>Space</Kbd>
      <Kbd>A</Kbd>
      <Kbd>F5</Kbd>
    </div>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'A range of common keys showing symbol normalisation. Unknown keys (e.g. "F5") render as-is.',
      },
    },
  },
};

// ─── Raw text (no symbols) ──────────────────────────────────────────────────────

export const RawText: Story = {
  args: { children: 'Enter', symbols: false },
  parameters: {
    docs: {
      description: {
        story: '`symbols={false}` shows the raw key name instead of its Unicode glyph.',
      },
    },
  },
};

// ─── Inline in prose ────────────────────────────────────────────────────────────

export const InlineInProse: Story = {
  render: () => (
    <p style={{ maxWidth: 420, lineHeight: 1.6 }}>
      Press <Kbd>Enter</Kbd> to confirm, or <Kbd>Esc</Kbd> to cancel. Hold <Kbd>Shift</Kbd> while
      dragging to select multiple files.
    </p>
  ),
  parameters: { controls: { disable: true } },
};
