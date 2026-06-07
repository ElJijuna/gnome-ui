import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Avatar } from '../Avatar';
import { Text } from '../Text';

import { ColorPicker, ColorSwatch, GNOME_PALETTE } from './ColorPicker';
import readme from './README.md?raw';

const meta: Meta<typeof ColorPicker> = {
  title: 'Components/ColorPicker',
  component: ColorPicker,
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
type Story = StoryObj<typeof ColorPicker>;

// ─── Default palette ─────────────────────────────────────────────────────────

export const Default: Story = {
  render: function DefaultStory() {
    const [color, setColor] = useState('#3584e4');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <ColorPicker value={color} onChange={setColor} />
        <Text variant="caption" color="dim">
          Selected: {color}
        </Text>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Default 9-color Adwaita palette. Arrow keys navigate between swatches.',
      },
    },
  },
};

// ─── With custom color ────────────────────────────────────────────────────────

export const WithCustom: Story = {
  render: function CustomStory() {
    const [color, setColor] = useState('#3584e4');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <ColorPicker value={color} onChange={setColor} allowCustom />
        <Text variant="caption" color="dim">
          Selected: {color}
        </Text>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '`allowCustom` adds a `+` button that opens the native OS color picker. The chosen color appears as a swatch.',
      },
    },
  },
};

// ─── Sizes ────────────────────────────────────────────────────────────────────

export const Sizes: Story = {
  render: function SizesStory() {
    const [color, setColor] = useState('#9141ac');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Text variant="caption" color="dim" style={{ width: 24 }}>
            sm
          </Text>
          <ColorPicker value={color} onChange={setColor} size="sm" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Text variant="caption" color="dim" style={{ width: 24 }}>
            md
          </Text>
          <ColorPicker value={color} onChange={setColor} size="md" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Text variant="caption" color="dim" style={{ width: 24 }}>
            lg
          </Text>
          <ColorPicker value={color} onChange={setColor} size="lg" />
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: { story: 'Three sizes: `sm` (22 px), `md` (30 px, default), `lg` (38 px).' },
    },
  },
};

// ─── Custom palette ───────────────────────────────────────────────────────────

export const CustomPalette: Story = {
  render: function CustomPaletteStory() {
    const pastel = [
      { value: '#ffc0cb', label: 'Pink' },
      { value: '#add8e6', label: 'Light blue' },
      { value: '#90ee90', label: 'Light green' },
      { value: '#fffacd', label: 'Lemon' },
      { value: '#dda0dd', label: 'Plum' },
      { value: '#f0e68c', label: 'Khaki' },
    ];
    const [color, setColor] = useState(pastel[0].value);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <ColorPicker value={color} onChange={setColor} colors={pastel} />
        <Text variant="caption" color="dim">
          Selected: {color}
        </Text>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Pass a custom `colors` array to replace the default Adwaita palette.',
      },
    },
  },
};

// ─── Standalone ColorSwatch ────────────────────────────────────────────────────

export const Swatch: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      {GNOME_PALETTE.map((c) => (
        <ColorSwatch
          key={c.value}
          color={c.value}
          aria-label={c.label}
          onSelect={(v) => alert(v)}
        />
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`ColorSwatch` can be used standalone — e.g. inside a list row as a color indicator.',
      },
    },
  },
};

// ─── Integrated with Avatar ───────────────────────────────────────────────────

export const WithAvatar: Story = {
  render: function AvatarStory() {
    const palette = GNOME_PALETTE.slice(0, 6);
    const [color, setColor] = useState(palette[0].value);

    // Rough hex → AvatarColor mapping for demo purposes
    const hexToName: Record<string, string> = {
      '#3584e4': 'blue',
      '#2ec27e': 'green',
      '#f6d32d': 'yellow',
      '#ff7800': 'orange',
      '#e01b24': 'red',
      '#9141ac': 'purple',
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
        <Avatar name="Ada Lovelace" size="xl" color={(hexToName[color] as never) ?? 'blue'} />
        <ColorPicker value={color} onChange={setColor} colors={palette} aria-label="Avatar color" />
      </div>
    );
  },
  parameters: {
    docs: {
      description: { story: 'Typical use-case: picking an `Avatar` accent color.' },
    },
  },
};
