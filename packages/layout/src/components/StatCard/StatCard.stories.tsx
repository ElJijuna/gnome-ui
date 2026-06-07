import { Applications, Error, Person, Refresh } from '@gnome-ui/icons';
import { Icon } from '@gnome-ui/react';
import type { Meta, StoryObj } from '@storybook/react';
import readme from './README.md?raw';
import { StatCard } from './StatCard';

const meta: Meta<typeof StatCard> = {
  title: 'Layout/StatCard',
  component: StatCard,
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
type Story = StoryObj<typeof StatCard>;

export const UpTrend: Story = {
  args: {
    label: 'Active Users',
    value: 1284,
    unit: 'users',
    icon: <Icon icon={Person} size="lg" />,
    trend: { direction: 'up', value: 12, period: 'vs last week' },
  },
};

export const DownTrend: Story = {
  args: {
    label: 'Error Rate',
    value: 2.4,
    unit: '%',
    icon: <Icon icon={Error} size="lg" />,
    trend: { direction: 'down', value: -8, period: 'vs yesterday' },
  },
};

export const NeutralTrend: Story = {
  args: {
    label: 'Latency',
    value: 42,
    unit: 'ms',
    icon: <Icon icon={Refresh} size="lg" />,
    trend: { direction: 'neutral', value: 0, period: 'stable' },
  },
};

export const BackgroundChart: Story = {
  args: {
    label: 'Requests',
    value: '24.8k',
    unit: 'req',
    trend: { direction: 'up', value: 6, period: 'today' },
    backgroundChart: (
      <svg viewBox="0 0 320 96" preserveAspectRatio="none" height="96" aria-hidden="true">
        <path
          d="M0 76 C32 66 46 74 68 56 C92 36 112 62 136 42 C160 22 178 54 206 34 C234 14 264 40 320 10 V96 H0 Z"
          fill="color-mix(in srgb, var(--gnome-accent-bg-color, #3584e4) 24%, transparent)"
        />
        <path
          d="M0 76 C32 66 46 74 68 56 C92 36 112 62 136 42 C160 22 178 54 206 34 C234 14 264 40 320 10"
          fill="none"
          stroke="var(--gnome-accent-color, #3584e4)"
          strokeWidth="2"
        />
      </svg>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          '`backgroundChart` accepts a decorative React node, including spark charts from `@gnome-ui/charts`.',
      },
    },
  },
};

export const LoadingSkeleton: Story = {
  args: {
    label: 'Requests',
    value: 0,
    loading: true,
    loadingType: 'skeleton',
    icon: <Icon icon={Applications} size="lg" />,
  },
  parameters: {
    docs: {
      description: {
        story: 'Default loading state — skeleton placeholder matching the card shape.',
      },
    },
  },
};

export const LoadingSpinner: Story = {
  args: {
    label: 'Requests',
    value: 0,
    loading: true,
    loadingType: 'spinner',
    icon: <Icon icon={Applications} size="lg" />,
  },
  parameters: {
    docs: {
      description: {
        story: '`loadingType="spinner"` renders a centred spinner instead of skeleton blocks.',
      },
    },
  },
};

export const Dashboard: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: 16,
        width: 880,
      }}
    >
      <StatCard
        label="Active Users"
        value={1284}
        unit="users"
        icon={<Icon icon={Person} size="lg" />}
        trend={{ direction: 'up', value: 12, period: 'vs last week' }}
      />
      <StatCard
        label="Requests"
        value="24.8k"
        icon={<Icon icon={Applications} size="lg" />}
        trend={{ direction: 'up', value: 6, period: 'today' }}
      />
      <StatCard
        label="Error Rate"
        value={2.4}
        unit="%"
        icon={<Icon icon={Error} size="lg" />}
        trend={{ direction: 'down', value: -8, period: 'vs yesterday' }}
      />
      <StatCard
        label="Latency"
        value={42}
        unit="ms"
        icon={<Icon icon={Refresh} size="lg" />}
        trend={{ direction: 'neutral', value: 0, period: 'stable' }}
      />
    </div>
  ),
};
