import type { Meta, StoryObj } from '@storybook/react';

import { ProfileCard } from './ProfileCard';
import readme from './README.md?raw';

const meta: Meta<typeof ProfileCard> = {
  title: 'Layout/ProfileCard',
  component: ProfileCard,
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
type Story = StoryObj<typeof ProfileCard>;

export const Default: Story = {
  args: {
    name: 'rcronald',
    username: '@rcronald',
  },
};

export const WithStatus: Story = {
  args: {
    name: 'rcronald',
    username: '@rcronald',
    status: 'online',
  },
};

export const WithStats: Story = {
  args: {
    name: 'rcronald',
    username: '@rcronald',
    status: 'online',
    stats: [
      { label: 'posts', value: 127 },
      { label: 'followers', value: '2.4k' },
      { label: 'following', value: 84 },
    ],
  },
};

export const WithBackgroundChart: Story = {
  args: {
    name: 'rcronald',
    username: '@rcronald',
    status: 'online',
    stats: [
      { label: 'posts', value: 127 },
      { label: 'followers', value: '2.4k' },
    ],
    backgroundChart: (
      <svg viewBox="0 0 320 96" preserveAspectRatio="none" height="96" aria-hidden="true">
        <path
          d="M0 80 C40 70 60 60 90 50 C120 38 140 55 170 40 C200 24 230 48 270 30 C290 22 305 18 320 14 V96 H0 Z"
          fill="color-mix(in srgb, var(--gnome-accent-bg-color, #3584e4) 24%, transparent)"
        />
        <path
          d="M0 80 C40 70 60 60 90 50 C120 38 140 55 170 40 C200 24 230 48 270 30 C290 22 305 18 320 14"
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
          '`backgroundChart` accepts any decorative `ReactNode`. Use `SparkAreaChart` from `@gnome-ui/charts` for data-driven charts.',
      },
    },
  },
};

export const StatusVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      {(['online', 'away', 'busy', 'offline'] as const).map((s) => (
        <ProfileCard
          key={s}
          name="rcronald"
          username="@rcronald"
          status={s}
          style={{ minWidth: 200 }}
        />
      ))}
    </div>
  ),
};

export const LoadingSkeleton: Story = {
  args: {
    name: '',
    username: '',
    loading: true,
    loadingType: 'skeleton',
  },
  parameters: {
    docs: {
      description: { story: 'Default loading state — skeleton placeholder.' },
    },
  },
};

export const LoadingSpinner: Story = {
  args: {
    name: '',
    username: '',
    loading: true,
    loadingType: 'spinner',
  },
  parameters: {
    docs: {
      description: {
        story: '`loadingType="spinner"` renders a centred spinner instead.',
      },
    },
  },
};
