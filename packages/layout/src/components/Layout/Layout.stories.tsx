import { useState, type ReactNode } from "react";
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
  BoxedList,
  ActionRow,
  ExpanderRow,
  Badge,
  Text,
  InlineViewSwitcher,
  InlineViewSwitcherItem,
  StatusPage,
  Switch,
  Box,
  WrapBox,
} from "@gnome-ui/react";
import { Layout } from "./Layout";
import { AppHeader as ShellAppHeader } from "../AppHeader";
import { CounterCard } from "../CounterCard";
import { PageContent } from "../PageContent";
import { SidebarShell } from "../SidebarShell";
import { SidebarTrigger } from "../SidebarTrigger";
import { StatusBar } from "../StatusBar";
import { UserCard } from "../UserCard";

// ─── Helpers ───────────────────────────────────────────────────────────────────

const userActions = [
  { label: "View Profile",     onClick: () => alert("profile")  },
  { label: "Account Settings", onClick: () => alert("settings") },
  { label: "Sign Out",         onClick: () => alert("sign out"), variant: "destructive" as const },
];

const sidebarBreakpointQuery = {
  narrow: "(max-width: 400px)",
  medium: "(max-width: 550px)",
  wide: "(max-width: 860px)",
} as const;

function isSidebarOverlay(breakpoint: keyof typeof sidebarBreakpointQuery = "narrow") {
  return typeof window !== "undefined" &&
    window.matchMedia(sidebarBreakpointQuery[breakpoint]).matches;
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function AppHeader({
  sidebarCollapsed,
  onToggleSidebar,
  searchQuery,
  onSearchChange,
}: {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  searchQuery: string;
  onSearchChange: (v: string) => void;
}) {
  return (
    <Toolbar style={{ minHeight: 48, padding: "0 8px" }}>
      <Button
        variant="flat"
        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        onClick={onToggleSidebar}
        style={{ minWidth: "unset" }}
      >
        <span style={{ display: "flex", alignItems: "center" }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            <rect x="2" y="4"    width="14" height="1.5" rx="0.75" fill="currentColor" />
            <rect x="2" y="8.25" width="14" height="1.5" rx="0.75" fill="currentColor" />
            <rect x="2" y="12.5" width="14" height="1.5" rx="0.75" fill="currentColor" />
          </svg>
        </span>
      </Button>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 8 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: "var(--gnome-accent-bg-color, #3584e4)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="white" aria-hidden>
            <path d="M8 2L14 6V14H2V6L8 2Z" />
          </svg>
        </div>
        <Text variant="heading" style={{ whiteSpace: "nowrap" }}>Files</Text>
      </div>

      <Spacer />

      <div style={{
        flex: "1 1 auto", maxWidth: 480,
        display: "flex", alignItems: "center",
        background: "var(--gnome-card-bg-color, #fff)",
        borderRadius: "var(--gnome-radius-md)",
        border: "1px solid var(--gnome-light-3, #deddda)",
        overflow: "hidden",
      }}>
        <SearchBar
          inline open
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onClose={() => onSearchChange("")}
          onClear={() => onSearchChange("")}
          placeholder="Search files…"
          aria-label="Search"
          style={{ width: "100%" }}
        />
      </div>

      <Spacer />

      <Button variant="flat" aria-label="Refresh" style={{ minWidth: "unset" }}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
          <path d="M9 3a6 6 0 1 0 5.66 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M14 3v4h-4"           stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </Button>

      <Popover
        placement="bottom"
        content={
          <UserCard
            name="Ada Lovelace"
            email="ada@gnome.org"
            actions={userActions}
          />
        }
      >
        <button
          type="button"
          aria-label="User menu"
          style={{ background: "transparent", border: "none", cursor: "pointer", padding: 2, borderRadius: "50%", display: "flex" }}
        >
          <Avatar name="Ada Lovelace" size="sm" />
        </button>
      </Popover>
    </Toolbar>
  );
}

function AppSidebar({
  collapsed,
  activeNav,
  onNavChange,
}: {
  collapsed: boolean;
  activeNav: string;
  onNavChange: (id: string) => void;
}) {
  const navItems = [
    { id: "home",     label: "Home",     icon: GoHome,   badge: null },
    { id: "starred",  label: "Starred",  icon: Star,     badge: 3    },
    { id: "shared",   label: "Shared",   icon: Share,    badge: null },
    { id: "settings", label: "Settings", icon: Settings, badge: null },
  ];

  return (
    <Sidebar collapsed={collapsed} style={{ height: "100%" }}>
      <SidebarSection>
        {navItems.map(({ id, label, icon, badge }) => (
          <SidebarItem
            key={id}
            label={label}
            icon={icon}
            active={activeNav === id}
            suffix={badge ? <Badge variant="accent">{badge}</Badge> : undefined}
            onClick={() => onNavChange(id)}
          />
        ))}
      </SidebarSection>
    </Sidebar>
  );
}

function AppContent({ activeNav, contentView, onViewChange }: {
  activeNav: string;
  contentView: string;
  onViewChange: (v: string) => void;
}) {
  const titles: Record<string, string> = {
    home: "Home", starred: "Starred", shared: "Shared", settings: "Settings",
  };

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Text variant="title-2">{titles[activeNav] ?? "Home"}</Text>
        <InlineViewSwitcher value={contentView} onValueChange={onViewChange} aria-label="Layout">
          <InlineViewSwitcherItem name="grid"    label="Grid" />
          <InlineViewSwitcherItem name="list"    label="List" />
          <InlineViewSwitcherItem name="details" label="Details" />
        </InlineViewSwitcher>
      </div>

      {activeNav === "home" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16 }}>
            <CounterCard label="Documents" value={1248} suffix=" files"  duration={900}  />
            <CounterCard label="Starred"   value={3}                     duration={700}  accent />
            <CounterCard label="Shared"    value={24}   suffix=" items"  duration={1000} />
            <CounterCard label="Trash"     value={7}    suffix=" items"  duration={800}  />
          </div>

          {/* WrapBox: side-by-side on desktop, stacked on mobile */}
          <WrapBox childSpacing={24} lineSpacing={24} align="start">
            <Box spacing={8} style={{ flex: "1 1 260px", minWidth: 0 }}>
              <Text variant="caption-heading" color="dim" style={{ paddingLeft: 4 }}>Recent</Text>
              <BoxedList>
                <ActionRow interactive title="Project Proposal.odt" subtitle="Modified 2 hours ago · 142 KB" onClick={() => {}} />
                <ActionRow interactive title="Budget 2026.ods"       subtitle="Modified yesterday · 38 KB"   onClick={() => {}} />
                <ActionRow interactive title="Presentation.odp"      subtitle="Modified 3 days ago · 2.4 MB" onClick={() => {}} />
              </BoxedList>
            </Box>
            <Box spacing={8} style={{ flex: "1 1 260px", minWidth: 0 }}>
              <Text variant="caption-heading" color="dim" style={{ paddingLeft: 4 }}>Devices</Text>
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
            </Box>
          </WrapBox>
        </>
      )}

      {activeNav === "settings" && (
        <BoxedList>
          <ActionRow title="Auto-sync"         subtitle="Keep files up to date automatically" trailing={<Switch defaultChecked aria-label="Auto-sync" />} />
          <ActionRow title="Show hidden files"  trailing={<Switch aria-label="Hidden files" />} />
          <ActionRow title="Sort by name"       trailing={<Switch defaultChecked aria-label="Sort by name" />} />
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
    </div>
  );
}

