import type { Meta, StoryObj } from "@storybook/react";
import { Text } from "@gnome-ui/react";
import { StatusBar } from "./StatusBar";

const meta: Meta<typeof StatusBar> = {
  title: "Layout/StatusBar",
  component: StatusBar,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "Compact footer/status bar for application shells.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof StatusBar>;

export const Basic: Story = {
  render: () => (
    <StatusBar trailing={<Text variant="caption" color="dim">GNOME Files 48.0</Text>}>
      <Text variant="caption" color="dim">1,248 items</Text>
    </StatusBar>
  ),
};
