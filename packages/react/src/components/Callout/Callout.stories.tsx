import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { TextField } from '@/components/TextField';

import { Callout } from './Callout';
import readme from './README.md?raw';

const meta: Meta<typeof Callout> = {
  title: 'Components/Callout',
  component: Callout,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: readme,
      },
    },
  },
  argTypes: {
    variant: { control: 'select', options: ['info', 'warning', 'tip'] },
  },
  args: {
    variant: 'info',
    children: 'Changes are saved automatically.',
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 420 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Callout>;

// ─── Basic ────────────────────────────────────────────────────────────────────

export const Basic: Story = {};

// ─── Variants ─────────────────────────────────────────────────────────────────

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Callout variant="info">Changes are saved automatically.</Callout>
      <Callout variant="warning">This action can't be undone.</Callout>
      <Callout variant="tip">Press Ctrl+K to open the command palette.</Callout>
    </div>
  ),
  parameters: { controls: { disable: true } },
};

// ─── Dismissible ──────────────────────────────────────────────────────────────

export const Dismissible: Story = {
  render: function DismissibleStory() {
    const [visible, setVisible] = useState(true);

    if (!visible) {
      return <em>Dismissed — refresh the story to show it again.</em>;
    }

    return (
      <Callout variant="tip" dismissible onDismiss={() => setVisible(false)}>
        You can drag files directly onto the sidebar to move them.
      </Callout>
    );
  },
  parameters: { controls: { disable: true } },
};

// ─── In a form ────────────────────────────────────────────────────────────────

export const InAForm: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <TextField label="New password" type="password" />
      <Callout variant="warning">Choosing a weak password puts your account at risk.</Callout>
    </div>
  ),
  parameters: { controls: { disable: true } },
};
