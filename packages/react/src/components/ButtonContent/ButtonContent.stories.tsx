import type { Meta, StoryObj } from "@storybook/react";
import { ButtonContent } from "./ButtonContent";
import { Button } from "../Button";
import { Icon } from "../Icon";
import { DocumentOpen, Save, Delete, Copy, GoNext } from "@gnome-ui/icons";

const meta: Meta<typeof ButtonContent> = {
  title: "Components/ButtonContent",
  component: ButtonContent,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Icon + label layout helper for buttons that contain both an icon and text.

Pass as the \`children\` of a \`Button\` to get the correct Adwaita spacing
between the icon and the label (6 px gap, icon vertically centred with the text).

Mirrors \`AdwButtonContent\`.

### Usage
- Use inside \`<Button>\` when you need both icon and text.
- Set \`iconPosition="end"\` to place the icon after the label.
        `,
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    label: { control: "text" },
    iconPosition: { control: "radio", options: ["start", "end"] },
  },
  args: {
    label: "Open",
    iconPosition: "start",
  },
};

export default meta;
type Story = StoryObj<typeof ButtonContent>;

// ─── Default ───────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: (args) => (
    <Button>
      <ButtonContent {...args} icon={<Icon icon={DocumentOpen} />} />
    </Button>
  ),
};

// ─── Icon positions ────────────────────────────────────────────────────────────

export const IconPositions: Story = {
  render: () => (
    <>
      <Button>
        <ButtonContent icon={<Icon icon={Save} />} label="Save" iconPosition="start" />
      </Button>
      <Button>
        <ButtonContent icon={<Icon icon={GoNext} />} label="Next" iconPosition="end" />
      </Button>
    </>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Icon before the label (`iconPosition=\"start\"`) and icon after (`iconPosition=\"end\"`).",
      },
    },
  },
};

// ─── Variants ─────────────────────────────────────────────────────────────────

export const ButtonVariants: Story = {
  render: () => (
    <>
      <Button variant="suggested">
        <ButtonContent icon={<Icon icon={Save} />} label="Save" />
      </Button>
      <Button variant="destructive">
        <ButtonContent icon={<Icon icon={Delete} />} label="Delete" />
      </Button>
      <Button variant="flat">
        <ButtonContent icon={<Icon icon={Copy} />} label="Copy" />
      </Button>
    </>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "`ButtonContent` inside `suggested`, `destructive`, and `flat` button variants.",
      },
    },
  },
};
