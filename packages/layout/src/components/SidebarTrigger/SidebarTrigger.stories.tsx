import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import readme from './README.md?raw';
import { SidebarTrigger } from './SidebarTrigger';

const meta: Meta<typeof SidebarTrigger> = {
  title: 'Layout/SidebarTrigger',
  component: SidebarTrigger,
  parameters: {
    docs: {
      description: {
        component: readme,
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
