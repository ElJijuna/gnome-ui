import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Button } from '../Button';
import { Text } from '../Text';

import { Modal } from './Modal';
import readme from './README.md?raw';

const meta: Meta<typeof Modal> = {
  title: 'Components/Modal',
  component: Modal,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: readme,
      },
    },
  },
  argTypes: {
    open: { control: 'boolean' },
    title: { control: 'text' },
    closeOnBackdrop: { control: 'boolean' },
  },
  args: {
    open: false,
    title: 'Modal title',
    closeOnBackdrop: true,
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

// ─── Default ───────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Modal</Button>
        <Modal {...args} open={open} onClose={() => setOpen(false)}>
          <Text variant="body" color="dim">
            This is the modal body. Place any content here — text, forms, lists, or components. The
            body scrolls independently when content exceeds the available height.
          </Text>
        </Modal>
      </>
    );
  },
  parameters: { controls: { disable: true } },
};

// ─── With actions ─────────────────────────────────────────────────────────────

export const WithActions: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>Edit Profile</Button>
        <Modal
          open={open}
          title="Edit Profile"
          onClose={() => setOpen(false)}
          primaryAction={{ label: 'Save', onClick: () => setOpen(false) }}
          secondaryActions={[{ label: 'Cancel', onClick: () => setOpen(false) }]}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label htmlFor="modal-name" style={{ fontWeight: 600 }}>
                Full name
              </label>
              <input
                id="modal-name"
                type="text"
                defaultValue="Ada Lovelace"
                style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label htmlFor="modal-email" style={{ fontWeight: 600 }}>
                Email
              </label>
              <input
                id="modal-email"
                type="email"
                defaultValue="ada@lovelace.io"
                style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc' }}
              />
            </div>
          </div>
        </Modal>
      </>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Primary and secondary actions live in the header bar. The primary action defaults to the `"suggested"` (accent) style.',
      },
    },
  },
};

// ─── Long content ─────────────────────────────────────────────────────────────

export const LongContent: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>View Release Notes</Button>
        <Modal open={open} title="Release Notes — v3.0" onClose={() => setOpen(false)}>
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <Text variant="body">
                <strong>Section {i + 1}</strong> — Lorem ipsum dolor sit amet, consectetur
                adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
              </Text>
            </div>
          ))}
        </Modal>
      </>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'The body scrolls independently — the header stays fixed at the top regardless of content length.',
      },
    },
  },
};

// ─── No backdrop close ────────────────────────────────────────────────────────

export const NoBackdropClose: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>Open</Button>
        <Modal
          open={open}
          title="Required Step"
          onClose={() => setOpen(false)}
          closeOnBackdrop={false}
          primaryAction={{ label: 'Continue', onClick: () => setOpen(false) }}
        >
          <Text variant="body" color="dim">
            This modal can only be dismissed via the × button, Escape, or the Continue action.
            Clicking outside does nothing.
          </Text>
        </Modal>
      </>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Set `closeOnBackdrop={false}` to prevent dismissal by clicking outside the modal.',
      },
    },
  },
};
