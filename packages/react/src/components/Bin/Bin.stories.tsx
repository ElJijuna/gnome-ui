import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '../Button';
import { Text } from '../Text';

import { Bin } from './Bin';
import readme from './README.md?raw';

const meta: Meta<typeof Bin> = {
  title: 'Components/Bin',
  component: Bin,
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
type Story = StoryObj<typeof Bin>;

// ─── Default ───────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <Bin style={{ padding: 16, border: '1px dashed var(--gnome-borders-color)' }}>
      <Text variant="body">Content inside a Bin</Text>
    </Bin>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'A `Bin` with a dashed border added via `style` to make it visible. The border is not part of the component.',
      },
    },
  },
};

// ─── With size constraint ──────────────────────────────────────────────────────

export const WithSizeConstraint: Story = {
  render: () => (
    <Bin style={{ maxWidth: 200, overflow: 'hidden' }}>
      <Button variant="suggested" style={{ width: '100%' }}>
        Constrained Button
      </Button>
    </Bin>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Use `Bin` to apply `maxWidth` or other layout constraints without wrapping in a styled div.',
      },
    },
  },
};
