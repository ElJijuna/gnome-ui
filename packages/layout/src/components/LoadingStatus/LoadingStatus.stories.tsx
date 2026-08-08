import { Card, Skeleton } from '@gnome-ui/react';
import type { Meta, StoryObj } from '@storybook/react';
import { LoadingStatus } from './LoadingStatus';
import readme from './README.md?raw';

const meta: Meta<typeof LoadingStatus> = {
  title: 'Layout/LoadingStatus',
  component: LoadingStatus,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: readme,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof LoadingStatus>;

export const Default: Story = {
  args: {},
};

export const CustomLabel: Story = {
  args: { label: 'Fetching results…' },
};

export const InASkeletonCard: StoryObj = {
  render: () => (
    <Card style={{ width: 220 }} aria-busy="true">
      <LoadingStatus />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <Skeleton variant="rect" width={110} height={14} />
        <Skeleton variant="circle" size={30} />
      </div>
      <Skeleton variant="rect" width={150} height={34} style={{ marginBottom: 8 }} />
      <Skeleton variant="rect" width={120} height={14} />
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'How `StatCard`, `EntityCard`, `ProfileCard`, and others pair it with `Skeleton`: the skeletons are visual only (`aria-hidden`), while `LoadingStatus` is the part a screen reader actually announces.',
      },
    },
  },
};
