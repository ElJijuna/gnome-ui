import { ActionRow, BoxedList, Text } from '@gnome-ui/react';
import type { Meta, StoryObj } from '@storybook/react';

import { PageContent } from './PageContent';
import readme from './README.md?raw';

const meta: Meta<typeof PageContent> = {
  title: 'Layout/PageContent',
  component: PageContent,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: readme,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof PageContent>;

export const Normal: Story = {
  render: () => (
    <PageContent maxWidth="md">
      <Text variant="title-2">Settings</Text>
      <BoxedList style={{ marginTop: 24 }}>
        <ActionRow title="Notifications" subtitle="Banners, sounds, and badges" />
        <ActionRow title="Privacy" subtitle="Location and camera access" />
        <ActionRow title="Appearance" subtitle="Style and accent colour" />
      </BoxedList>
    </PageContent>
  ),
};

export const FullWidth: Story = {
  render: () => (
    <PageContent maxWidth="none" padding="spacious">
      <Text variant="title-2">Dashboard</Text>
      <div
        style={{
          marginTop: 24,
          minHeight: 360,
          background: 'var(--gnome-view-bg-color)',
          border: '1px solid var(--gnome-border-subtle)',
          borderRadius: 12,
        }}
      />
    </PageContent>
  ),
};
