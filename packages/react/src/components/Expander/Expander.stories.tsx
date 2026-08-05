import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Text } from '@/components/Text';
import { TextField } from '@/components/TextField';

import { Expander } from './Expander';
import readme from './README.md?raw';

const meta: Meta<typeof Expander> = {
  title: 'Components/Expander',
  component: Expander,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: readme,
      },
    },
  },
  args: {
    label: 'Show advanced options',
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
type Story = StoryObj<typeof Expander>;

// ─── Basic ────────────────────────────────────────────────────────────────────

export const Basic: Story = {
  render: (args) => (
    <Expander {...args}>
      <Text variant="body" color="dim">
        These settings are rarely needed — change them only if you know what you're doing.
      </Text>
    </Expander>
  ),
};

// ─── Default expanded ─────────────────────────────────────────────────────────

export const DefaultExpanded: Story = {
  args: { defaultExpanded: true },
  render: (args) => (
    <Expander {...args}>
      <Text variant="body" color="dim">
        Expanded on first render.
      </Text>
    </Expander>
  ),
};

// ─── Controlled ───────────────────────────────────────────────────────────────

export const Controlled: Story = {
  render: function ControlledStory(args) {
    const [expanded, setExpanded] = useState(false);

    return (
      <Expander {...args} expanded={expanded} onExpandedChange={setExpanded}>
        <Text variant="body" color="dim">
          Controlled from outside — expanded: {expanded ? 'true' : 'false'}
        </Text>
      </Expander>
    );
  },
  parameters: { controls: { disable: true } },
};

// ─── Form use case ────────────────────────────────────────────────────────────

export const InAForm: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <TextField label="Server address" placeholder="matrix.org" />
      <Expander label="Show advanced options">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <TextField label="Custom port" placeholder="443" />
          <TextField label="Proxy URL" placeholder="Optional" />
        </div>
      </Expander>
    </div>
  ),
  parameters: { controls: { disable: true } },
};

// ─── Disabled ─────────────────────────────────────────────────────────────────

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <Expander {...args}>
      <Text variant="body">Unreachable content</Text>
    </Expander>
  ),
};