function AppStatusBar() {
  return (
    <Toolbar style={{ minHeight: 36, padding: "0 16px" }}>
      <Text variant="caption" color="dim">1 248 items · 48.3 GB used of 1 TB</Text>
      <Spacer />
      <Text variant="caption" color="dim">GNOME Files 48.0</Text>
    </Toolbar>
  );
}

function CookbookHeader({
  title = "Documents",
  subtitle,
  leading,
  onToggleSidebar,
}: {
  title?: string;
  subtitle?: string;
  leading?: ReactNode;
  onToggleSidebar?: () => void;
}) {
  return (
    <ShellAppHeader
      title={title}
      subtitle={subtitle}
      leading={
        leading ??
        (onToggleSidebar ? (
          <Button variant="flat" aria-label="Toggle sidebar" onClick={onToggleSidebar}>
            ☰
          </Button>
        ) : undefined)
      }
      actions={<Button variant="flat">New</Button>}
    />
  );
}

function CookbookSidebar({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <SidebarShell
      collapsed={collapsed}
      header={<Text variant="heading">Workspace</Text>}
      footer={<Button variant="flat" style={{ width: "100%" }}>Preferences</Button>}
      aria-label="Workspace navigation"
    >
      <SidebarSection>
        <SidebarItem label="Home" icon={GoHome} active onClick={onNavigate} />
        <SidebarItem label="Starred" icon={Star} onClick={onNavigate} />
        <SidebarItem label="Shared" icon={Share} onClick={onNavigate} />
        <SidebarItem label="Settings" icon={Settings} onClick={onNavigate} />
      </SidebarSection>
    </SidebarShell>
  );
}

