import { Button } from '@gnome-ui/react';
import type { Meta, StoryObj } from '@storybook/react';
import readme from './README.md?raw';
import { SectionHeader } from './SectionHeader';

const meta: Meta<typeof SectionHeader> = {
  title: 'Layout/SectionHeader',
  component: SectionHeader,
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
type Story = StoryObj<typeof SectionHeader>;

export const Basic: Story = {
  args: {
    title: 'Recent Activity',
  },
  parameters: {
    docs: {
      description: { story: 'Title only — the simplest usage.' },
    },
  },
};

export const WithSubtitle: Story = {
  args: {
    title: 'Recent Activity',
    subtitle: 'Last 24 hours',
  },
  parameters: {
    docs: {
      description: { story: 'Supporting text below the title for additional context.' },
    },
  },
};

export const WithAction: Story = {
  args: {
    title: 'Recent Activity',
    action: (
      <Button variant="flat" size="sm">
        View all
      </Button>
    ),
  },
  parameters: {
    docs: {
      description: { story: 'Trailing action slotted to the right edge.' },
    },
  },
};

export const Full: Story = {
  args: {
    title: 'Recent Activity',
    subtitle: 'Last 24 hours',
    action: (
      <Button variant="flat" size="sm">
        View all
      </Button>
    ),
  },
  parameters: {
    docs: {
      description: { story: 'All props: title, subtitle, and trailing action.' },
    },
  },
};

export const DashboardExample: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 600 }}>
      <div>
        <SectionHeader
          title="Recent Activity"
          subtitle="Last 24 hours"
          action={
            <Button variant="flat" size="sm">
              View all
            </Button>
          }
        />
        <div
          style={{
            marginTop: 12,
            height: 80,
            background: 'var(--gnome-card-bg-color, rgba(0,0,0,0.04))',
            borderRadius: 8,
          }}
        />
      </div>
      <div>
        <SectionHeader
          title="Installed Applications"
          action={
            <Button variant="flat" size="sm">
              Manage
            </Button>
          }
        />
        <div
          style={{
            marginTop: 12,
            height: 80,
            background: 'var(--gnome-card-bg-color, rgba(0,0,0,0.04))',
            borderRadius: 8,
          }}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Typical dashboard layout — each section has a `SectionHeader` ' +
          'above its content area.',
      },
    },
  },
};
