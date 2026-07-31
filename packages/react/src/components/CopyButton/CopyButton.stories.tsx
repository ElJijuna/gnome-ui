import type { Meta, StoryObj } from '@storybook/react';

import { CopyButton } from './CopyButton';
import readme from './README.md?raw';

const meta: Meta<typeof CopyButton> = {
  title: 'Components/CopyButton',
  component: CopyButton,
  tags: ['autodocs'],
  parameters: {
    docs: { description: { component: readme } },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'suggested', 'destructive', 'flat', 'raised', 'osd'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
  args: {
    value: 'CVE-2024-3094',
    label: 'Copy',
    variant: 'default',
    size: 'md',
  },
};

export default meta;
type Story = StoryObj<typeof CopyButton>;

export const Default: Story = {};

export const WithCustomLabel: Story = {
  args: {
    label: 'Copy CVE ID',
  },
};

export const InlineWithIdentifier: Story = {
  render: (args) => (
    <div style={{ alignItems: 'center', display: 'flex', gap: 4 }}>
      <code>{args.value}</code>
      <CopyButton {...args} size="sm" />
    </div>
  ),
};

export const Flat: Story = {
  args: {
    variant: 'flat',
  },
};
