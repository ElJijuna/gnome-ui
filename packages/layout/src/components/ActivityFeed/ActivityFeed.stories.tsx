import type { Meta, StoryObj } from '@storybook/react';

import { ActivityFeed } from './ActivityFeed';
import readme from './README.md?raw';

const meta: Meta<typeof ActivityFeed> = {
  title: 'Layout/ActivityFeed',
  component: ActivityFeed,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: readme,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ActivityFeed>;

const now = Date.now();

const SAMPLE_ITEMS = [
  {
    id: '1',
    label: 'User logged in',
    description: 'admin@example.com',
    timestamp: new Date(now - 2 * 60_000),
  },
  {
    id: '2',
    label: 'File uploaded',
    description: 'report-q1.pdf · 2.4 MB',
    timestamp: new Date(now - 18 * 60_000),
  },
  {
    id: '3',
    label: 'Settings updated',
    timestamp: new Date(now - 2 * 3600_000),
  },
  {
    id: '4',
    label: 'New member joined',
    description: 'maria@example.com',
    timestamp: new Date(now - 5 * 3600_000),
  },
  {
    id: '5',
    label: 'Backup completed',
    description: 'All 1,248 files backed up',
    timestamp: new Date(now - 86400_000),
  },
  {
    id: '6',
    label: 'Deployment finished',
    description: 'v2.4.1 → production',
    timestamp: new Date(now - 2 * 86400_000),
  },
];

export const Basic: Story = {
  args: {
    items: SAMPLE_ITEMS,
  },
  parameters: {
    docs: {
      description: { story: 'Full feed with labels, descriptions, and relative timestamps.' },
    },
  },
};

export const WithMaxItems: Story = {
  args: {
    items: SAMPLE_ITEMS,
    maxItems: 3,
  },
  parameters: {
    docs: {
      description: {
        story:
          '`maxItems={3}` truncates the list and shows a "Show N more" button. ' +
          'Clicking it expands the full feed.',
      },
    },
  },
};

export const LoadingSkeleton: Story = {
  args: {
    items: [],
    loading: true,
    loadingType: 'skeleton',
  },
  parameters: {
    docs: {
      description: { story: 'Default loading state — animated skeleton rows.' },
    },
  },
};

export const LoadingSpinner: Story = {
  args: {
    items: [],
    loading: true,
    loadingType: 'spinner',
  },
  parameters: {
    docs: {
      description: {
        story: '`loadingType="spinner"` renders a centred spinner instead of skeleton rows.',
      },
    },
  },
};

export const Empty: Story = {
  args: {
    items: [],
    emptyState: (
      <p
        style={{
          textAlign: 'center',
          color: 'var(--gnome-dim-label-color, rgba(0,0,0,0.45))',
          margin: 0,
        }}
      >
        No recent activity
      </p>
    ),
  },
  parameters: {
    docs: {
      description: { story: 'Custom `emptyState` content shown when the items array is empty.' },
    },
  },
};

export const NoDescriptions: Story = {
  args: {
    items: SAMPLE_ITEMS.map(({ description: _d, ...rest }) => rest),
  },
  parameters: {
    docs: {
      description: { story: 'Items with label and timestamp only — `description` is optional.' },
    },
  },
};
