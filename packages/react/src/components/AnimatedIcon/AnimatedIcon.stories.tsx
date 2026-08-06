import { Connecting, Downloading, Recording, Syncing } from '@gnome-ui/icons';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Button } from '@/components/Button';
import { Text } from '@/components/Text';

import { AnimatedIcon } from './AnimatedIcon';
import readme from './README.md?raw';

const meta: Meta<typeof AnimatedIcon> = {
  title: 'Components/AnimatedIcon',
  component: AnimatedIcon,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: readme,
      },
    },
  },
  argTypes: {
    playing: { control: 'boolean' },
  },
  args: {
    icon: Syncing,
    playing: true,
    label: 'Syncing',
    size: 'lg',
  },
};

export default meta;
type Story = StoryObj<typeof AnimatedIcon>;

// ─── Default ───────────────────────────────────────────────────────────────────

export const Default: Story = {};

// ─── Play / pause ────────────────────────────────────────────────────────────────

export const PlayPause: Story = {
  render: () => {
    const [playing, setPlaying] = useState(true);

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <AnimatedIcon icon={Syncing} playing={playing} size="lg" label="Syncing" />
        <Button onClick={() => setPlaying((p) => !p)}>{playing ? 'Pause' : 'Play'}</Button>
      </div>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'The `playing` prop toggles the animation on and off. When paused, the icon freezes at whatever frame the CSS animation was on.',
      },
    },
  },
};

// ─── All animated icons ────────────────────────────────────────────────────────

const ANIMATED_ICONS = [
  { name: 'Syncing', icon: Syncing, use: 'Sync in progress' },
  { name: 'Recording', icon: Recording, use: 'Active recording' },
  { name: 'Downloading', icon: Downloading, use: 'Active download' },
  { name: 'Connecting', icon: Connecting, use: 'Acquiring a connection' },
];

export const AllAnimatedIcons: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32 }}>
      {ANIMATED_ICONS.map(({ name, icon, use }) => (
        <div
          key={name}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
        >
          <AnimatedIcon icon={icon} size="lg" label={name} />
          <Text variant="caption-heading">{name}</Text>
          <Text variant="caption" color="dim" style={{ textAlign: 'center', maxWidth: 100 }}>
            {use}
          </Text>
        </div>
      ))}
    </div>
  ),
  parameters: { controls: { disable: true } },
};

// ─── Static vs animated ─────────────────────────────────────────────────────────

export const StaticByDefault: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <AnimatedIcon icon={Syncing} playing={false} size="lg" label="Syncing (paused)" />
        <Text variant="caption" color="dim">
          playing=false
        </Text>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <AnimatedIcon icon={Syncing} playing size="lg" label="Syncing (playing)" />
        <Text variant="caption" color="dim">
          playing=true
        </Text>
      </div>
    </div>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Rendering the same icon through plain `<Icon>` (not shown here — see the Icon story) always shows this paused frame, since animated icons are inert unless wrapped in `<AnimatedIcon>`.',
      },
    },
  },
};
