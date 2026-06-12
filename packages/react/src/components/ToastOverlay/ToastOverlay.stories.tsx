import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Button } from '../Button';
import { Card } from '../Card';
import { Text } from '../Text';
import { Toast } from '../Toast';

import { ToastOverlay } from './ToastOverlay';

const meta: Meta<typeof ToastOverlay> = {
  title: 'Components/ToastOverlay',
  component: ToastOverlay,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof ToastOverlay>;

export const LocalOverlay: Story = {
  render: function LocalOverlayStory() {
    const [show, setShow] = useState(false);

    return (
      <ToastOverlay
        style={{ width: 520, height: 320 }}
        toasts={
          show && (
            <Toast
              title="Document saved"
              actionLabel="Undo"
              onAction={() => setShow(false)}
              onDismiss={() => setShow(false)}
            />
          )
        }
      >
        <Card style={{ height: '100%', padding: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Text variant="title-3">Draft</Text>
            <Text color="dim">Local overlay toast scoped to this view.</Text>
            <div>
              <Button variant="suggested" onClick={() => setShow(true)}>
                Save
              </Button>
            </div>
          </div>
        </Card>
      </ToastOverlay>
    );
  },
  parameters: { controls: { disable: true } },
};

export const TopPosition: Story = {
  render: function TopPositionStory() {
    const [show, setShow] = useState(true);

    return (
      <ToastOverlay
        position="top"
        style={{ width: 520, height: 320 }}
        toasts={
          show && (
            <Toast
              title="Upload complete"
              dismissible
              duration={0}
              onDismiss={() => setShow(false)}
            />
          )
        }
      >
        <Card style={{ height: '100%', padding: 24 }}>
          <Text variant="title-3">Uploads</Text>
        </Card>
      </ToastOverlay>
    );
  },
  parameters: { controls: { disable: true } },
};
