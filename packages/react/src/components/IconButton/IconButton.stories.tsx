import type { Meta, StoryObj } from "@storybook/react";
import { Delete, Refresh, Save, Search, Settings } from "@gnome-ui/icons";
import { IconButton } from "./IconButton";

const meta: Meta<typeof IconButton> = {
  title: "Components/IconButton",
  component: IconButton,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "suggested", "destructive", "flat", "raised", "osd"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    disabled: {
      control: "boolean",
    },
    tooltipPlacement: {
      control: "select",
      options: ["top", "bottom", "left", "right"],
    },
  },
  args: {
    icon: Search,
    label: "Search",
    variant: "default",
    size: "md",
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <IconButton icon={Search} label="Search" variant="default" />
      <IconButton icon={Save} label="Save" variant="suggested" />
      <IconButton icon={Delete} label="Delete" variant="destructive" />
      <IconButton icon={Settings} label="Settings" variant="flat" />
      <IconButton icon={Refresh} label="Refresh" variant="raised" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <IconButton icon={Search} label="Small search" size="sm" />
      <IconButton icon={Search} label="Search" size="md" />
      <IconButton icon={Search} label="Large search" size="lg" />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const WithTooltip: Story = {
  args: {
    tooltip: "Search files",
    tooltipPlacement: "bottom",
  },
};

export const Osd: Story = {
  args: {
    icon: Refresh,
    label: "Refresh preview",
    variant: "osd",
    tooltip: "Refresh preview",
  },
  decorators: [
    (Story) => (
      <div
        style={{
          alignItems: "center",
          background: "linear-gradient(135deg, #1f2937, #111827)",
          borderRadius: 8,
          display: "flex",
          justifyContent: "center",
          minHeight: 120,
          padding: 24,
        }}
      >
        <Story />
      </div>
    ),
  ],
};
