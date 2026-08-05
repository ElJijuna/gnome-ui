import { EmojiObjects } from '@gnome-ui/icons';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { IconButton } from '@/components/IconButton';
import { Text } from '@/components/Text';

import { EmojiPicker } from './EmojiPicker';
import readme from './README.md?raw';

const meta: Meta<typeof EmojiPicker> = {
  title: 'Components/EmojiPicker',
  component: EmojiPicker,
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
type Story = StoryObj<typeof EmojiPicker>;

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: function DefaultStory() {
    const [picked, setPicked] = useState<string | null>(null);

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <EmojiPicker onSelect={setPicked}>
          <IconButton icon={EmojiObjects} label="Insert emoji" tooltip="Insert emoji" />
        </EmojiPicker>
        <Text variant="body" color="dim">
          {picked ? `Picked: ${picked}` : 'No emoji picked yet'}
        </Text>
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};

// ─── In a message composer ─────────────────────────────────────────────────────

export const InMessageComposer: Story = {
  render: function ComposerStory() {
    const [message, setMessage] = useState('');

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: 320,
          padding: 8,
          border: '1px solid var(--gnome-border-subtle, #ccc)',
          borderRadius: 8,
        }}
      >
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message…"
          style={{ flex: 1, border: 'none', outline: 'none', background: 'none' }}
        />
        <EmojiPicker onSelect={(emoji) => setMessage((m) => m + emoji)}>
          <IconButton icon={EmojiObjects} label="Insert emoji" tooltip="Insert emoji" size="sm" />
        </EmojiPicker>
      </div>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Selecting an emoji appends it to the message input instead of replacing it.',
      },
    },
  },
};

// ─── Placement ──────────────────────────────────────────────────────────────────

export const TopPlacement: Story = {
  render: () => (
    <EmojiPicker onSelect={() => {}} placement="top">
      <IconButton icon={EmojiObjects} label="Insert emoji" tooltip="Insert emoji" />
    </EmojiPicker>
  ),
  parameters: { controls: { disable: true } },
};