function CookbookContent({
  title = "Overview",
  rows = 12,
}: {
  title?: string;
  rows?: number;
}) {
  return (
    <PageContent as="section" maxWidth="lg">
      <Text variant="title-2">{title}</Text>
      <Text variant="body" color="dim" style={{ marginTop: 8 }}>
        A GNOME UI application shell pattern using Adwaita structure and spacing.
      </Text>
      <BoxedList style={{ marginTop: 24 }}>
        {Array.from({ length: rows }, (_, index) => (
          <ActionRow
            key={index}
            title={`Document ${index + 1}`}
            subtitle="Updated recently"
            interactive
          />
        ))}
      </BoxedList>
    </PageContent>
  );
}

// ─── Full app composition ──────────────────────────────────────────────────────

function FilesApp({ startMobileOpen = false }: { startMobileOpen?: boolean }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(startMobileOpen);
  const [activeNav, setActiveNav] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [contentView, setContentView] = useState("grid");

  function handleToggleSidebar() {
    if (isSidebarOverlay("narrow")) {
      // Mobile: only open/close the overlay — never change collapsed state.
      // Changing collapsed while the slide animation runs causes a width-change
      // mid-transition that makes the sidebar look like it expands before hiding.
      setSidebarOpen((v) => !v);
    } else {
      // Desktop: collapse to icon-only; overlay CSS is inactive here.
      setSidebarCollapsed((v) => !v);
    }
  }

  return (
    <Layout
      header={
        <AppHeader
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={handleToggleSidebar}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      }
      sidebar={
        <AppSidebar
          collapsed={sidebarCollapsed}
          activeNav={activeNav}
          onNavChange={(id) => {
            setActiveNav(id);
            setSidebarOpen(false); // auto-close overlay after navigation on mobile
          }}
        />
      }
      sidebarOpen={sidebarOpen}
      onSidebarClose={() => setSidebarOpen(false)}
      footer={<AppStatusBar />}
    >
      <AppContent
        activeNav={activeNav}
        contentView={contentView}
        onViewChange={setContentView}
      />
    </Layout>
  );
}

// ─── Meta ──────────────────────────────────────────────────────────────────────

const meta: Meta<typeof Layout> = {
  title: "Layout/Layout",
  component: Layout,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
Full-page application shell from **\`@gnome-ui/layout\`** that composes four
named zones following the GNOME Human Interface Guidelines.

| Zone | Prop | Behaviour |
|------|------|-----------|
| Header | \`header\` / \`topBar\` | Pinned header — never scrolls |
| Sidebar | \`sidebar\` | Fixed-width lateral navigation, overlay, or rail |
| Content | \`children\` | Scrollable main area |
| Footer | \`footer\` / \`bottomBar\` | Pinned footer — never scrolls |

**Install:**
\`\`\`bash
npm install @gnome-ui/layout
\`\`\`

**Usage:**
\`\`\`tsx
import { Layout } from "@gnome-ui/layout";
import "@gnome-ui/layout/styles";

<Layout header={<AppHeader />} sidebar={<AppSidebar />} footer={<AppStatusBar />}>
  <AppContent />
</Layout>
\`\`\`

The shell supports pinned headers and footers, scroll-contained content,
sidebar overlays, rail collapse, right-side placement, GNOME breakpoints, and
the project's \`--gnome-*\` design tokens.
        `,
      },
    },
  },
};

