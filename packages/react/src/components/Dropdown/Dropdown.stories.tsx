import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Button } from '@/components/Button';
import { HeaderBar } from '@/components/HeaderBar';
import { Text } from '@/components/Text';
import { Spacer, Toolbar } from '@/components/Toolbar';

import { Dropdown } from './Dropdown';
import readme from './README.md?raw';

const meta: Meta<typeof Dropdown> = {
  title: 'Components/Dropdown',
  component: Dropdown,
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
type Story = StoryObj<typeof Dropdown>;

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: function DefaultStory() {
    const [value, setValue] = useState<string | undefined>(undefined);

    return (
      <div style={{ maxWidth: 260 }}>
        <Dropdown
          aria-label="Colour scheme"
          placeholder="Choose colour scheme"
          options={[
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
            { value: 'system', label: 'Follow system' },
          ]}
          value={value}
          onChange={setValue}
        />
        {value && (
          <Text variant="caption" color="dim" style={{ marginTop: 8, display: 'block' }}>
            Selected: {value}
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
    const [value, setValue] = useState('balanced');

    return (
      <div style={{ maxWidth: 300 }}>
        <Dropdown
          aria-label="Power mode"
          options={[
            {
              value: 'performance',
              label: 'Performance',
              description: 'Maximum speed, higher power use',
            },
            { value: 'balanced', label: 'Balanced', description: 'Recommended for most use cases' },
            { value: 'saver', label: 'Power Saver', description: 'Extends battery life' },
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

// ─── With disabled option ─────────────────────────────────────────────────────

export const WithDisabledOption: Story = {
  render: function DisabledOptStory() {
    const [value, setValue] = useState<string | undefined>(undefined);

    return (
      <div style={{ maxWidth: 240 }}>
        <Dropdown
          aria-label="Output device"
          placeholder="Select output"
          options={[
            { value: 'speakers', label: 'Speakers' },
            { value: 'headphones', label: 'Headphones' },
            { value: 'hdmi', label: 'HDMI', disabled: true },
            { value: 'bluetooth', label: 'Bluetooth', disabled: true },
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
    <div style={{ maxWidth: 240 }}>
      <Dropdown
        aria-label="Region"
        value="eu-west"
        disabled
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

// ─── Many options (scroll) ────────────────────────────────────────────────────

export const ManyOptions: Story = {
  render: function ManyStory() {
    const [value, setValue] = useState<string | undefined>(undefined);
    const timezones = [
      'Pacific/Honolulu',
      'America/Anchorage',
      'America/Los_Angeles',
      'America/Denver',
      'America/Chicago',
      'America/New_York',
      'America/Sao_Paulo',
      'Europe/London',
      'Europe/Paris',
      'Europe/Helsinki',
      'Africa/Nairobi',
      'Asia/Dubai',
      'Asia/Kolkata',
      'Asia/Bangkok',
      'Asia/Tokyo',
      'Australia/Sydney',
      'Pacific/Auckland',
    ];

    return (
      <div style={{ maxWidth: 260 }}>
        <Dropdown
          aria-label="Timezone"
          placeholder="Select timezone"
          options={timezones.map((tz) => ({ value: tz, label: tz }))}
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
        story: 'The list scrolls when there are more options than fit in 280 px.',
      },
    },
  },
};

// ─── In a form ────────────────────────────────────────────────────────────────

export const InForm: Story = {
  render: function FormStory() {
    const [lang, setLang] = useState('en');
    const [region, setRegion] = useState<string | undefined>(undefined);
    const [format, setFormat] = useState('24h');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 300 }}>
        {[
          {
            label: 'Language',
            el: (
              <Dropdown
                aria-label="Language"
                value={lang}
                onChange={setLang}
                options={[
                  { value: 'en', label: 'English' },
                  { value: 'es', label: 'Español' },
                  { value: 'fr', label: 'Français' },
                  { value: 'de', label: 'Deutsch' },
                ]}
              />
            ),
          },
          {
            label: 'Region',
            el: (
              <Dropdown
                aria-label="Region"
                placeholder="Select region"
                value={region}
                onChange={setRegion}
                options={[
                  { value: 'us', label: 'United States' },
                  { value: 'gb', label: 'United Kingdom' },
                  { value: 'es', label: 'Spain' },
                  { value: 'de', label: 'Germany' },
                ]}
              />
            ),
          },
          {
            label: 'Time format',
            el: (
              <Dropdown
                aria-label="Time format"
                value={format}
                onChange={setFormat}
                options={[
                  { value: '24h', label: '24-hour' },
                  { value: '12h', label: '12-hour (AM/PM)' },
                ]}
              />
            ),
          },
        ].map(({ label, el }) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Text variant="body" style={{ fontWeight: 600 }}>
              {label}
            </Text>
            {el}
          </div>
        ))}

        <Button variant="suggested" style={{ alignSelf: 'flex-end' }}>
          Apply
        </Button>
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};

// ─── Flat / toolbars ──────────────────────────────────────────────────────────

const sortOptions = [
  { value: 'name', label: 'Name' },
  { value: 'date', label: 'Date modified' },
  { value: 'size', label: 'Size' },
];

export const FlatAndToolbars: Story = {
  render: function FlatStory() {
    const [sort, setSort] = useState('name');
    const [view, setView] = useState('name');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 560 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Dropdown aria-label="Sort by" options={sortOptions} value={sort} onChange={setSort} />
          <Dropdown
            aria-label="Sort by (flat)"
            options={sortOptions}
            value={sort}
            onChange={setSort}
            flat
          />
        </div>

        <HeaderBar
          title="Files"
          end={
            <Dropdown aria-label="Sort by" options={sortOptions} value={sort} onChange={setSort} />
          }
        />

        <Toolbar>
          <Dropdown aria-label="Group by" options={sortOptions} value={view} onChange={setView} />
          <Spacer />
          <Dropdown
            aria-label="Sort by (raised)"
            options={sortOptions}
            value={sort}
            onChange={setSort}
            raised
          />
        </Toolbar>
      </div>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Top row: the regular trigger next to an explicitly `flat` one. Inside a `HeaderBar`, `Toolbar` or `ToolbarView` bar the dropdown becomes flat automatically; `raised` (right, in the toolbar) opts out. Mirrors the `GtkDropDown` `.flat` / `.raised` style classes from libadwaita 1.10.',
      },
    },
  },
};
