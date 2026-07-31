import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Button } from '../Button';
import { Text } from '../Text';

import { Overlay } from './Overlay';
import readme from './README.md?raw';

const meta: Meta<typeof Overlay> = {
  title: 'Components/Overlay',
  component: Overlay,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: readme,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Overlay>;

// ─── Basic ────────────────────────────────────────────────────────────────────

export const Basic: Story = {
  render: function BasicStory() {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>Open overlay</Button>
        <Overlay open={open} onDismiss={() => setOpen(false)}>
          <div
            style={{
              background: 'var(--gnome-window-bg-color, #fff)',
              borderRadius: 12,
              padding: 24,
              maxWidth: 320,
            }}
          >
            <Text variant="title-4">Custom panel</Text>
            <Text variant="body" color="dim">
              This content lives inside an <code>Overlay</code>, not a <code>Modal</code> — no
              dialog role, no focus trap, no Escape handling. Click the backdrop to dismiss.
            </Text>
            <div style={{ marginTop: 12 }}>
              <Button onClick={() => setOpen(false)}>Close</Button>
            </div>
          </div>
        </Overlay>
      </>
    );
  },
  parameters: { controls: { disable: true } },
};

// ─── Lightbox use case ────────────────────────────────────────────────────────

export const Lightbox: Story = {
  render: function LightboxStory() {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>View image</Button>
        <Overlay open={open} onDismiss={() => setOpen(false)}>
          <div
            style={{
              width: 480,
              height: 320,
              maxWidth: '90vw',
              maxHeight: '80vh',
              borderRadius: 8,
              background: 'linear-gradient(135deg, #3584e4, #9141ac)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            <Text variant="title-3">Full-size image</Text>
          </div>
        </Overlay>
      </>
    );
  },
  parameters: { controls: { disable: true } },
};