export default meta;

// ─── Stories ───────────────────────────────────────────────────────────────────

/** Full GNOME Files–style app demonstrating all four zones. */
export const FilesApplication: StoryObj<typeof Layout> = {
  name: "Files application",
  render: () => <FilesApp />,
  parameters: { controls: { disable: true } },
};

/** Minimal shell — top bar + content + bottom bar, no sidebar. */
export const Minimal: StoryObj<typeof Layout> = {
  render: () => (
    <Layout
      header={
        <Toolbar style={{ minHeight: 48, padding: "0 16px" }}>
          <Text variant="heading">My App</Text>
          <Spacer />
          <Button variant="suggested">Save</Button>
        </Toolbar>
      }
      footer={
        <Toolbar style={{ minHeight: 36, padding: "0 16px" }}>
          <Text variant="caption" color="dim">Ready</Text>
        </Toolbar>
      }
    >
      <div style={{ padding: 24 }}>
        <Text variant="title-2">Content area</Text>
        <Text variant="body" color="dim" style={{ marginTop: 8 }}>
          The main content scrolls while the top and bottom bars stay pinned.
        </Text>
      </div>
    </Layout>
  ),
  parameters: { controls: { disable: true } },
};

/**
 * Simulates a narrow mobile viewport (360 × 780 px).
 * The sidebar is hidden by default and slides in as an overlay when the
 * hamburger button is tapped. Tap the backdrop or a nav item to close it.
 */
export const MobileOverlay: StoryObj<typeof Layout> = {
  name: "Mobile overlay sidebar",
  render: () => <FilesApp startMobileOpen={false} />,
  parameters: {
    controls: { disable: true },
    viewport: { defaultViewport: "mobile1" },
    chromatic: { viewports: [360] },
  },
};

/** Only a content area — no bars, no sidebar. */
export const ContentOnly: StoryObj<typeof Layout> = {
  render: () => (
    <Layout>
      <div style={{ padding: 24 }}>
        <Text variant="title-2">No chrome</Text>
        <Text variant="body" color="dim" style={{ marginTop: 8 }}>
          All zones are optional — render only what your app needs.
        </Text>
      </div>
    </Layout>
  ),
  parameters: { controls: { disable: true } },
};

// ─── Application shell cookbook ────────────────────────────────────────────────

export const BasicStructure: StoryObj<typeof Layout> = {
  name: "Basic structure",
  render: () => (
    <Layout
      header={<CookbookHeader title="Basic Shell" />}
      footer={
        <StatusBar trailing={<Text variant="caption" color="dim">Ready</Text>}>
          <Text variant="caption" color="dim">Footer</Text>
        </StatusBar>
      }
    >
      <CookbookContent title="Content" rows={6} />
    </Layout>
  ),
  parameters: { controls: { disable: true } },
};

export const HeaderContentFooter: StoryObj<typeof Layout> = {
  name: "Header content footer",
  render: () => (
    <Layout
      header={<CookbookHeader title="Reports" subtitle="Q2 activity" />}
      footer={
        <StatusBar trailing={<Text variant="caption" color="dim">Synced</Text>}>
          <Text variant="caption" color="dim">24 reports</Text>
        </StatusBar>
      }
    >
      <CookbookContent title="Reports" rows={10} />
    </Layout>
  ),
  parameters: { controls: { disable: true } },
};

