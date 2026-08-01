import type { Meta, StoryObj } from '@storybook/react';
import { useId, useState } from 'react';

import { Checkbox } from '../Checkbox';
import { RadioButton } from '../RadioButton';
import { Text } from '../Text';

import { FieldGroup } from './FieldGroup';
import readme from './README.md?raw';

const meta: Meta<typeof FieldGroup> = {
  title: 'Components/FieldGroup',
  component: FieldGroup,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: readme,
      },
    },
  },
  argTypes: {
    label: { control: 'text' },
    helperText: { control: 'text' },
    error: { control: 'text' },
    disabled: { control: 'boolean' },
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
type Story = StoryObj<typeof FieldGroup>;

// ─── Default (radio group) ───────────────────────────────────────────────────

export const Default: Story = {
  render: function DefaultStory() {
    const [value, setValue] = useState('email');
    // Autodocs renders this story twice on one page (Primary canvas + the
    // Stories list), so a hardcoded `name` would make both copies' native
    // radio groups fight each other — useId() keeps each mount independent.
    const name = useId();

    return (
      <FieldGroup label="Notification method" helperText="Choose how you want to be notified.">
        {['email', 'sms', 'push'].map((opt) => (
          <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <RadioButton
              name={name}
              value={opt}
              checked={value === opt}
              onChange={() => setValue(opt)}
            />
            <Text variant="body" style={{ textTransform: 'capitalize' }}>
              {opt}
            </Text>
          </label>
        ))}
      </FieldGroup>
    );
  },
  parameters: { controls: { disable: true } },
};

// ─── Checkbox group ───────────────────────────────────────────────────────────

export const CheckboxGroup: Story = {
  render: function CheckboxStory() {
    const [checked, setChecked] = useState<Record<string, boolean>>({
      camera: true,
      microphone: false,
      location: false,
    });

    return (
      <FieldGroup label="App permissions">
        {Object.keys(checked).map((key) => (
          <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Checkbox
              checked={checked[key]}
              onChange={(e) => setChecked({ ...checked, [key]: e.target.checked })}
            />
            <Text variant="body" style={{ textTransform: 'capitalize' }}>
              {key}
            </Text>
          </label>
        ))}
      </FieldGroup>
    );
  },
  parameters: { controls: { disable: true } },
};

// ─── Error state ───────────────────────────────────────────────────────────────

export const Error: Story = {
  render: function ErrorStory() {
    const name = useId();

    return (
      <FieldGroup label="Notification method" error="Select at least one notification method.">
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <RadioButton name={name} value="email" />
          <Text variant="body">Email</Text>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <RadioButton name={name} value="sms" />
          <Text variant="body">SMS</Text>
        </label>
      </FieldGroup>
    );
  },
  parameters: { controls: { disable: true } },
};

// ─── Disabled ─────────────────────────────────────────────────────────────────

export const Disabled: Story = {
  render: function DisabledStory() {
    const name = useId();

    return (
      <FieldGroup label="Notification method" disabled>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <RadioButton name={name} value="email" defaultChecked />
          <Text variant="body">Email</Text>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <RadioButton name={name} value="sms" />
          <Text variant="body">SMS</Text>
        </label>
      </FieldGroup>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: '`disabled` on `FieldGroup` disables every descendant form control automatically.',
      },
    },
  },
};
