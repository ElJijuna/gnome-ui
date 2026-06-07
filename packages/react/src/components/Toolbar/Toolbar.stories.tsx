import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '../Button';
import readme from './README.md?raw';
import { Spacer } from './Spacer';
import { Toolbar } from './Toolbar';

const meta: Meta<typeof Toolbar> = {
  title: 'Components/Toolbar',
  component: Toolbar,
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
          maxWidth: 600,
          background: 'var(--gnome-headerbar-bg-color, #ebebeb)',
          borderRadius: 8,
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Toolbar>;

// ─── Default ───────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <Toolbar>
      <Button variant="flat">Back</Button>
      <Spacer />
      <Button variant="flat">Edit</Button>
      <Button variant="flat">Done</Button>
    </Toolbar>
  ),
  parameters: { controls: { disable: true } },
};

// ─── Leading and trailing groups ───────────────────────────────────────────────

export const LeadingTrailing: Story = {
  render: () => (
    <Toolbar>
      <Button variant="flat">☰</Button>
      <Button variant="flat">←</Button>
      <Spacer />
      <Button variant="flat">🔍</Button>
      <Button variant="flat">⋮</Button>
    </Toolbar>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`<Spacer />` between leading and trailing groups pushes the trailing buttons to the far end.',
      },
    },
  },
};

// ─── With raised buttons ───────────────────────────────────────────────────────

export const WithRaisedButtons: Story = {
  render: () => (
    <Toolbar>
      <Button variant="flat">←</Button>
      <Button variant="flat">→</Button>
      <Spacer />
      <Button variant="raised">Open</Button>
      <Button variant="suggested">Save</Button>
    </Toolbar>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Mix `flat` for navigation/utility buttons and `raised` or `suggested` for primary actions.',
      },
    },
  },
};

// ─── Spacer standalone ─────────────────────────────────────────────────────────

export const SpacerExample: Story = {
  render: () => (
    <>
      <Toolbar>
        <Button variant="flat">New</Button>
        <Button variant="flat">Open</Button>
        <Spacer />
        <Button variant="flat">Undo</Button>
        <Button variant="flat">Redo</Button>
        <Spacer />
        <Button variant="flat">Share</Button>
      </Toolbar>
    </>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Multiple `<Spacer />` elements share the available space equally, centering the middle group.',
      },
    },
  },
};

// ─── Action bar (bottom) ────────────────────────────────────────────────────────

export const ActionBar: Story = {
  render: () => (
    <div
      style={{
        background: 'var(--gnome-window-bg-color, #fafafa)',
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid var(--gnome-light-3, #deddda)',
      }}
    >
      <div
        style={{
          padding: '24px',
          height: 120,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--gnome-window-fg-color)',
        }}
      >
        Content area
      </div>
      <div style={{ borderTop: '1px solid var(--gnome-light-3, #deddda)' }}>
        <Toolbar>
          <Button variant="flat">Cancel</Button>
          <Spacer />
          <Button variant="destructive">Delete</Button>
          <Button variant="suggested">Confirm</Button>
        </Toolbar>
      </div>
    </div>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Toolbar used as a bottom action bar beneath a content area — a common GNOME dialog pattern.',
      },
    },
  },
};