export const HeaderSidebar: StoryObj<typeof Layout> = {
  name: "Header sidebar",
  render: function HeaderSidebarStory() {
    const [open, setOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    return (
      <Layout
        header={
          <CookbookHeader
            title="Workspace"
            leading={
              <SidebarTrigger
                sidebarOpen={open}
                sidebarCollapsed={collapsed}
                onSidebarOpenChange={setOpen}
                onSidebarCollapsedChange={setCollapsed}
              />
            }
          />
        }
        sidebar={<CookbookSidebar collapsed={collapsed} onNavigate={() => setOpen(false)} />}
        sidebarOpen={open}
        sidebarCollapseMode="rail"
        sidebarCollapsed={collapsed}
        onSidebarOpenChange={setOpen}
        footer={<StatusBar><Text variant="caption" color="dim">Connected</Text></StatusBar>}
      >
        <CookbookContent title="Home" rows={10} />
      </Layout>
    );
  },
  parameters: { controls: { disable: true } },
};

export const HeaderSidebarNested: StoryObj<typeof Layout> = {
  name: "Header sidebar nested",
  render: function HeaderSidebarNestedStory() {
    const [open, setOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    return (
      <Layout
        header={
          <CookbookHeader
            title="Projects"
            subtitle="Planning"
            leading={
              <SidebarTrigger
                sidebarOpen={open}
                sidebarCollapsed={collapsed}
                sidebarBreakpoint="medium"
                onSidebarOpenChange={setOpen}
                onSidebarCollapsedChange={setCollapsed}
              />
            }
          />
        }
        sidebar={<CookbookSidebar collapsed={collapsed} onNavigate={() => setOpen(false)} />}
        sidebarOpen={open}
        sidebarBreakpoint="medium"
        sidebarCollapseMode="rail"
        sidebarCollapsed={collapsed}
        onSidebarOpenChange={setOpen}
        onSidebarClose={() => setOpen(false)}
      >
        <PageContent as="section" maxWidth="xl">
          <Text variant="title-2">Planning</Text>
          <WrapBox childSpacing={24} lineSpacing={24} align="start" style={{ marginTop: 24 }}>
            <Box spacing={8} style={{ flex: "1 1 280px", minWidth: 0 }}>
              <Text variant="caption-heading" color="dim">Pinned</Text>
              <BoxedList>
                <ActionRow title="Roadmap" subtitle="Phase planning" interactive />
                <ActionRow title="Design notes" subtitle="GNOME shell structure" interactive />
              </BoxedList>
            </Box>
            <Box spacing={8} style={{ flex: "2 1 420px", minWidth: 0 }}>
              <Text variant="caption-heading" color="dim">Activity</Text>
              <BoxedList>
                <ActionRow title="Layout updated" subtitle="Shell aliases and sidebar modes" />
                <ActionRow title="Stories added" subtitle="Application shell cookbook" />
                <ActionRow title="Docs refreshed" subtitle="README and roadmap" />
              </BoxedList>
            </Box>
          </WrapBox>
        </PageContent>
      </Layout>
    );
  },
  parameters: { controls: { disable: true } },
};

export const SidebarOnly: StoryObj<typeof Layout> = {
  name: "Sidebar only",
  render: () => (
    <Layout
      sidebar={<CookbookSidebar />}
      footer={<StatusBar><Text variant="caption" color="dim">Sidebar-first shell</Text></StatusBar>}
    >
      <CookbookContent title="Sidebar Navigation" rows={8} />
    </Layout>
  ),
  parameters: { controls: { disable: true } },
};

export const CustomSidebarTrigger: StoryObj<typeof Layout> = {
  name: "Custom sidebar trigger",
  render: function CustomSidebarTriggerStory() {
    const [collapsed, setCollapsed] = useState(false);
    const [open, setOpen] = useState(false);

    return (
      <Layout
        header={
          <CookbookHeader
            title="Custom Trigger"
            leading={
              <SidebarTrigger
                sidebarOpen={open}
                sidebarCollapsed={collapsed}
                onSidebarOpenChange={setOpen}
                onSidebarCollapsedChange={setCollapsed}
              >
                Toggle
              </SidebarTrigger>
            }
          />
        }
        sidebar={<CookbookSidebar collapsed={collapsed} onNavigate={() => setOpen(false)} />}
        sidebarCollapseMode="rail"
        sidebarCollapsed={collapsed}
        sidebarOpen={open}
        onSidebarOpenChange={setOpen}
      >
        <CookbookContent title={collapsed ? "Rail sidebar" : "Expanded sidebar"} rows={8} />
      </Layout>
    );
  },
  parameters: { controls: { disable: true } },
};

export const ResponsiveSidebar: StoryObj<typeof Layout> = {
  name: "Responsive sidebar",
  render: function ResponsiveSidebarStory() {
    const [open, setOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    return (
      <Layout
        header={
          <CookbookHeader
            title="Responsive"
            leading={
              <SidebarTrigger
                sidebarOpen={open}
                sidebarCollapsed={collapsed}
                sidebarBreakpoint="medium"
                onSidebarOpenChange={setOpen}
                onSidebarCollapsedChange={setCollapsed}
              />
            }
          />
        }
        sidebar={<CookbookSidebar collapsed={collapsed} onNavigate={() => setOpen(false)} />}
        sidebarOpen={open}
        sidebarBreakpoint="medium"
        sidebarCollapseMode="rail"
        sidebarCollapsed={collapsed}
        onSidebarOpenChange={setOpen}
      >
        <CookbookContent title="Resize below 550 px" rows={10} />
      </Layout>
    );
  },
  parameters: {
    controls: { disable: true },
    viewport: { defaultViewport: "mobile1" },
    chromatic: { viewports: [390, 550, 860] },
  },
};

export const FixedHeader: StoryObj<typeof Layout> = {
  name: "Fixed header",
  render: () => (
    <Layout
      header={<CookbookHeader title="Fixed Header" />}
      footer={<StatusBar><Text variant="caption" color="dim">Only content scrolls</Text></StatusBar>}
    >
      <CookbookContent title="Long Content" rows={24} />
    </Layout>
  ),
  parameters: { controls: { disable: true } },
};

export const FixedSidebar: StoryObj<typeof Layout> = {
  name: "Fixed sidebar",
  render: () => (
    <Layout
      header={<CookbookHeader title="Fixed Sidebar" />}
      sidebar={<CookbookSidebar />}
      footer={<StatusBar><Text variant="caption" color="dim">Sidebar stays pinned</Text></StatusBar>}
    >
      <CookbookContent title="Scrollable Content" rows={24} />
    </Layout>
  ),
  parameters: { controls: { disable: true } },
};

export const RTLPlacement: StoryObj<typeof Layout> = {
  name: "RTL sidebar placement",
  render: () => (
    <Layout
      dir="rtl"
      header={<CookbookHeader title="RTL Layout" />}
      sidebar={<CookbookSidebar />}
      sidebarLabel="RTL navigation"
      sidebarPlacement="start"
      footer={<StatusBar><Text variant="caption" color="dim">Logical start placement</Text></StatusBar>}
    >
      <CookbookContent title="Right-to-left shell" rows={8} />
    </Layout>
  ),
  parameters: { controls: { disable: true } },
};

export const NestedShell: StoryObj<typeof Layout> = {
  name: "Nested layout",
  render: () => (
    <Layout
      header={<CookbookHeader title="Parent Shell" />}
      sidebar={<CookbookSidebar />}
      footer={<StatusBar><Text variant="caption" color="dim">Parent footer</Text></StatusBar>}
    >
      <Layout
        height="parent"
        scroll="content"
        header={<ShellAppHeader title="Nested View" actions={<Button variant="flat">Refresh</Button>} />}
        footer={<StatusBar><Text variant="caption" color="dim">Nested footer</Text></StatusBar>}
      >
        <CookbookContent title="Nested Content" rows={16} />
      </Layout>
    </Layout>
  ),
  parameters: { controls: { disable: true } },
};

export const DarkModePreview: StoryObj<typeof Layout> = {
  name: "Dark mode preview",
  render: () => (
    <Layout
      header={<CookbookHeader title="Dark Preview" />}
      sidebar={<CookbookSidebar />}
      footer={<StatusBar><Text variant="caption" color="dim">Theme: dark</Text></StatusBar>}
    >
      <CookbookContent title="Dark Theme" rows={8} />
    </Layout>
  ),
  parameters: { controls: { disable: true } },
  globals: { theme: "dark", backgrounds: { value: "gnome-dark" } },
};

export const HighContrastPreview: StoryObj<typeof Layout> = {
  name: "High contrast preview",
  render: () => (
    <Layout
      header={<CookbookHeader title="High Contrast" />}
      sidebar={<CookbookSidebar />}
      footer={<StatusBar><Text variant="caption" color="dim">Theme: high contrast</Text></StatusBar>}
    >
      <CookbookContent title="High Contrast" rows={8} />
    </Layout>
  ),
  parameters: { controls: { disable: true } },
  globals: { theme: "high-contrast" },
};
