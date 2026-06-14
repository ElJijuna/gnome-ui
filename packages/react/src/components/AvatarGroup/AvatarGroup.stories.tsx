import type { Meta, StoryObj } from '@storybook/react';

import { Text } from '../Text';

import { AvatarGroup } from './AvatarGroup';
import readme from './README.md?raw';

const meta: Meta<typeof AvatarGroup> = {
  title: 'Components/AvatarGroup',
  component: AvatarGroup,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: readme,
      },
    },
  },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl'] },
    max: { control: { type: 'number', min: 1 } },
  },
  args: {
    size: 'md',
    max: 5,
    avatars: [
      { name: 'Alice Martin' },
      { name: 'Bob Smith' },
      { name: 'Carol White' },
      { name: 'David Brown' },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof AvatarGroup>;

// ─── Default (under max) ──────────────────────────────────────────────────────

export const Default: Story = {};

// ─── With overflow ────────────────────────────────────────────────────────────

export const WithOverflow: Story = {
  args: {
    max: 4,
    avatars: [
      { name: 'Alice Martin' },
      { name: 'Bob Smith' },
      { name: 'Carol White' },
      { name: 'David Brown' },
      { name: 'Eva Green' },
      { name: 'Frank Hall' },
      { name: 'Grace Lee' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'When the total exceeds `max`, the remaining count appears as a `+N` chip.',
      },
    },
  },
};

// ─── Sizes ────────────────────────────────────────────────────────────────────

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {(['sm', 'md', 'lg', 'xl'] as const).map((s) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <AvatarGroup
            size={s}
            max={3}
            avatars={[
              { name: 'Alice Martin' },
              { name: 'Bob Smith' },
              { name: 'Carol White' },
              { name: 'David Brown' },
              { name: 'Eva Green' },
            ]}
          />
          <Text variant="caption" color="dim">
            {s}
          </Text>
        </div>
      ))}
    </div>
  ),
  parameters: { controls: { disable: true } },
};

// ─── Single avatar ────────────────────────────────────────────────────────────

export const SingleAvatar: Story = {
  args: {
    avatars: [{ name: 'Alice Martin' }],
  },
  parameters: {
    docs: {
      description: {
        story: 'Edge case: a single avatar renders without overlap or overflow.',
      },
    },
  },
};

// ─── Custom max (interactive) ─────────────────────────────────────────────────

export const CustomMax: Story = {
  args: {
    max: 3,
    avatars: [
      { name: 'Alice Martin' },
      { name: 'Bob Smith' },
      { name: 'Carol White' },
      { name: 'David Brown' },
      { name: 'Eva Green' },
      { name: 'Frank Hall' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Adjust `max` in the controls panel to see the overflow chip update live.',
      },
    },
  },
};
