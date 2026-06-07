import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { BoxedList } from '../BoxedList';

import { ComboRow } from './ComboRow';
import readme from './README.md?raw';

const meta: Meta<typeof ComboRow> = {
  title: 'Components/ComboRow',
  component: ComboRow,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: readme,
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    title: 'Appearance',
    options: [
      { value: 'light', label: 'Light' },
      { value: 'dark', label: 'Dark' },
      { value: 'system', label: 'Follow System' },
    ],
    defaultValue: 'system',
  },
};

export default meta;
type Story = StoryObj<typeof ComboRow>;

// ─── Default ───────────────────────────────────────────────────────────────────

export const Default: Story = {};

// ─── In a BoxedList ────────────────────────────────────────────────────────────

export const InBoxedList: Story = {
  render: () => (
    <BoxedList>
      <ComboRow
        title="Appearance"
        subtitle="Color scheme"
        options={[
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
          { value: 'system', label: 'Follow System' },
        ]}
        defaultValue="system"
      />
      <ComboRow
        title="Text Size"
        options={[
          { value: 'small', label: 'Small' },
          { value: 'default', label: 'Default' },
          { value: 'large', label: 'Large' },
          { value: 'larger', label: 'Larger' },
        ]}
        defaultValue="default"
      />
      <ComboRow
        title="Language"
        options={[
          { value: 'en', label: 'English' },
          { value: 'es', label: 'Spanish' },
          { value: 'fr', label: 'French' },
          { value: 'de', label: 'German' },
        ]}
        defaultValue="en"
      />
    </BoxedList>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Multiple `ComboRow` items inside a `BoxedList` — the selected value is visible at a glance.',
      },
    },
  },
};

// ─── Controlled ────────────────────────────────────────────────────────────────

export const Controlled: Story = {
  render: () => {
    const [scheme, setScheme] = useState('system');
    const [size, setSize] = useState('default');

    return (
      <BoxedList>
        <ComboRow
          title="Appearance"
          subtitle={`Current: ${scheme}`}
          options={[
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
            { value: 'system', label: 'Follow System' },
          ]}
          value={scheme}
          onValueChange={setScheme}
        />
        <ComboRow
          title="Text Size"
          options={[
            { value: 'small', label: 'Small' },
            { value: 'default', label: 'Default' },
            { value: 'large', label: 'Large' },
          ]}
          value={size}
          onValueChange={setSize}
        />
      </BoxedList>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Controlled mode — use `value` + `onValueChange` to manage selection externally.',
      },
    },
  },
};

// ─── Disabled ─────────────────────────────────────────────────────────────────

export const Disabled: Story = {
  render: () => (
    <BoxedList>
      <ComboRow
        title="Appearance"
        subtitle="Managed by your organization"
        options={[
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
        ]}
        defaultValue="light"
        disabled
      />
    </BoxedList>
  ),
  parameters: { controls: { disable: true } },
};
