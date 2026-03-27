import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { GoHome, Settings, Star, Share } from "@gnome-ui/icons";
import {
  Toolbar,
  Spacer,
  Button,
  SearchBar,
  Avatar,
  Popover,
  Sidebar,
  SidebarSection,
  SidebarItem,
  Card,
  BoxedList,
  ActionRow,
  ExpanderRow,
  Badge,
  Text,
  InlineViewSwitcher,
  InlineViewSwitcherItem,
  StatusPage,
  Switch,
} from "../../index";

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Menu item inside the avatar popover dropdown. */
function AvatarMenuItem({
  label,
  destructive = false,
  onClick,
}: {
  label: string;
  destructive?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "block",
        width: "100%",
        padding: "8px 12px",
        background: "transparent",
        border: "none",
        borderRadius: 6,
        font: "inherit",
        fontSize: "0.9375rem",
        textAlign: "start",
        cursor: "pointer",
        color: destructive
          ? "var(--gnome-destructive-color, #e01b24)"
          : "var(--gnome-window-fg-color, rgba(0,0,0,0.8))",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
          "var(--gnome-hover-overlay)")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
          "transparent")
      }
    >
      {label}
    </button>
  );
}

// ─── Dashboard component ───────────────────────────────────────────────────────

function Dashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [contentView, setContentView] = useState("grid");

  const navItems = [
    { id: "home",     label: "Home",     icon: GoHome,   badge: null },
    { id: "starred",  label: "Starred",  icon: Star,     badge: 3 },
    { id: "shared",   label: "Shared",   icon: Share,    badge: null },
    { id: "settings", label: "Settings", icon: Settings, badge: null },
  ];

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      background: "var(--gnome-window-bg-color, #fafafa)",
      fontFamily: "var(--gnome-font-family)",
      overflow: "hidden",
    }}>

      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div style={{
        background: "var(--gnome-headerbar-bg-color, #ebebeb)",
        borderBottom: "1px solid var(--gnome-headerbar-border-color, rgba(0,0,0,0.12))",
        flexShrink: 0,
      }}>
        <Toolbar style={{ minHeight: 48, padding: "0 8px" }}>

          {/* Left — toggle + logo + app name */}
          <Button
            variant="flat"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setSidebarCollapsed((v) => !v)}
            style={{ minWidth: "unset" }}
          >
            <span style={{ display: "flex", alignItems: "center" }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                <rect x="2" y="4" width="14" height="1.5" rx="0.75" fill="currentColor" />
                <rect x="2" y="8.25" width="14" height="1.5" rx="0.75" fill="currentColor" />
                <rect x="2" y="12.5" width="14" height="1.5" rx="0.75" fill="currentColor" />
              </svg>
            </span>
          </Button>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 8 }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "var(--gnome-accent-bg-color, #3584e4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="white" aria-hidden>
                <path d="M8 2L14 6V14H2V6L8 2Z" />
              </svg>
            </div>
            <Text variant="heading" style={{ whiteSpace: "nowrap" }}>
              Files
            </Text>
          </div>

          <Spacer />

          {/* Center — search */}
          <div style={{
            flex: "1 1 auto",
            maxWidth: 480,
            display: "flex",
            alignItems: "center",
            background: "var(--gnome-card-bg-color, #fff)",
            borderRadius: "var(--gnome-radius-md)",
            border: "1px solid var(--gnome-light-3, #deddda)",
            overflow: "hidden",
          }}>
            <SearchBar
              inline
              open
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClose={() => setSearchQuery("")}
              onClear={() => setSearchQuery("")}
              placeholder="Search files…"
              aria-label="Search"
              style={{ width: "100%" }}
            />
          </div>

          <Spacer />

          {/* Right — action buttons + avatar dropdown */}
          <Button variant="flat" aria-label="Refresh" style={{ minWidth: "unset" }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path d="M9 3a6 6 0 1 0 5.66 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              <path d="M14 3v4h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </Button>

          <Button variant="flat" aria-label="Share" style={{ minWidth: "unset" }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              <circle cx="14" cy="4" r="2" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="4"  cy="9" r="2" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="14" cy="14" r="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M6 10.5l6 2M6 7.5l6-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </Button>

          <Popover
            placement="bottom"
            content={
              <div style={{ minWidth: 180 }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px 8px",
                  borderBottom: "1px solid var(--gnome-divider-color, rgba(0,0,0,0.08))",
                  marginBottom: 4,
                }}>
                  <Avatar name="Ada Lovelace" size="sm" />
                  <div>
                    <Text variant="body" style={{ fontWeight: 600, lineHeight: 1.2 }}>Ada Lovelace</Text>
                    <Text variant="caption" color="dim">ada@gnome.org</Text>
                  </div>
                </div>
                <AvatarMenuItem label="View Profile" onClick={() => alert("profile")} />
                <AvatarMenuItem label="Account Settings" onClick={() => alert("settings")} />
                <div style={{ height: 1, background: "var(--gnome-divider-color, rgba(0,0,0,0.08))", margin: "4px 0" }} />
                <AvatarMenuItem label="Sign Out" destructive onClick={() => alert("sign out")} />
              </div>
            }
          >
            <button
              type="button"
              aria-label="User menu"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 2,
                borderRadius: "50%",
                display: "flex",
              }}
            >
              <Avatar name="Ada Lovelace" size="sm" />
            </button>
          </Popover>
        </Toolbar>
      </div>

      {/* ── Body (sidebar + content) ─────────────────────────────────────── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Sidebar — uses built-in collapsed prop */}
        <Sidebar collapsed={sidebarCollapsed} style={{ height: "100%" }}>
          <SidebarSection>
            {navItems.map(({ id, label, icon, badge }) => (
              <SidebarItem
                key={id}
                label={label}
                icon={icon}
                active={activeNav === id}
                suffix={badge ? <Badge variant="accent">{badge}</Badge> : undefined}
                onClick={() => setActiveNav(id)}
              />
            ))}
          </SidebarSection>
        </Sidebar>

        {/* Main content */}
        <main style={{
          flex: 1,
          overflowY: "auto",
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}>

          {/* Content header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Text variant="title-2">
              {navItems.find((n) => n.id === activeNav)?.label ?? "Home"}
            </Text>
            <InlineViewSwitcher
              value={contentView}
              onValueChange={setContentView}
              aria-label="Layout"
            >
              <InlineViewSwitcherItem name="grid"    label="Grid" />
              <InlineViewSwitcherItem name="list"    label="List" />
              <InlineViewSwitcherItem name="details" label="Details" />
            </InlineViewSwitcher>
          </div>

          {activeNav === "home" && (
            <>
              {/* Summary cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16 }}>
                {[
                  { label: "Documents",  value: "1 248",   accent: false },
                  { label: "Starred",    value: "3",       accent: true  },
                  { label: "Shared",     value: "24",      accent: false },
                  { label: "Trash",      value: "7 items", accent: false },
                ].map(({ label, value, accent }) => (
                  <Card key={label} style={{ padding: 20 }}>
                    <Text variant="caption" color="dim">{label}</Text>
                    <Text
                      variant="title-2"
                      style={{ color: accent ? "var(--gnome-accent-color, #3584e4)" : undefined }}
                    >
                      {value}
                    </Text>
                  </Card>
                ))}
              </div>

              {/* Recent files */}
              <div>
                <Text variant="caption-heading" color="dim" style={{ marginBottom: 8, paddingLeft: 4 }}>
                  Recent
                </Text>
                <BoxedList>
                  <ActionRow
                    interactive
                    title="Project Proposal.odt"
                    subtitle="Modified 2 hours ago · 142 KB"
                    onClick={() => {}}
                  />
                  <ActionRow
                    interactive
                    title="Budget 2026.ods"
                    subtitle="Modified yesterday · 38 KB"
                    onClick={() => {}}
                  />
                  <ActionRow
                    interactive
                    title="Presentation.odp"
                    subtitle="Modified 3 days ago · 2.4 MB"
                    onClick={() => {}}
                  />
                </BoxedList>
              </div>

              {/* Expandable section */}
              <div>
                <Text variant="caption-heading" color="dim" style={{ marginBottom: 8, paddingLeft: 4 }}>
                  Devices
                </Text>
                <BoxedList>
                  <ExpanderRow title="Home Server" subtitle="Connected · 1.2 TB free" defaultExpanded>
                    <ActionRow variant="property" title="Hostname"    subtitle="homeserver.local" />
                    <ActionRow variant="property" title="Protocol"    subtitle="SMB / CIFS" />
                    <ActionRow variant="property" title="Mount point" subtitle="/mnt/home" />
                  </ExpanderRow>
                  <ExpanderRow title="USB Drive" subtitle="32 GB · FAT32">
                    <ActionRow variant="property" title="Capacity" subtitle="32 GB" />
                    <ActionRow variant="property" title="Used"     subtitle="14.2 GB" />
                  </ExpanderRow>
                </BoxedList>
              </div>
            </>
          )}

          {activeNav === "settings" && (
            <BoxedList>
              <ActionRow title="Auto-sync" subtitle="Keep files up to date automatically" trailing={<Switch defaultChecked aria-label="Auto-sync" />} />
              <ActionRow title="Show hidden files" trailing={<Switch aria-label="Hidden files" />} />
              <ActionRow title="Sort by name" trailing={<Switch defaultChecked aria-label="Sort by name" />} />
            </BoxedList>
          )}

          {(activeNav === "starred" || activeNav === "shared") && (
            <StatusPage
              compact
              icon={activeNav === "starred" ? Star : Share}
              title={activeNav === "starred" ? "No Starred Files" : "Nothing Shared"}
              description={
                activeNav === "starred"
                  ? "Star files to access them quickly from here."
                  : "Files you share with others will appear here."
              }
            />
          )}
        </main>
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer style={{
        flexShrink: 0,
        borderTop: "1px solid var(--gnome-headerbar-border-color, rgba(0,0,0,0.12))",
        background: "var(--gnome-headerbar-bg-color, #ebebeb)",
      }}>
        <Toolbar style={{ minHeight: 36, padding: "0 16px" }}>
          <Text variant="caption" color="dim">
            1 248 items · 48.3 GB used of 1 TB
          </Text>
          <Spacer />
          <Text variant="caption" color="dim">
            GNOME Files 48.0
          </Text>
        </Toolbar>
      </footer>
    </div>
  );
}

// ─── Meta ──────────────────────────────────────────────────────────────────────

const meta: Meta = {
  title: "Layout/Dashboard",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
Full-page dashboard layout demonstrating the composition of components following
the GNOME Human Interface Guidelines.

**Includes:**
- \`Toolbar\` with logo, inline \`SearchBar\`, action buttons, and avatar \`Popover\`
- Collapsible \`Sidebar\` with \`SidebarItem\`, \`Badge\`, and auto-tooltip on collapse
- Content area with \`Card\`, \`BoxedList\`, \`ActionRow\`, \`ExpanderRow\`, \`InlineViewSwitcher\`, and \`StatusPage\`
- Footer \`Toolbar\` with status text

**Toggle the sidebar** with the hamburger button at the top-left.
**Switch navigation sections** with the sidebar items.
        `,
      },
    },
  },
};

export default meta;

export const Default: StoryObj = {
  render: () => <Dashboard />,
  parameters: { controls: { disable: true } },
};
