import type { Meta, StoryObj } from '@storybook/react';
import readme from './README.md?raw';
import { TextTruncate } from './TextTruncate';

const meta: Meta<typeof TextTruncate> = {
  title: 'Components/TextTruncate',
  component: TextTruncate,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: readme,
      },
    },
  },
  args: {
    children: 'A very long file name that might not fit in the available space.txt',
  },
};

export default meta;
type Story = StoryObj<typeof TextTruncate>;

// ─── Single line ──────────────────────────────────────────────────────────────

export const SingleLine: Story = {
  render: (args) => (
    <div style={{ width: 220, border: '1px dashed var(--gnome-borders-color, #ccc)' }}>
      <TextTruncate {...args} />
    </div>
  ),
};

// ─── Not truncated ────────────────────────────────────────────────────────────

export const FitsWithoutTruncation: Story = {
  args: { children: 'Short name.txt' },
  render: (args) => (
    <div style={{ width: 220, border: '1px dashed var(--gnome-borders-color, #ccc)' }}>
      <TextTruncate {...args} />
    </div>
  ),
};

// ─── Multi-line clamp ─────────────────────────────────────────────────────────

export const MultiLine: Story = {
  args: {
    children:
      'This description is intentionally long enough that it will need to wrap across ' +
      'several lines before eventually being clamped once it exceeds the configured limit.',
    lines: 3,
  },
  render: (args) => (
    <div style={{ width: 260, border: '1px dashed var(--gnome-borders-color, #ccc)' }}>
      <TextTruncate {...args} />
    </div>
  ),
};

// ─── In a list ────────────────────────────────────────────────────────────────

export const InAList: Story = {
  render: () => {
    const files = [
      'budget.xlsx',
      'quarterly-financial-summary-and-projections-2026.pdf',
      'notes.txt',
      'vacation-photo-from-the-trip-to-the-mountains.jpg',
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 200 }}>
        {files.map((name) => (
          <TextTruncate key={name}>{name}</TextTruncate>
        ))}
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};
