import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Highlight } from './Highlight';
import readme from './README.md?raw';

const meta: Meta<typeof Highlight> = {
  title: 'Components/Highlight',
  component: Highlight,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: readme,
      },
    },
  },
  argTypes: {
    text: { control: 'text' },
    caseSensitive: { control: 'boolean' },
  },
  args: {
    text: 'Preferences for accessibility',
    query: 'access',
    caseSensitive: false,
  },
};

export default meta;
type Story = StoryObj<typeof Highlight>;

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {};

// ─── Multiple terms ─────────────────────────────────────────────────────────────

export const MultipleTerms: Story = {
  args: {
    text: 'The quick brown fox jumps over the lazy dog',
    query: ['quick', 'fox', 'lazy'],
  },
};

// ─── No match ───────────────────────────────────────────────────────────────────

export const NoMatch: Story = {
  args: {
    text: 'Preferences for accessibility',
    query: 'network',
  },
};

// ─── Case sensitive ─────────────────────────────────────────────────────────────

export const CaseSensitive: Story = {
  args: {
    text: 'GNOME vs Gnome vs gnome',
    query: 'Gnome',
    caseSensitive: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'With `caseSensitive`, only the exactly-cased occurrence is highlighted.',
      },
    },
  },
};

// ─── Search results list ────────────────────────────────────────────────────────

export const SearchResultsList: Story = {
  render: function SearchStory() {
    const [query, setQuery] = useState('access');
    const items = [
      'Accessibility settings',
      'Network and internet access',
      'Screen reader shortcuts',
      'Universal access preferences',
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 340 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search settings…"
          style={{ padding: '6px 10px' }}
        />
        <ul style={{ margin: 0, paddingInlineStart: 20 }}>
          {items
            .filter((item) => item.toLowerCase().includes(query.toLowerCase()))
            .map((item) => (
              <li key={item}>
                <Highlight text={item} query={query} />
              </li>
            ))}
        </ul>
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};
