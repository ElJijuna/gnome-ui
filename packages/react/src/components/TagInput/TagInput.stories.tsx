import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import readme from './README.md?raw';
import { TagInput } from './TagInput';

const meta: Meta<typeof TagInput> = {
  title: 'Components/TagInput',
  component: TagInput,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: readme,
      },
    },
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value ?? []);

    return <TagInput {...args} value={value} onChange={setValue} />;
  },
  argTypes: {
    label: { control: 'text' },
    helperText: { control: 'text' },
    error: { control: 'text' },
    placeholder: { control: 'text' },
    maxTags: { control: { type: 'number' } },
    preventDuplicates: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Tags',
    placeholder: 'Add a tag…',
    value: ['react', 'gnome'],
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 360 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TagInput>;

// ─── Default ───────────────────────────────────────────────────────────────────

export const Default: Story = {};

// ─── Empty ───────────────────────────────────────────────────────────────────

export const Empty: Story = {
  args: { value: [] },
};

// ─── With helper text ──────────────────────────────────────────────────────────

export const WithHelperText: Story = {
  args: {
    value: [],
    helperText: 'Press Enter or paste a comma-separated list.',
  },
};

// ─── Error state ───────────────────────────────────────────────────────────────

export const Error: Story = {
  args: {
    value: [],
    error: 'Add at least one tag.',
  },
};

// ─── Max tags ─────────────────────────────────────────────────────────────────

export const MaxTags: Story = {
  args: {
    value: ['react', 'gnome'],
    maxTags: 2,
    helperText: 'Maximum of 2 tags.',
  },
  parameters: {
    docs: {
      description: {
        story: 'Once `maxTags` is reached, the draft input is hidden.',
      },
    },
  },
};

// ─── Disabled ─────────────────────────────────────────────────────────────────

export const Disabled: Story = {
  args: {
    value: ['react', 'gnome'],
    disabled: true,
  },
};
