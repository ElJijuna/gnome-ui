import type { Meta, StoryObj } from "@storybook/react";
import { Button, SidebarSection, SidebarItem, Text } from "@gnome-ui/react";
import { GoHome, Settings, Star } from "@gnome-ui/icons";
import { SidebarShell } from "./SidebarShell";

const meta: Meta<typeof SidebarShell> = {
  title: "Layout/SidebarShell",
  component: SidebarShell,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "Full-height GNOME sidebar with fixed header/footer and scrollable navigation.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof SidebarShell>;

export const Standard: Story = {
  render: () => (
    <div style={{ height: "100vh" }}>
      <SidebarShell
        header={<Text variant="heading">Files</Text>}
        footer={<Button variant="flat" style={{ width: "100%" }}>Preferences</Button>}
        aria-label="Files navigation"
      >
        <SidebarSection>
          <SidebarItem label="Home" icon={GoHome} active />
          <SidebarItem label="Starred" icon={Star} />
          <SidebarItem label="Settings" icon={Settings} />
        </SidebarSection>
      </SidebarShell>
    </div>
  ),
};

export const Collapsed: Story = {
  render: () => (
    <div style={{ height: "100vh" }}>
      <SidebarShell collapsed aria-label="Files navigation">
        <SidebarSection>
          <SidebarItem label="Home" icon={GoHome} active />
          <SidebarItem label="Starred" icon={Star} />
          <SidebarItem label="Settings" icon={Settings} />
        </SidebarSection>
      </SidebarShell>
    </div>
  ),
};

export const Searchable: Story = {
  render: () => (
    <div style={{ height: "100vh" }}>
      <SidebarShell searchable header={<Text variant="heading">Files</Text>}>
        <SidebarSection>
          <SidebarItem label="Home" icon={GoHome} active />
          <SidebarItem label="Starred" icon={Star} />
          <SidebarItem label="Settings" icon={Settings} />
        </SidebarSection>
      </SidebarShell>
    </div>
  ),
};
