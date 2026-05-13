import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { SidebarTrigger } from "./SidebarTrigger";

const meta: Meta<typeof SidebarTrigger> = {
  title: "Layout/SidebarTrigger",
  component: SidebarTrigger,
  parameters: {
    docs: {
      description: {
        component: "Header button that opens overlay sidebars on narrow screens and toggles rail collapse on wider screens.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof SidebarTrigger>;

export const Basic: Story = {
  render: function BasicStory() {
    const [open, setOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    return (
      <SidebarTrigger
        sidebarOpen={open}
        sidebarCollapsed={collapsed}
        onSidebarOpenChange={setOpen}
        onSidebarCollapsedChange={setCollapsed}
      />
    );
  },
};
