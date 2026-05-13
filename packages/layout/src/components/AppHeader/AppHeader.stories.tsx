import type { Meta, StoryObj } from "@storybook/react";
import { Button, SearchBar, Text, ViewSwitcher, ViewSwitcherItem } from "@gnome-ui/react";
import { AppHeader } from "./AppHeader";
import { Layout } from "../Layout";
import { PageContent } from "../PageContent";
import { StatusBar } from "../StatusBar";

const meta: Meta<typeof AppHeader> = {
  title: "Layout/AppHeader",
  component: AppHeader,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "GNOME application header with named shell slots.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof AppHeader>;

export const Basic: Story = {
  args: {
    title: "Files",
    subtitle: "Home",
    leading: <Button variant="flat" aria-label="Toggle sidebar">☰</Button>,
    actions: <Button variant="flat">New Folder</Button>,
  },
};

export const WithNavigationAndSearch: Story = {
  args: {
    title: "Documents",
    leading: <Button variant="flat" aria-label="Back">‹</Button>,
    navigation: (
      <ViewSwitcher aria-label="Document view">
        <ViewSwitcherItem label="Recent" active />
        <ViewSwitcherItem label="Starred" />
      </ViewSwitcher>
    ),
    search: <SearchBar inline open placeholder="Search documents" aria-label="Search documents" />,
    actions: <Button variant="flat" aria-label="Open menu">⋮</Button>,
  },
};

export const InLayout: Story = {
  render: () => (
    <Layout
      header={
        <AppHeader
          title="Files"
          subtitle="Home"
          leading={<Button variant="flat" aria-label="Toggle sidebar">☰</Button>}
          actions={<Button variant="flat">New Folder</Button>}
        />
      }
      footer={
        <StatusBar trailing={<Text variant="caption" color="dim">GNOME Files 48.0</Text>}>
          <Text variant="caption" color="dim">1,248 items</Text>
        </StatusBar>
      }
    >
      <PageContent as="section" maxWidth="md">
        <Text variant="title-2">Home</Text>
        <Text variant="body" color="dim" style={{ marginTop: 12 }}>
          Application shell using the phase 2 layout primitives.
        </Text>
      </PageContent>
    </Layout>
  ),
};
