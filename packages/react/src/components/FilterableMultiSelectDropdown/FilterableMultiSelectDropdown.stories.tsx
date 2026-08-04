import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Text } from '../Text';

import { FilterableMultiSelectDropdown } from './FilterableMultiSelectDropdown';
import readme from './README.md?raw';

const meta: Meta<typeof FilterableMultiSelectDropdown> = {
  title: 'Components/FilterableMultiSelectDropdown',
  component: FilterableMultiSelectDropdown,
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
type Story = StoryObj<typeof FilterableMultiSelectDropdown>;

const countries = [
  { value: 'us', label: 'United States' },
  { value: 'gb', label: 'United Kingdom' },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
  { value: 'jp', label: 'Japan' },
  { value: 'br', label: 'Brazil' },
  { value: 'in', label: 'India' },
  { value: 'au', label: 'Australia' },
  { value: 'ca', label: 'Canada' },
  { value: 'mx', label: 'Mexico' },
  { value: 'za', label: 'South Africa' },
  { value: 'ng', label: 'Nigeria' },
];

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: function DefaultStory() {
    const [value, setValue] = useState<string[]>([]);

    return (
      <div style={{ maxWidth: 280 }}>
        <FilterableMultiSelectDropdown
          aria-label="Countries"
          placeholder="Choose countries"
          options={countries}
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
        <FilterableMultiSelectDropdown
          aria-label="Permissions"
          placeholder="Select permissions"
          filterPlaceholder="Filter permissions…"
          options={[
            { value: 'camera', label: 'Camera', description: 'Photo and video capture' },
            { value: 'location', label: 'Location', description: 'Precise device location' },
            {
              value: 'notifications',
              label: 'Notifications',
              description: 'Show system notifications',
            },
            { value: 'contacts', label: 'Contacts', description: 'Read the address book' },
            { value: 'microphone', label: 'Microphone', description: 'Audio recording' },
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
        story:
          'The filter query matches against `description` as well as `label` — typing "audio" finds Microphone.',
      },
    },
  },
};

// ─── Long list ────────────────────────────────────────────────────────────────

export const LongList: Story = {
  name: 'Long list',
  render: function LongListStory() {
    const [value, setValue] = useState<string[]>(['us', 'de']);

    return (
      <div style={{ maxWidth: 260 }}>
        <FilterableMultiSelectDropdown
          aria-label="Countries"
          options={countries}
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
        story:
          'This is the case the filter field earns its keep — scanning a dozen-plus options visually stops being the fastest way to find one.',
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
        <FilterableMultiSelectDropdown
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
      <FilterableMultiSelectDropdown
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
