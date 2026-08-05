import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Text } from '@/components/Text';

import { MultiSelectDropdown } from './MultiSelectDropdown';
import readme from './README.md?raw';

const meta: Meta<typeof MultiSelectDropdown> = {
  title: 'Components/MultiSelectDropdown',
  component: MultiSelectDropdown,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: readme,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof MultiSelectDropdown>;

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: function DefaultStory() {
    const [value, setValue] = useState<string[]>([]);

    return (
      <div style={{ maxWidth: 280 }}>
        <MultiSelectDropdown
          aria-label="Languages"
          placeholder="Choose languages"
          options={[
            { value: 'js', label: 'JavaScript' },
            { value: 'ts', label: 'TypeScript' },
            { value: 'py', label: 'Python' },
            { value: 'rs', label: 'Rust' },
          ]}
          value={value}
          onChange={setValue}
        />
        {value.length > 0 && (
          <Text variant="caption" color="dim" style={{ marginTop: 8, display: 'block' }}>
            Selected: {value.join(', ')}
          </Text>
        )}
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};

// ─── With descriptions ────────────────────────────────────────────────────────

export const WithDescriptions: Story = {
  render: function DescStory() {
    const [value, setValue] = useState<string[]>(['notifications']);

    return (
      <div style={{ maxWidth: 320 }}>
        <MultiSelectDropdown
          aria-label="Permissions"
          placeholder="Select permissions"
          options={[
            { value: 'camera', label: 'Camera', description: 'Photo and video capture' },
            { value: 'location', label: 'Location', description: 'Precise device location' },
            {
              value: 'notifications',
              label: 'Notifications',
              description: 'Show system notifications',
            },
          ]}
          value={value}
          onChange={setValue}
        />
      </div>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Each option can have an optional `description` shown in a dimmed second line.',
      },
    },
  },
};

// ─── Many selected (count summary) ──────────────────────────────────────────────

export const ManySelected: Story = {
  render: function ManyStory() {
    const [value, setValue] = useState<string[]>(['us', 'gb', 'de']);

    return (
      <div style={{ maxWidth: 260 }}>
        <MultiSelectDropdown
          aria-label="Regions"
          options={[
            { value: 'us', label: 'United States' },
            { value: 'gb', label: 'United Kingdom' },
            { value: 'de', label: 'Germany' },
            { value: 'jp', label: 'Japan' },
            { value: 'br', label: 'Brazil' },
          ]}
          value={value}
          onChange={setValue}
        />
      </div>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Once more than one value is selected, the trigger shows a `"N selected"` summary.',
      },
    },
  },
};

// ─── With disabled option ─────────────────────────────────────────────────────

export const WithDisabledOption: Story = {
  render: function DisabledOptStory() {
    const [value, setValue] = useState<string[]>([]);

    return (
      <div style={{ maxWidth: 260 }}>
        <MultiSelectDropdown
          aria-label="Output devices"
          placeholder="Select outputs"
          options={[
            { value: 'speakers', label: 'Speakers' },
            { value: 'headphones', label: 'Headphones' },
            { value: 'hdmi', label: 'HDMI', disabled: true },
          ]}
          value={value}
          onChange={setValue}
        />
      </div>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: 'Disabled options are skipped by keyboard navigation.' },
    },
  },
};

// ─── Disabled control ─────────────────────────────────────────────────────────

export const Disabled: Story = {
  render: () => (
    <div style={{ maxWidth: 260 }}>
      <MultiSelectDropdown
        aria-label="Regions"
        value={['eu-west']}
        disabled
        onChange={() => {}}
        options={[
          { value: 'us-east', label: 'US East' },
          { value: 'eu-west', label: 'EU West' },
          { value: 'ap-south', label: 'AP South' },
        ]}
      />
    </div>
  ),
  parameters: { controls: { disable: true } },
};
