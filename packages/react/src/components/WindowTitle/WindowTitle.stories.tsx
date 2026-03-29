import type { Meta, StoryObj } from "@storybook/react";
import { WindowTitle } from "./WindowTitle";
import { HeaderBar } from "../HeaderBar";
import { Button } from "../Button";
import { Icon } from "../Icon";
import { DocumentOpen } from "@gnome-ui/icons";

const meta: Meta<typeof WindowTitle> = {
  title: "Components/WindowTitle",
  component: WindowTitle,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Two-line title + subtitle widget for use inside a \`HeaderBar\`.

Pass as the \`title\` prop of \`HeaderBar\` to display a centred two-line header
with an app name and current document/view name.

Mirrors \`AdwWindowTitle\`.

### Usage
- \`title\` is the primary bold line (e.g. app name or current view).
- \`subtitle\` is the secondary dimmed line below (e.g. file path or context).
- Omit \`subtitle\` for a single-line header.
        `,
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 600 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    title: { control: "text" },
    subtitle: { control: "text" },
  },
  args: {
    title: "Files",
    subtitle: "/home/user/Documents",
  },
};

export default meta;
type Story = StoryObj<typeof WindowTitle>;

// ─── Default (in HeaderBar) ────────────────────────────────────────────────────

export const Default: Story = {
  render: (args) => (
    <HeaderBar title={<WindowTitle {...args} />} />
  ),
};

// ─── Title only ────────────────────────────────────────────────────────────────

export const TitleOnly: Story = {
  render: () => (
    <HeaderBar title={<WindowTitle title="Settings" />} />
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Without a `subtitle`, renders a single centred line — identical to a plain string title.",
      },
    },
  },
};

// ─── With actions ─────────────────────────────────────────────────────────────

export const WithActions: Story = {
  render: () => (
    <HeaderBar
      title={<WindowTitle title="Text Editor" subtitle="Untitled Document" />}
      start={<Button variant="flat"><Icon icon={DocumentOpen} /></Button>}
      end={<Button variant="suggested">Save</Button>}
    />
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Typical header bar with start/end action buttons and a two-line `WindowTitle` in the centre.",
      },
    },
  },
};

// ─── Long subtitle truncation ─────────────────────────────────────────────────

export const LongSubtitle: Story = {
  render: () => (
    <HeaderBar
      title={
        <WindowTitle
          title="Files"
          subtitle="/home/user/Documents/Projects/my-very-long-project-name/src/components"
        />
      }
    />
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Long subtitles are truncated with an ellipsis to prevent overflowing the header bar.",
      },
    },
  },
};
