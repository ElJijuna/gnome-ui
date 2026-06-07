import { Button } from '@gnome-ui/react';
import type { Meta, StoryObj } from '@storybook/react';

import { ErrorState } from './ErrorState';
import readme from './README.md?raw';

const meta: Meta<typeof ErrorState> = {
  title: 'Layout/ErrorState',
  component: ErrorState,
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
type Story = StoryObj<typeof ErrorState>;

export const Generic: Story = {
  args: {
    type: 'generic',
    description: 'An unexpected error occurred.',
    action: <Button variant="suggested">Try again</Button>,
  },
};

export const Network: Story = {
  args: {
    type: 'network',
    description: 'Check your connection and try again.',
    action: <Button variant="suggested">Retry</Button>,
  },
};

export const Permission: Story = {
  args: {
    type: 'permission',
    description: "You don't have permission to view this resource.",
  },
};

export const NotFound: Story = {
  args: {
    type: 'not-found',
    description: "The page or resource you're looking for doesn't exist.",
    action: <Button variant="flat">Go back</Button>,
  },
};

export const CustomTitle: Story = {
  args: {
    type: 'network',
    title: 'Server unreachable',
    description: 'The server is not responding. Try again later.',
    action: <Button variant="suggested">Retry</Button>,
  },
  parameters: {
    docs: { description: { story: '`title` overrides the preset default.' } },
  },
};

export const AllPresets: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 280px)', gap: 24 }}>
      <ErrorState type="generic" description="An unexpected error occurred." />
      <ErrorState type="network" description="Check your connection." />
      <ErrorState type="permission" description="Contact your administrator." />
      <ErrorState type="not-found" description="The resource doesn't exist." />
    </div>
  ),
  parameters: {
    docs: { description: { story: 'All four presets side by side.' } },
  },
};
