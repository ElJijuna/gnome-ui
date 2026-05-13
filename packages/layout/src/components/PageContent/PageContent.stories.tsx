import type { Meta, StoryObj } from "@storybook/react";
import { Text, BoxedList, ActionRow } from "@gnome-ui/react";
import { PageContent } from "./PageContent";

const meta: Meta<typeof PageContent> = {
  title: "Layout/PageContent",
  component: PageContent,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "Page content container with GNOME spacing and optional clamp.",
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
      <div style={{ marginTop: 24, minHeight: 360, background: "var(--gnome-view-bg-color)", border: "1px solid var(--gnome-border-subtle)", borderRadius: 12 }} />
    </PageContent>
  ),
};
