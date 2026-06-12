import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Button } from '../Button';
import { Text } from '../Text';

import { AlertDialog } from './AlertDialog';

const meta: Meta<typeof AlertDialog> = {
  title: 'Components/AlertDialog',
  component: AlertDialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof AlertDialog>;

export const DestructiveConfirmation: Story = {
  render: function DestructiveConfirmationStory() {
    const [open, setOpen] = useState(false);
    const [response, setResponse] = useState<string | null>(null);

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Button variant="destructive" onClick={() => setOpen(true)}>
          Delete file
        </Button>
        {response && (
          <Text variant="caption" color="dim">
            Response: {response}
          </Text>
        )}
        <AlertDialog
          open={open}
          title="Delete File?"
          message="This file will be permanently deleted."
          responses={[
            { id: 'cancel', label: 'Cancel' },
            { id: 'delete', label: 'Delete', variant: 'destructive' },
          ]}
          onResponse={(id) => {
            setResponse(id);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};

export const SuggestedAction: Story = {
  render: function SuggestedActionStory() {
    const [open, setOpen] = useState(false);
    const [response, setResponse] = useState<string | null>(null);

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Button onClick={() => setOpen(true)}>Close document</Button>
        {response && (
          <Text variant="caption" color="dim">
            Response: {response}
          </Text>
        )}
        <AlertDialog
          open={open}
          title="Save Changes?"
          message="Do you want to save your changes before closing?"
          responses={[
            { id: 'cancel', label: 'Cancel' },
            { id: 'discard', label: 'Discard', variant: 'destructive' },
            { id: 'save', label: 'Save', variant: 'suggested' },
          ]}
          onResponse={(id) => {
            setResponse(id);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};
