import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  GoHome, Search, Settings, Star, Delete,
  ViewMore, MediaPlay, Share, Add,
} from "@gnome-ui/icons";
import { Sidebar } from "./Sidebar";
import { SidebarSection } from "./SidebarSection";
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

Updated for **libadwaita 1.9 / GNOME 50**:

- **\`SidebarSection\`** — groups items under a named heading with a divider between sections.
- **\`suffix\`** — general trailing widget per item (button, badge, icon…); supersedes \`badge\`.
- **\`tooltip\`** — short label shown on hover, useful for truncated or icon-only rows.
- **\`menuItems\`** — per-item context menu on right-click or the \`Menu\` key.

All previous \`Sidebar\` / \`SidebarItem\` usage is fully backward compatible.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

// ─── Default (flat, backward compat) ──────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <Sidebar style={{ height: 320 }}>
      <SidebarSection>
        <SidebarItem icon={GoHome}    label="Home"     active />
        <SidebarItem icon={Star}      label="Starred" />
        <SidebarItem icon={Search}    label="Search" />
        <SidebarItem icon={Settings}  label="Settings" />
      </SidebarSection>
    </Sidebar>
  ),
  parameters: { controls: { disable: true } },
};

// ─── Sections ─────────────────────────────────────────────────────────────────

export const WithSections: Story = {
  render: function WithSectionsStory() {
    const [active, setActive] = useState("inbox");
    return (
      <Sidebar style={{ height: 400 }}>
        <SidebarSection title="Mailboxes">
          <SidebarItem icon={GoHome}    label="Inbox"   active={active === "inbox"}   onClick={() => setActive("inbox")}   suffix={<Badge variant="accent">12</Badge>} />
          <SidebarItem icon={Share}     label="Sent"    active={active === "sent"}    onClick={() => setActive("sent")} />
          <SidebarItem icon={Delete}    label="Trash"   active={active === "trash"}   onClick={() => setActive("trash")}  suffix={<Badge variant="neutral">4</Badge>} />
        </SidebarSection>
        <SidebarSection title="Tags">
          <SidebarItem icon={Star}      label="Work"     active={active === "work"}    onClick={() => setActive("work")} />
          <SidebarItem icon={Star}      label="Personal" active={active === "personal"} onClick={() => setActive("personal")} />
          <SidebarItem icon={Star}      label="Finance"  active={active === "finance"} onClick={() => setActive("finance")} />
        </SidebarSection>
        <SidebarSection title="Accounts">
          <SidebarItem icon={Settings}  label="alice@example.com" active={active === "alice"} onClick={() => setActive("alice")} />
          <SidebarItem icon={Settings}  label="bob@example.com"   active={active === "bob"}   onClick={() => setActive("bob")} />
        </SidebarSection>
      </Sidebar>
    );
  },
  parameters: { controls: { disable: true } },
};

// ─── Suffix ───────────────────────────────────────────────────────────────────

export const WithSuffix: Story = {
  render: () => (
    <Sidebar style={{ height: 320 }}>
      <SidebarSection>
        <SidebarItem icon={GoHome}   label="Inbox"    active suffix={<Badge variant="accent">12</Badge>} />
        <SidebarItem icon={Star}     label="Starred"         suffix={<Badge variant="neutral">4</Badge>} />
        <SidebarItem icon={MediaPlay} label="Podcasts"       suffix={
          <Button variant="flat" shape="circular" aria-label="New episode" style={{ width: 24, height: 24, minWidth: 0 }}>
            <Icon icon={Add} size="sm" aria-hidden />
          </Button>
        } />
        <SidebarItem icon={Settings} label="Settings" />
      </SidebarSection>
    </Sidebar>
  ),
  parameters: { controls: { disable: true } },
};

// ─── Tooltip ──────────────────────────────────────────────────────────────────

export const WithTooltips: Story = {
  render: () => (
    <Sidebar style={{ height: 280, width: 52 }}>
      <SidebarSection>
        <SidebarItem icon={GoHome}   label="" tooltip="Home"     active />
        <SidebarItem icon={Search}   label="" tooltip="Search" />
        <SidebarItem icon={Star}     label="" tooltip="Starred" />
        <SidebarItem icon={Settings} label="" tooltip="Settings" />
      </SidebarSection>
    </Sidebar>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: "Icon-only sidebar (narrow width). Hover to see the tooltip." },
    },
  },
};

// ─── Context menu ─────────────────────────────────────────────────────────────

export const WithContextMenu: Story = {
  render: function ContextMenuStory() {
    const [active, setActive] = useState("home");
    return (
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <Sidebar style={{ height: 280 }}>
          <SidebarSection>
            <SidebarItem
              icon={GoHome} label="Home" active={active === "home"} onClick={() => setActive("home")}
              menuItems={[
                { label: "Open in new window", onClick: () => alert("Open in new window") },
                { label: "Add to favourites",  onClick: () => alert("Add to favourites") },
              ]}
            />
            <SidebarItem
              icon={Star} label="Documents" active={active === "docs"} onClick={() => setActive("docs")}
              menuItems={[
                { label: "Rename",  onClick: () => alert("Rename") },
                { label: "Share",   onClick: () => alert("Share") },
                { label: "Delete",  onClick: () => alert("Delete"), destructive: true },
              ]}
            />
            <SidebarItem
              icon={Search} label="Search" active={active === "search"} onClick={() => setActive("search")}
              menuItems={[
                { label: "Clear history", onClick: () => alert("Clear history"), destructive: true },
              ]}
            />
            <SidebarItem icon={Settings} label="Settings" active={active === "settings"} onClick={() => setActive("settings")} />
          </SidebarSection>
        </Sidebar>
        <Text variant="caption" color="dim" style={{ paddingTop: 12 }}>
          Right-click an item to see its context menu.
        </Text>
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};

// ─── Collapsible (icon-only rail) ─────────────────────────────────────────────

export const Collapsible: Story = {
  render: function CollapsibleStory() {
    const [collapsed, setCollapsed] = useState(false);
    const [active, setActive] = useState("home");
    return (
      <div style={{ display: "flex", height: 320, border: "1px solid rgba(0,0,0,0.1)", borderRadius: 12, overflow: "hidden" }}>
        <Sidebar collapsed={collapsed} style={{ height: "100%" }}>
          <SidebarSection>
            <SidebarItem icon={GoHome}    label="Home"     active={active === "home"}     onClick={() => setActive("home")} />
            <SidebarItem icon={Star}      label="Starred"  active={active === "starred"}  onClick={() => setActive("starred")}  suffix={<Badge variant="accent">3</Badge>} />
            <SidebarItem icon={Search}    label="Search"   active={active === "search"}   onClick={() => setActive("search")} />
            <SidebarItem icon={Settings}  label="Settings" active={active === "settings"} onClick={() => setActive("settings")} />
          </SidebarSection>
        </Sidebar>
        <main style={{ flex: 1, padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          <Button variant="flat" onClick={() => setCollapsed((v) => !v)} style={{ alignSelf: "flex-start" }}>
            {collapsed ? "Expand sidebar" : "Collapse sidebar"}
          </Button>
          <Text variant="caption" color="dim">
            Active: <strong>{active}</strong>
          </Text>
        </main>
      </div>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Toggle `collapsed` to switch between full and icon-only (rail) mode. Tooltips appear automatically on hover when collapsed.",
      },
    },
  },
};

// ─── Full layout ──────────────────────────────────────────────────────────────

export const InLayout: Story = {
  render: function LayoutStory() {
    const [active, setActive] = useState("inbox");
    return (
      <div style={{ border: "1px solid rgba(0,0,0,0.1)", borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column", height: 440, maxWidth: 700 }}>
        <HeaderBar
          title="Mail"
          end={
            <Button variant="flat" aria-label="More options">
              <Icon icon={ViewMore} size="md" aria-hidden />
            </Button>
          }
        />
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <Sidebar style={{ height: "100%" }}>
            <SidebarSection title="Mailboxes">
              <SidebarItem icon={GoHome}  label="Inbox"  active={active === "inbox"}  onClick={() => setActive("inbox")}  suffix={<Badge variant="accent">12</Badge>}
                menuItems={[{ label: "Mark all as read", onClick: () => {} }, { label: "Empty folder", onClick: () => {}, destructive: true }]} />
              <SidebarItem icon={Share}   label="Sent"   active={active === "sent"}   onClick={() => setActive("sent")} />
              <SidebarItem icon={Delete}  label="Trash"  active={active === "trash"}  onClick={() => setActive("trash")} suffix={<Badge variant="neutral">4</Badge>}
                menuItems={[{ label: "Empty Trash", onClick: () => {}, destructive: true }]} />
            </SidebarSection>
            <SidebarSection title="Tags">
              <SidebarItem icon={Star} label="Work"     active={active === "work"}     onClick={() => setActive("work")}
                menuItems={[{ label: "Rename tag", onClick: () => {} }, { label: "Delete tag", onClick: () => {}, destructive: true }]} />
              <SidebarItem icon={Star} label="Personal" active={active === "personal"} onClick={() => setActive("personal")} />
            </SidebarSection>
          </Sidebar>
          <main style={{ flex: 1, padding: 24, overflow: "auto" }}>
            <Text variant="title-3" style={{ textTransform: "capitalize" }}>{active}</Text>
            <Text variant="body" color="dim" style={{ marginTop: 8 }}>
              Content area. Right-click sidebar items to see the context menu.
            </Text>
          </main>
        </div>
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};
