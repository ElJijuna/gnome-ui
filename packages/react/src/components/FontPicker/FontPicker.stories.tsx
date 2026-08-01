import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Text } from '../Text';

import { FontPicker } from './FontPicker';
import type { FontValue } from './fontData';
import readme from './README.md?raw';

const meta: Meta<typeof FontPicker> = {
  title: 'Components/FontPicker',
  component: FontPicker,
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
type Story = StoryObj<typeof FontPicker>;

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: function DefaultStory() {
    const [font, setFont] = useState<FontValue>({
      family: 'Cantarell',
      size: 11,
      weight: 400,
    });

    return <FontPicker value={font} onChange={setFont} />;
  },
  parameters: { controls: { disable: true } },
};

// ─── With a live preview ─────────────────────────────────────────────────────

export const WithLivePreview: Story = {
  render: function PreviewStory() {
    const [font, setFont] = useState<FontValue>({
      family: 'Cantarell',
      size: 20,
      weight: 700,
    });

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
        <FontPicker label="Heading font" value={font} onChange={setFont} />
        <Text
          variant="body"
          style={{
            fontFamily: font.family,
            fontSize: font.size,
            fontWeight: font.weight,
          }}
        >
          The quick brown fox jumps over the lazy dog
        </Text>
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};

// ─── Custom family list ─────────────────────────────────────────────────────

export const CustomFamilies: Story = {
  render: function CustomFamiliesStory() {
    const [font, setFont] = useState<FontValue>({ family: 'Inter', size: 14, weight: 500 });

    return (
      <FontPicker
        value={font}
        onChange={setFont}
        families={['Inter', 'Roboto', 'Source Sans Pro', 'IBM Plex Sans']}
      />
    );
  },
  parameters: { controls: { disable: true } },
};

// ─── Disabled ─────────────────────────────────────────────────────────────────

export const Disabled: Story = {
  args: {
    value: { family: 'Cantarell', size: 11, weight: 400 },
    disabled: true,
    onChange: () => {},
  },
};
