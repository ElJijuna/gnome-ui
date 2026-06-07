import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '../Button';
import { TextField } from '../TextField';

import { LinkedGroup } from './LinkedGroup';
import readme from './README.md?raw';

const meta: Meta<typeof LinkedGroup> = {
  title: 'Components/LinkedGroup',
  component: LinkedGroup,
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
      <div
        style={{
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          alignItems: 'flex-start',
        }}
      >
        <Story />
      </div>
    ),
  ],
  argTypes: {
    vertical: { control: 'boolean' },
  },
  args: {
    vertical: false,
  },
};

export default meta;
type Story = StoryObj<typeof LinkedGroup>;

// ─── Default — button group ────────────────────────────────────────────────────

export const Default: Story = {
  render: (args) => (
    <LinkedGroup {...args}>
      <Button>Cut</Button>
      <Button>Copy</Button>
      <Button>Paste</Button>
    </LinkedGroup>
  ),
};

// ─── Suggested ─────────────────────────────────────────────────────────────────

export const Suggested: Story = {
  render: () => (
    <LinkedGroup>
      <Button variant="suggested">Day</Button>
      <Button variant="suggested">Week</Button>
      <Button variant="suggested">Month</Button>
    </LinkedGroup>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'All children share the same `variant`. Works with any Button variant.',
      },
    },
  },
};

// ─── Zoom controls ─────────────────────────────────────────────────────────────

export const ZoomControls: Story = {
  render: () => (
    <LinkedGroup>
      <Button aria-label="Zoom out">−</Button>
      <Button aria-label="Reset zoom">100 %</Button>
      <Button aria-label="Zoom in">+</Button>
    </LinkedGroup>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'A common use case: zoom controls where − and + are tightly coupled.',
      },
    },
  },
};

// ─── Search + button ───────────────────────────────────────────────────────────

export const SearchWithButton: Story = {
  render: () => (
    <LinkedGroup>
      <TextField label="" placeholder="Search…" aria-label="Search" />
      <Button variant="suggested">Go</Button>
    </LinkedGroup>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Mix different widget types that belong together — a text field and a submit button rendered as one unit.',
      },
    },
  },
};

// ─── Vertical ─────────────────────────────────────────────────────────────────

export const Vertical: Story = {
  render: () => (
    <LinkedGroup vertical>
      <Button>Top</Button>
      <Button>Middle</Button>
      <Button>Bottom</Button>
    </LinkedGroup>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Use `vertical` to stack children in a column. Border collapse and radius restoration apply to top/bottom edges.',
      },
    },
  },
};

// ─── Inside Toolbar ────────────────────────────────────────────────────────────

export const InsideToolbar: Story = {
  render: () => (
    <div
      style={{
        background: 'var(--gnome-headerbar-bg-color, #ebebeb)',
        borderRadius: 8,
        width: '100%',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: 6 }}>
        <Button variant="flat">←</Button>
        <Button variant="flat">→</Button>
        <LinkedGroup>
          <Button variant="flat">Bold</Button>
          <Button variant="flat">Italic</Button>
          <Button variant="flat">Underline</Button>
        </LinkedGroup>
        <div style={{ flex: 1 }} />
        <Button variant="flat">⋮</Button>
      </div>
    </div>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`LinkedGroup` inside a `Toolbar` — the connected group stands out from the surrounding flat buttons.',
      },
    },
  },
};
