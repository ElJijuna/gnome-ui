import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  GoHome, Search, Settings, Star, Delete,
  ViewMore, MediaPlay,
} from "@gnome-ui/icons";
import { Sidebar } from "./Sidebar";
import { SidebarItem } from "./SidebarItem";
import { Badge } from "../Badge";
import { HeaderBar } from "../HeaderBar";
import { Button } from "../Button";
import { Icon } from "../Icon";
import { Text } from "../Text";

const meta: Meta<typeof Sidebar> = {
  title: "Components/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
Lateral navigation panel following the Adwaita \`.navigation-sidebar\` pattern.

Compose \`Sidebar\` with \`SidebarItem\` for each navigation entry.

### Guidelines
- Use for apps with 3–7 top-level views.
- Keep labels short — one or two words.
- Only one item should be \`active\` at a time; set \`aria-current="page"\` automatically via the prop.
- Place the sidebar on the **leading** side (left in LTR layouts).
- Use the \`badge\` prop to show unread counts or status dots.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

// ─── Default ───────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <Sidebar style={{ height: 320 }}>
      <SidebarItem icon={GoHome}    label="Home"     active />
      <SidebarItem icon={Star}      label="Starred" />
      <SidebarItem icon={Search}    label="Search" />
      <SidebarItem icon={Settings}  label="Settings" />
    </Sidebar>
  ),
  parameters: { controls: { disable: true } },
};

// ─── With badges ──────────────────────────────────────────────────────────────

export const WithBadges: Story = {
  render: () => (
    <Sidebar style={{ height: 320 }}>
      <SidebarItem icon={GoHome}   label="Inbox"  active badge={<Badge variant="accent">12</Badge>} />
      <SidebarItem icon={Star}     label="Starred" />
      <SidebarItem icon={Delete}   label="Trash"  badge={<Badge variant="neutral">4</Badge>} />
      <SidebarItem icon={Settings} label="Settings" />
    </Sidebar>
  ),
  parameters: { controls: { disable: true } },
};

// ─── No icons ─────────────────────────────────────────────────────────────────

export const NoIcons: Story = {
  render: () => (
    <Sidebar style={{ height: 240 }}>
      <SidebarItem label="All Notes"   active />
      <SidebarItem label="Favourites" />
      <SidebarItem label="Archive" />
      <SidebarItem label="Trash" />
    </Sidebar>
  ),
  parameters: { controls: { disable: true } },
};

// ─── Controlled ───────────────────────────────────────────────────────────────

export const Controlled: Story = {
  render: function ControlledStory() {
    const items = [
      { id: "home",     label: "Home",    icon: GoHome },
      { id: "music",    label: "Music",   icon: MediaPlay },
      { id: "starred",  label: "Starred", icon: Star },
      { id: "settings", label: "Settings",icon: Settings },
    ];
    const [active, setActive] = useState("home");

    return (
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        <Sidebar style={{ height: 280 }}>
          {items.map(({ id, label, icon }) => (
            <SidebarItem
              key={id}
              icon={icon}
              label={label}
              active={active === id}
              onClick={() => setActive(id)}
            />
          ))}
        </Sidebar>
        <div style={{ padding: "12px 0" }}>
          <Text variant="body" color="dim">Active: <strong>{active}</strong></Text>
        </div>
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};

// ─── In a full layout ─────────────────────────────────────────────────────────

export const InLayout: Story = {
  render: function LayoutStory() {
    const items = [
      { id: "home",     label: "Home",    icon: GoHome },
      { id: "search",   label: "Search",  icon: Search },
      { id: "starred",  label: "Starred", icon: Star, badge: <Badge variant="accent">3</Badge> },
      { id: "settings", label: "Settings",icon: Settings },
    ];
    const [active, setActive] = useState("home");

    return (
      <div
        style={{
          border: "1px solid rgba(0,0,0,0.1)",
          borderRadius: 12,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          height: 400,
          maxWidth: 640,
        }}
      >
        <HeaderBar
          title={items.find(i => i.id === active)?.label ?? ""}
          end={
            <Button variant="flat" aria-label="More options">
              <Icon icon={ViewMore} size="md" aria-hidden />
            </Button>
          }
        />
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <Sidebar style={{ height: "100%" }}>
            {items.map(({ id, label, icon, badge }) => (
              <SidebarItem
                key={id}
                icon={icon}
                label={label}
                active={active === id}
                badge={badge}
                onClick={() => setActive(id)}
              />
            ))}
          </Sidebar>
          <main style={{ flex: 1, padding: 24, overflow: "auto" }}>
            <Text variant="title-3">{items.find(i => i.id === active)?.label}</Text>
            <Text variant="body" color="dim" style={{ marginTop: 8 }}>
              Content area for the selected view.
            </Text>
          </main>
        </div>
      </div>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Sidebar inside a full app layout with HeaderBar and content area.",
      },
    },
  },
};
