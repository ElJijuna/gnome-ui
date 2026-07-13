import { FolderDownload, ViewMore } from '@gnome-ui/icons';
import { Button, IconButton, Text } from '@gnome-ui/react';
import type { Meta, StoryObj } from '@storybook/react';

import { ChartCard } from './ChartCard';
import readme from './README.md?raw';

const series = [36, 44, 40, 58, 52, 68, 72, 64, 80, 92, 88, 104];

const DemoChart = () => {
  const max = Math.max(...series);

  return (
    <svg viewBox="0 0 320 150" role="img" aria-label="Demo sessions chart">
      <title>Demo sessions chart</title>
      <polyline
        fill="none"
        stroke="var(--gnome-accent-color, #3584e4)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={series
          .map((value, index) => {
            const x = (index / (series.length - 1)) * 300 + 10;
            const y = 135 - (value / max) * 110;

            return `${x},${y}`;
          })
          .join(' ')}
      />
    </svg>
  );
};

const meta: Meta<typeof ChartCard> = {
  title: 'Layout/ChartCard',
  component: ChartCard,
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
      <div style={{ width: 520 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ChartCard>;

export const Default: Story = {
  args: {
    title: 'Sessions',
    subtitle: 'Last 30 days',
    value: 12840,
    trend: { direction: 'up', value: 12, period: 'vs last month' },
    actions: (
      <>
        <IconButton icon={FolderDownload} aria-label="Export chart" tooltip="Export chart" />
        <IconButton icon={ViewMore} aria-label="More options" tooltip="More options" />
      </>
    ),
    children: <DemoChart />,
    footer: (
      <Text variant="caption" color="dim">
        Updated 2 minutes ago
      </Text>
    ),
  },
};

export const LoadingSkeleton: Story = {
  args: {
    title: 'Sessions',
    loading: true,
  },
};

export const LoadingSpinner: Story = {
  args: {
    title: 'Sessions',
    loading: true,
    loadingType: 'spinner',
  },
};

export const Empty: Story = {
  args: {
    title: 'Sessions',
    subtitle: 'Last 30 days',
    empty: (
      <Text variant="body" color="dim">
        No session data for this period
      </Text>
    ),
    actions: <Button variant="flat">Change range</Button>,
  },
};

export const Error: Story = {
  args: {
    title: 'Sessions',
    subtitle: 'Last 30 days',
    error: 'Could not load chart data',
    actions: <Button variant="flat">Retry</Button>,
  },
};
