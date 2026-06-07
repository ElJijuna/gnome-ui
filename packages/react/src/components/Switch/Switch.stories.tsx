import type { Meta, StoryObj } from '@storybook/react';

import { Text } from '../Text';
import readme from './README.md?raw';
import { Switch } from './Switch';

const meta: Meta<typeof Switch> = {
  title: 'Components/Switch',
  component: Switch,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: readme,
      },
    },
  },
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    disabled: false,
  },
  decorators: [
    (Story) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Switch>;

// ─── Default (uncontrolled) ────────────────────────────────────────────────────

export const Default: Story = {
  args: { defaultChecked: false, 'aria-label': 'Toggle setting' },
};

// ─── Checked ──────────────────────────────────────────────────────────────────

export const Checked: Story = {
  args: { defaultChecked: true, 'aria-label': 'Toggle setting' },
};

// ─── Disabled ─────────────────────────────────────────────────────────────────

export const Disabled: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <Switch disabled aria-label="Disabled off" />
      <Switch disabled defaultChecked aria-label="Disabled on" />
    </div>
  ),
  parameters: { controls: { disable: true } },
};

// ─── With label ────────────────────────────────────────────────────────────────

export const WithLabel: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[
        { label: 'Wi-Fi', defaultChecked: true },
        { label: 'Bluetooth', defaultChecked: false },
        { label: 'Airplane Mode', defaultChecked: false },
      ].map(({ label, defaultChecked }) => (
        <label
          key={label}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24,
            cursor: 'pointer',
          }}
        >
          <Text variant="body">{label}</Text>
          <Switch defaultChecked={defaultChecked} />
        </label>
      ))}
    </div>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Wrap with a `<label>` to make the entire row clickable.',
      },
    },
  },
};
