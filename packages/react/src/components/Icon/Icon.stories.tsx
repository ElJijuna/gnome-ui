import type { Meta, StoryObj } from "@storybook/react";
import * as Icons from "@gnome-ui/icons";
import { Icon } from "./Icon";
import { Text } from "../Text";

const meta: Meta<typeof Icon> = {
  title: "Components/Icon",
  component: Icon,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Renders an [\`@gnome-ui/icons\`](https://www.npmjs.com/package/@gnome-ui/icons) definition as an inline SVG.

Icons are **framework-agnostic** path data objects — the \`Icon\` component is the React adapter.
Uses \`currentColor\` so the icon automatically inherits the parent's text color.

### Guidelines
- Pass \`label\` only when the icon stands alone (no sibling text). Otherwise omit it — the icon is marked \`aria-hidden\`.
- Use \`size="sm"\` (12 px) for dense UIs, \`"md"\` (16 px, default) for inline icons, \`"lg"\` (20 px) for standalone icons.
- Pair with \`<Button variant="flat">\` for icon buttons in header bars.

### Usage
\`\`\`tsx
import { Icon } from "@gnome-ui/react";
import { Search } from "@gnome-ui/icons";

<Icon icon={Search} size="md" label="Search" />
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    label: { control: "text" },
  },
  args: {
    icon: Icons.Search,
    size: "md",
  },
};

export default meta;
type Story = StoryObj<typeof Icon>;

// ─── Default ───────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: { icon: Icons.Search, label: "Search" },
};

// ─── All sizes ─────────────────────────────────────────────────────────────────

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      {(["sm", "md", "lg"] as const).map((s) => (
        <div key={s} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <Icon icon={Icons.Search} size={s} label="Search" />
          <Text variant="caption" color="dim">{s}</Text>
        </div>
      ))}
    </div>
  ),
  parameters: { controls: { disable: true } },
};

// ─── Inherits color ────────────────────────────────────────────────────────────

export const InheritsColor: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16 }}>
      {(["#3584e4", "#e01b24", "#2ec27e", "#f6d32d", "#9141ac"] as const).map((color) => (
        <span key={color} style={{ color, display: "flex" }}>
          <Icon icon={Icons.Star} size="lg" label="Star" />
        </span>
      ))}
    </div>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Icons use `currentColor` — set `color` on the parent to tint them.",
      },
    },
  },
};

// ─── Full icon gallery ─────────────────────────────────────────────────────────

const GALLERY: Array<{ name: string; icon: Icons.IconDefinition }> = [
  // Navigation
  { name: "GoPrevious",       icon: Icons.GoPrevious },
  { name: "GoNext",           icon: Icons.GoNext },
  { name: "GoHome",           icon: Icons.GoHome },
  { name: "GoUp",             icon: Icons.GoUp },
  { name: "PanDown",          icon: Icons.PanDown },
  { name: "PanUp",            icon: Icons.PanUp },
  { name: "PanStart",         icon: Icons.PanStart },
  { name: "PanEnd",           icon: Icons.PanEnd },
  // Actions
  { name: "Add",              icon: Icons.Add },
  { name: "Remove",           icon: Icons.Remove },
  { name: "Delete",           icon: Icons.Delete },
  { name: "Edit",             icon: Icons.Edit },
  { name: "Copy",             icon: Icons.Copy },
  { name: "Paste",            icon: Icons.Paste },
  { name: "Cut",              icon: Icons.Cut },
  { name: "Undo",             icon: Icons.Undo },
  { name: "Redo",             icon: Icons.Redo },
  { name: "Save",             icon: Icons.Save },
  { name: "DocumentOpen",     icon: Icons.DocumentOpen },
  { name: "Close",            icon: Icons.Close },
  { name: "Search",           icon: Icons.Search },
  { name: "Refresh",          icon: Icons.Refresh },
  { name: "Share",            icon: Icons.Share },
  { name: "Attachment",       icon: Icons.Attachment },
  // UI
  { name: "OpenMenu",         icon: Icons.OpenMenu },
  { name: "ViewMore",         icon: Icons.ViewMore },
  { name: "ViewSidebar",      icon: Icons.ViewSidebar },
  { name: "Settings",         icon: Icons.Settings },
  // Status
  { name: "Information",      icon: Icons.Information },
  { name: "Warning",          icon: Icons.Warning },
  { name: "Error",            icon: Icons.Error },
  { name: "Check",            icon: Icons.Check },
  // Misc
  { name: "Star",             icon: Icons.Star },
  { name: "StarOutline",      icon: Icons.StarOutline },
  // Media
  { name: "MediaPlay",        icon: Icons.MediaPlay },
  { name: "MediaPause",       icon: Icons.MediaPause },
  { name: "MediaSkipForward", icon: Icons.MediaSkipForward },
  { name: "MediaSkipBackward",icon: Icons.MediaSkipBackward },
];

export const Gallery: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
      {GALLERY.map(({ name, icon }) => (
        <div
          key={name}
          title={name}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            padding: "12px 10px",
            width: 88,
            borderRadius: 8,
          }}
        >
          <Icon icon={icon} size="lg" label={name} />
          <Text variant="caption" color="dim" style={{ textAlign: "center", wordBreak: "break-word" }}>
            {name}
          </Text>
        </div>
      ))}
    </div>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: "All 38 icons available in `@gnome-ui/icons`." },
    },
  },
};
