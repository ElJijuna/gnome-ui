import { DriveHarddisk } from '@gnome-ui/icons';
import { Icon } from '@gnome-ui/react';
import type { Meta, StoryObj } from '@storybook/react';

import { ProgressCard } from './ProgressCard';
import readme from './README.md?raw';

const meta: Meta<typeof ProgressCard> = {
  title: 'Layout/ProgressCard',
  component: ProgressCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: readme,
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ProgressCard>;

// ─── Normal (<75%) ────────────────────────────────────────────────────────────

export const Normal: Story = {
  args: {
    label: 'Storage',
    used: 42.5,
    total: 128,
    unit: 'GB',
  },
  parameters: {
    docs: { description: { story: 'Below 75% — accent fill.' } },
  },
};

// ─── Warning (≥75%) ───────────────────────────────────────────────────────────

export const Warning: Story = {
  args: {
    label: 'Storage',
    used: 80,
    total: 100,
    unit: 'GB',
  },
  parameters: {
    docs: { description: { story: '75%–89% — warning fill.' } },
  },
};

// ─── Critical (≥90%) ──────────────────────────────────────────────────────────

export const Critical: Story = {
  args: {
    label: 'Storage',
    used: 95,
    total: 100,
    unit: 'GB',
  },
  parameters: {
    docs: { description: { story: '90%+ — error fill.' } },
  },
};

// ─── With Icon ────────────────────────────────────────────────────────────────

export const WithIcon: Story = {
  args: {
    label: 'Storage',
    used: 42.5,
    total: 128,
    unit: 'GB',
    icon: <Icon icon={DriveHarddisk} size="sm" />,
  },
  parameters: {
    docs: { description: { story: 'Optional leading icon rendered as decorative.' } },
  },
};

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

export const LoadingSkeleton: Story = {
  args: {
    label: 'Storage',
    used: 0,
    total: 128,
    unit: 'GB',
    loading: true,
  },
  parameters: {
    docs: { description: { story: 'Default skeleton loading state.' } },
  },
};

// ─── Loading Spinner ──────────────────────────────────────────────────────────

export const LoadingSpinner: Story = {
  args: {
    label: 'Storage',
    used: 0,
    total: 128,
    unit: 'GB',
    loading: true,
    loadingType: 'spinner',
  },
  parameters: {
    docs: { description: { story: 'Spinner loading state.' } },
  },
};

// ─── All Thresholds ───────────────────────────────────────────────────────────

export const AllThresholds: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 320 }}>
      <ProgressCard label="Documents" used={30} total={100} unit="GB" />
      <ProgressCard label="Downloads" used={78} total={100} unit="GB" />
      <ProgressCard
        label="System"
        used={93}
        total={100}
        unit="GB"
        icon={<Icon icon={DriveHarddisk} size="sm" />}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: { story: 'Normal, warning, and critical thresholds side by side.' },
    },
  },
};
