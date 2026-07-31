import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Text } from '../Text';

import { RatingStars } from './RatingStars';
import readme from './README.md?raw';

const meta: Meta<typeof RatingStars> = {
  title: 'Components/RatingStars',
  component: RatingStars,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: readme,
      },
    },
  },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
  args: {
    value: 3,
    max: 5,
  },
};

export default meta;
type Story = StoryObj<typeof RatingStars>;

// ─── Read-only ────────────────────────────────────────────────────────────────

export const ReadOnly: Story = {
  args: { value: 4 },
};

// ─── Interactive ──────────────────────────────────────────────────────────────

export const Interactive: Story = {
  render: function InteractiveStory(args) {
    const [value, setValue] = useState(3);

    return <RatingStars {...args} value={value} onChange={setValue} />;
  },
  parameters: { controls: { disable: true } },
};

// ─── Sizes ────────────────────────────────────────────────────────────────────

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <RatingStars value={4} size="sm" aria-label="Small rating" />
      <RatingStars value={4} size="md" aria-label="Medium rating" />
      <RatingStars value={4} size="lg" aria-label="Large rating" />
    </div>
  ),
  parameters: { controls: { disable: true } },
};

// ─── Disabled ─────────────────────────────────────────────────────────────────

export const Disabled: Story = {
  args: { value: 3, onChange: () => {}, disabled: true },
};

// ─── Product reviews list ─────────────────────────────────────────────────────

export const ReviewsList: Story = {
  render: () => {
    const reviews = [
      { name: 'GNOME Text Editor', rating: 5 },
      { name: 'GNOME Files', rating: 4 },
      { name: 'GNOME Web', rating: 3 },
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {reviews.map(({ name, rating }) => (
          <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Text variant="body">{name}</Text>
            <RatingStars value={rating} size="sm" aria-label={`${name}: ${rating} out of 5`} />
          </div>
        ))}
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};
