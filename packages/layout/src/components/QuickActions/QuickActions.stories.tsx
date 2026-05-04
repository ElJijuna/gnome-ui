import type { Meta, StoryObj } from "@storybook/react";
import { Icon } from "@gnome-ui/react";
import {
  Add,
  Copy,
  Delete,
  DocumentOpen,
  Edit,
  Printer,
  Save,
  Share,
} from "@gnome-ui/icons";
import { QuickActions } from "./QuickActions";

const meta: Meta<typeof QuickActions> = {
  title: "Layout/QuickActions",
  component: QuickActions,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
Grid of shortcut action buttons for dashboards, file managers, and control panels.

\`\`\`tsx
import { QuickActions } from "@gnome-ui/layout";

<QuickActions
  actions={[
    { id: "new-file", label: "New File", icon: <AddIcon />, onActivate: createFile },
    { id: "share", label: "Share", icon: <ShareIcon />, onActivate: share },
  ]}
/>
\`\`\`
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof QuickActions>;

const actions = [
  { id: "new-file", label: "New File", icon: <Icon icon={Add} size="lg" />, onActivate: () => {} },
  { id: "open", label: "Open", icon: <Icon icon={DocumentOpen} size="lg" />, onActivate: () => {} },
  { id: "save", label: "Save", icon: <Icon icon={Save} size="lg" />, onActivate: () => {} },
  { id: "share", label: "Share", icon: <Icon icon={Share} size="lg" />, onActivate: () => {} },
  { id: "duplicate", label: "Duplicate", icon: <Icon icon={Copy} size="lg" />, onActivate: () => {} },
  { id: "rename", label: "Rename", icon: <Icon icon={Edit} size="lg" />, onActivate: () => {} },
  { id: "print", label: "Print", icon: <Icon icon={Printer} size="lg" />, onActivate: () => {} },
  { id: "delete", label: "Delete", icon: <Icon icon={Delete} size="lg" />, disabled: true, onActivate: () => {} },
];

export const DashboardShortcuts: Story = {
  args: {
    actions,
    columns: 4,
  },
  render: (args) => (
    <div style={{ width: 520 }}>
      <QuickActions {...args} />
    </div>
  ),
};

export const ThreeColumns: Story = {
  args: {
    actions: actions.slice(0, 6),
    columns: 3,
  },
  render: (args) => (
    <div style={{ width: 420 }}>
      <QuickActions {...args} />
    </div>
  ),
};
