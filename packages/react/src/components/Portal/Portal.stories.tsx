import type { Meta, StoryObj } from '@storybook/react';
import { useRef, useState } from 'react';

import { Text } from '@/components/Text';

import { Portal } from './Portal';
import readme from './README.md?raw';

const meta: Meta<typeof Portal> = {
  title: 'Components/Portal',
  component: Portal,
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
type Story = StoryObj<typeof Portal>;

// ─── Escaping overflow: hidden ──────────────────────────────────────────────────

export const EscapingOverflowHidden: Story = {
  render: () => (
    <div
      style={{
        position: 'relative',
        width: 260,
        height: 120,
        overflow: 'hidden',
        border: '1px dashed var(--gnome-borders-color, #ccc)',
        borderRadius: 8,
        padding: 12,
      }}
    >
      <Text variant="body" color="dim">
        This box has <code>overflow: hidden</code>. Without a portal, the badge below would be
        clipped.
      </Text>

      <Portal>
        <div
          style={{
            position: 'fixed',
            top: 16,
            right: 16,
            padding: '6px 12px',
            background: 'var(--gnome-accent-bg-color, #3584e4)',
            color: '#fff',
            borderRadius: 6,
            fontSize: 13,
          }}
        >
          Rendered via Portal — not clipped
        </div>
      </Portal>
    </div>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'The badge is a child of the clipped box in JSX, but `Portal` mounts it at the end of `document.body`, so it renders on top of the page instead of being cut off.',
      },
    },
  },
};

// ─── Custom container ───────────────────────────────────────────────────────────

export const CustomContainer: Story = {
  render: function CustomContainerStory() {
    const targetRef = useRef<HTMLDivElement>(null);
    const [ready, setReady] = useState(false);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Text variant="body" color="dim">
          The content below is portaled into the highlighted box on the right, not rendered where it
          appears in JSX.
        </Text>
        <div style={{ display: 'flex', gap: 16 }}>
          <div
            style={{
              flex: 1,
              padding: 12,
              border: '1px dashed var(--gnome-borders-color, #ccc)',
              borderRadius: 8,
            }}
          >
            <Text variant="caption" color="dim">
              Source position (JSX)
            </Text>
            {ready && (
              <Portal container={targetRef.current!}>
                <Text variant="body">👋 Hello from the portal</Text>
              </Portal>
            )}
          </div>
          <div
            ref={(node) => {
              targetRef.current = node;
              if (node && !ready) {
                setReady(true);
              }
            }}
            style={{
              flex: 1,
              padding: 12,
              background: 'var(--gnome-card-bg-color)',
              border: '1px solid var(--gnome-accent-bg-color, #3584e4)',
              borderRadius: 8,
            }}
          >
            <Text variant="caption" color="dim">
              Portal target
            </Text>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Pass `container` to portal into a specific DOM node instead of `document.body`.',
      },
    },
  },
};
