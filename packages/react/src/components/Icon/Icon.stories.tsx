import { useState } from "react";
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
    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
      {(["sm", "md", "lg"] as const).map((s) => (
        <div key={s} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <Icon icon={Icons.Search} size={s} label="Search" />
          <Text variant="caption" color="dim">{s} · {s === "sm" ? 12 : s === "md" ? 16 : 20}px</Text>
        </div>
      ))}
    </div>
  ),
  parameters: { controls: { disable: true } },
};

// ─── Inherits color ────────────────────────────────────────────────────────────

export const InheritsColor: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      {(["#3584e4", "#e01b24", "#2ec27e", "#f6d32d", "#9141ac", "currentColor"] as const).map((color) => (
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

const CATEGORIES: Array<{ title: string; items: Array<{ name: string; icon: Icons.IconDefinition }> }> = [
  {
    title: "Navigation",
    items: [
      { name: "GoPrevious",  icon: Icons.GoPrevious },
      { name: "GoNext",      icon: Icons.GoNext },
      { name: "GoHome",      icon: Icons.GoHome },
      { name: "GoUp",        icon: Icons.GoUp },
      { name: "PanDown",     icon: Icons.PanDown },
      { name: "PanUp",       icon: Icons.PanUp },
      { name: "PanStart",    icon: Icons.PanStart },
      { name: "PanEnd",      icon: Icons.PanEnd },
    ],
  },
  {
    title: "Actions",
    items: [
      { name: "Add",          icon: Icons.Add },
      { name: "Remove",       icon: Icons.Remove },
      { name: "Delete",       icon: Icons.Delete },
      { name: "Edit",         icon: Icons.Edit },
      { name: "Copy",         icon: Icons.Copy },
      { name: "Paste",        icon: Icons.Paste },
      { name: "Cut",          icon: Icons.Cut },
      { name: "Undo",         icon: Icons.Undo },
      { name: "Redo",         icon: Icons.Redo },
      { name: "Save",         icon: Icons.Save },
      { name: "DocumentOpen", icon: Icons.DocumentOpen },
      { name: "Close",        icon: Icons.Close },
      { name: "Search",       icon: Icons.Search },
      { name: "Refresh",      icon: Icons.Refresh },
      { name: "Share",        icon: Icons.Share },
      { name: "Attachment",   icon: Icons.Attachment },
    ],
  },
  {
    title: "UI",
    items: [
      { name: "OpenMenu",    icon: Icons.OpenMenu },
      { name: "ViewMore",    icon: Icons.ViewMore },
      { name: "ViewSidebar", icon: Icons.ViewSidebar },
      { name: "ViewReveal",  icon: Icons.ViewReveal },
      { name: "ViewConceal", icon: Icons.ViewConceal },
      { name: "Settings",    icon: Icons.Settings },
    ],
  },
  {
    title: "Status",
    items: [
      { name: "Information", icon: Icons.Information },
      { name: "Warning",     icon: Icons.Warning },
      { name: "Error",       icon: Icons.Error },
      { name: "Check",       icon: Icons.Check },
    ],
  },
  {
    title: "People & Identity",
    items: [
      { name: "Person",        icon: Icons.Person },
      { name: "Accessibility", icon: Icons.Accessibility },
    ],
  },
  {
    title: "System & Hardware",
    items: [
      { name: "Applications",   icon: Icons.Applications },
      { name: "Notifications",  icon: Icons.Notifications },
      { name: "InputMouse",     icon: Icons.InputMouse },
      { name: "InputKeyboard",  icon: Icons.InputKeyboard },
      { name: "InputTablet",    icon: Icons.InputTablet },
      { name: "ColorManagement",icon: Icons.ColorManagement },
      { name: "Printer",        icon: Icons.Printer },
      { name: "Lock",           icon: Icons.Lock },
    ],
  },
  {
    title: "Misc",
    items: [
      { name: "Star",        icon: Icons.Star },
      { name: "StarOutline", icon: Icons.StarOutline },
      { name: "Heart",       icon: Icons.Heart },
    ],
  },
  {
    title: "Media",
    items: [
      { name: "MediaPlay",         icon: Icons.MediaPlay },
      { name: "MediaPause",        icon: Icons.MediaPause },
      { name: "MediaSkipForward",  icon: Icons.MediaSkipForward },
      { name: "MediaSkipBackward", icon: Icons.MediaSkipBackward },
    ],
  },
];

const TOTAL = CATEGORIES.reduce((n, c) => n + c.items.length, 0);

function IconTile({ name, icon }: { name: string; icon: Icons.IconDefinition }) {
  const [copied, setCopied] = useState(false);

  function handleClick() {
    navigator.clipboard.writeText(`import { ${name} } from "@gnome-ui/icons";`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <button
      type="button"
      title={`${name} — click to copy import`}
      onClick={handleClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        padding: "12px 8px 10px",
        width: 92,
        background: copied
          ? "var(--gnome-accent-bg-color, #3584e4)"
          : "transparent",
        color: copied
          ? "var(--gnome-accent-fg-color, #fff)"
          : "inherit",
        border: "1.5px solid transparent",
        borderRadius: 8,
        cursor: "pointer",
        font: "inherit",
        transition: "background 120ms ease, color 120ms ease",
      }}
      onMouseEnter={(e) => {
        if (!copied) (e.currentTarget as HTMLButtonElement).style.background = "var(--gnome-hover-overlay, rgba(0,0,0,.06))";
      }}
      onMouseLeave={(e) => {
        if (!copied) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
      }}
    >
      <Icon icon={icon} size="lg" label={name} />
      <span style={{
        fontSize: "0.7rem",
        lineHeight: 1.3,
        textAlign: "center",
        wordBreak: "break-word",
        fontFamily: "var(--gnome-font-family, sans-serif)",
        opacity: copied ? 1 : 0.7,
      }}>
        {copied ? "Copied!" : name}
      </span>
    </button>
  );
}

export const Gallery: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 32, padding: 8 }}>
      <Text variant="caption" color="dim">
        {TOTAL} icons — click any icon to copy its import statement.
      </Text>

      {CATEGORIES.map(({ title, items }) => (
        <div key={title}>
          <Text
            variant="caption-heading"
            color="dim"
            style={{ marginBottom: 8, paddingLeft: 4, display: "block" }}
          >
            {title}
          </Text>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {items.map(({ name, icon }) => (
              <IconTile key={name} name={name} icon={icon} />
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: `All **${TOTAL} icons** from \`@gnome-ui/icons\`, grouped by category. Click any icon to copy its import statement to the clipboard.`,
      },
    },
  },
};

// ─── simple-icons example ──────────────────────────────────────────────────────

// A real siGithub object from `simple-icons` — inlined here so the package
// is not a required dev dependency of this stories file.
const siGithub = {
  title: "GitHub",
  slug: "github",
  hex: "181717",
  source: "https://github.com",
  svg: "",
  path: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
};

export const SimpleIconsExample: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      <Icon icon={siGithub} size="sm" label="GitHub" />
      <Icon icon={siGithub} size="md" label="GitHub" />
      <Icon icon={siGithub} size="lg" label="GitHub" />
    </div>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: `Pass any \`simple-icons\` icon (or plain \`{ path }\` object) directly to \`icon\`.
The viewBox defaults to \`"0 0 24 24"\` — the simple-icons standard.

\`\`\`tsx
import { siGithub } from "simple-icons";
<Icon icon={siGithub} label="GitHub" />
\`\`\``,
      },
    },
  },
};
