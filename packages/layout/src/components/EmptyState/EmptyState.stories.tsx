import type { Meta, StoryObj } from "@storybook/react";
import { Button, Icon } from "@gnome-ui/react";
import { Folder, Search } from "@gnome-ui/icons";
import { EmptyState } from "./EmptyState";

const meta: Meta<typeof EmptyState> = {
  title: "Layout/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
Centered empty-state illustration for views with no data.

No card background or border — intended to fill its parent container.

\`\`\`tsx
import { EmptyState } from "@gnome-ui/layout";
import { Icon } from "@gnome-ui/react";
import { Folder } from "@gnome-ui/icons";

<EmptyState
  icon={<Icon icon={Folder} size="lg" />}
  title="No files yet"
  description="Files you add will appear here."
  action={<Button variant="suggested">Add File</Button>}
/>
\`\`\`
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Basic: Story = {
  args: {
    title: "No files yet",
    description: "Files you add will appear here.",
  },
  parameters: {
    docs: { description: { story: "Minimal empty state — no icon, no action." } },
  },
};

export const WithIcon: Story = {
  args: {
    icon: <Icon icon={Folder} size="lg" />,
    title: "No files yet",
    description: "Files you add will appear here.",
  },
  parameters: {
    docs: { description: { story: "Icon is rendered large and muted (40 % opacity) above the title." } },
  },
};

export const WithAction: Story = {
  args: {
    icon: <Icon icon={Folder} size="lg" />,
    title: "No files yet",
    description: "Files you add will appear here.",
    action: <Button variant="suggested">Add File</Button>,
  },
  parameters: {
    docs: { description: { story: "Full empty state with icon, description, and a call-to-action button." } },
  },
};

export const NoDescription: Story = {
  args: {
    icon: <Icon icon={Search} size="lg" />,
    title: "No results found",
    action: <Button variant="flat">Clear filters</Button>,
  },
  parameters: {
    docs: { description: { story: "Empty state without a description — common for search/filter contexts." } },
  },
};
