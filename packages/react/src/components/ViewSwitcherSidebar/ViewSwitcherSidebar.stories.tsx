import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ViewSwitcherSidebar } from "./ViewSwitcherSidebar";
import { ViewSwitcherSidebarItem } from "./ViewSwitcherSidebarItem";
import { HeaderBar } from "../HeaderBar";
import { Text } from "../Text";
import { Badge } from "../Badge";
import { GoHome, Star, Search, Settings, MediaPlay, Delete, Add } from "@gnome-ui/icons";

const meta: Meta<typeof ViewSwitcherSidebar> = {
  title: "Components/ViewSwitcherSidebar",
  component: ViewSwitcherSidebar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
Sidebar-style view switcher for apps with many top-level views or when the
sidebar layout fits better than a header-bar \`ViewSwitcher\`.

Mirrors \`AdwViewSwitcherSidebar\` (libadwaita 1.9 / GNOME 50) — the modern
replacement for \`GtkStackSidebar\`.

### When to use
- More than 4 top-level views (where \`ViewSwitcher\` in a HeaderBar becomes cramped).
- Apps whose primary navigation is already sidebar-shaped (mail, files, contacts).
- When views need additional metadata like unread counts (\`count\`) or custom widgets (\`suffix\`).

### vs \`Sidebar\`
| | \`Sidebar\` | \`ViewSwitcherSidebar\` |
|---|---|---|
| Semantics | \`nav\` + \`aria-current\` | \`radiogroup\` + \`aria-checked\` |
| Keyboard | Tab between items | ↑ / ↓ within group |
| Use for | App-level navigation | Switching between views/pages |
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ViewSwitcherSidebar>;

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: function DefaultStory() {
    const [view, setView] = useState("home");
    return (
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        <ViewSwitcherSidebar value={view} onValueChange={setView} style={{ height: 280 }}>
          <ViewSwitcherSidebarItem name="home"     label="Home"     icon={GoHome} />
          <ViewSwitcherSidebarItem name="starred"  label="Starred"  icon={Star} />
          <ViewSwitcherSidebarItem name="search"   label="Search"   icon={Search} />
          <ViewSwitcherSidebarItem name="settings" label="Settings" icon={Settings} />
        </ViewSwitcherSidebar>
        <Text variant="body" color="dim" style={{ paddingTop: 12 }}>
          Active: <strong>{view}</strong>
        </Text>
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};

// ─── With counts ──────────────────────────────────────────────────────────────

export const WithCounts: Story = {
  render: function WithCountsStory() {
    const [view, setView] = useState("inbox");
    return (
      <ViewSwitcherSidebar value={view} onValueChange={setView} style={{ height: 280 }}>
        <ViewSwitcherSidebarItem name="inbox"  label="Inbox"    icon={GoHome}   count={12} />
        <ViewSwitcherSidebarItem name="drafts" label="Drafts"   icon={Add}      count={3} />
        <ViewSwitcherSidebarItem name="sent"   label="Sent"     icon={Star} />
        <ViewSwitcherSidebarItem name="trash"  label="Trash"    icon={Delete}   count={104} />
      </ViewSwitcherSidebar>
    );
  },
  parameters: { controls: { disable: true } },
};

// ─── With suffix ──────────────────────────────────────────────────────────────

export const WithSuffix: Story = {
  render: function WithSuffixStory() {
    const [view, setView] = useState("music");
    return (
      <ViewSwitcherSidebar value={view} onValueChange={setView} style={{ height: 280 }}>
        <ViewSwitcherSidebarItem name="music"    label="Music"    icon={MediaPlay}
          suffix={<Badge variant="accent">New</Badge>} />
        <ViewSwitcherSidebarItem name="podcasts" label="Podcasts" icon={Star} />
        <ViewSwitcherSidebarItem name="radio"    label="Radio"    icon={Search} />
        <ViewSwitcherSidebarItem name="settings" label="Settings" icon={Settings} />
      </ViewSwitcherSidebar>
    );
  },
  parameters: { controls: { disable: true } },
};

// ─── In a full layout ─────────────────────────────────────────────────────────

export const InLayout: Story = {
  render: function InLayoutStory() {
    const [view, setView] = useState("inbox");

    const content: Record<string, string> = {
      inbox:  "Your inbox — 12 unread messages.",
      drafts: "3 unsent drafts.",
      sent:   "Messages you have sent.",
      trash:  "Deleted messages. They will be purged after 30 days.",
    };

    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        border: "1px solid rgba(0,0,0,0.1)",
        borderRadius: 12,
        overflow: "hidden",
        height: 420,
        maxWidth: 680,
      }}>
        <HeaderBar title="Mail" />
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <ViewSwitcherSidebar
            value={view}
            onValueChange={setView}
            style={{ height: "100%" }}
          >
            <ViewSwitcherSidebarItem name="inbox"  label="Inbox"  icon={GoHome}   count={12} />
            <ViewSwitcherSidebarItem name="drafts" label="Drafts" icon={Add}      count={3} />
            <ViewSwitcherSidebarItem name="sent"   label="Sent"   icon={Star} />
            <ViewSwitcherSidebarItem name="trash"  label="Trash"  icon={Delete} />
          </ViewSwitcherSidebar>
          <main style={{ flex: 1, padding: 24, overflow: "auto" }}>
            <Text variant="title-3" style={{ textTransform: "capitalize" }}>{view}</Text>
            <Text variant="body" color="dim" style={{ marginTop: 8 }}>
              {content[view]}
            </Text>
          </main>
        </div>
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};
