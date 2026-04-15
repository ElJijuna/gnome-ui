/**
 * FileManager — Layout/FileManager
 *
 * GNOME Files (Nautilus)–style file browser.
 *
 * Key structural pattern: the top bar is split into two header bars that sit
 * side-by-side — one aligned with the sidebar (left) and one with the content
 * area (right). This mirrors AdwOverlaySplitView's dual-headerbar layout.
 *
 * Closes issue #16.
 */

import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { GoHome, Star, GoUp, Refresh, ViewMore, ViewSidebar, Settings, Share, Search, GoPrevious, GoNext } from "@gnome-ui/icons";
import {
  Button,
  Spacer,
  Toolbar,
  Sidebar,
  SidebarSection,
  SidebarItem,
  InlineViewSwitcher,
  InlineViewSwitcherItem,
  Text,
  Avatar,
  Popover,
  PathBar,
  Badge,
  Separator,
  Icon,
} from "@gnome-ui/react";
import type { PathBarSegment } from "@gnome-ui/react";
import { Layout } from "../Layout/Layout";
import { UserCard } from "../UserCard";

// ─── Constants ─────────────────────────────────────────────────────────────────

const SIDEBAR_WIDTH = 240;
const SIDEBAR_COLLAPSED_WIDTH = 56;

// ─── Types ─────────────────────────────────────────────────────────────────────

interface FileEntry {
  name: string;
  type: "folder" | "document" | "image" | "archive";
  size?: string;
  modified?: string;
}

// ─── File data ─────────────────────────────────────────────────────────────────

const FOLDER_MAP: Record<string, { label: string; files: FileEntry[] }> = {
  "/home": {
    label: "Home",
    files: [
      { name: "Documents", type: "folder" },
      { name: "Downloads", type: "folder" },
      { name: "Pictures",  type: "folder" },
      { name: "Music",     type: "folder" },
      { name: "Videos",    type: "folder" },
      { name: "Projects",  type: "folder" },
    ],
  },
  "/home/documents": {
    label: "Documents",
    files: [
      { name: "Project Proposal.odt", type: "document", size: "142 KB",  modified: "2 hours ago" },
      { name: "Budget 2026.ods",       type: "document", size: "38 KB",   modified: "Yesterday"   },
      { name: "Presentation.odp",      type: "document", size: "2.4 MB",  modified: "3 days ago"  },
      { name: "Notes",                 type: "folder"                                             },
      { name: "Archive.zip",           type: "archive",  size: "8.2 MB",  modified: "Last week"   },
    ],
  },
  "/home/pictures": {
    label: "Pictures",
    files: [
      { name: "GNOME Conference", type: "folder"                                          },
      { name: "Wallpapers",       type: "folder"                                          },
      { name: "screenshot-1.png", type: "image",    size: "312 KB", modified: "Today"     },
      { name: "screenshot-2.png", type: "image",    size: "295 KB", modified: "Today"     },
      { name: "logo.svg",         type: "image",    size: "48 KB",  modified: "Last week" },
    ],
  },
  "/home/projects": {
    label: "Projects",
    files: [
      { name: "gnome-ui",       type: "folder" },
      { name: "adwaita-rs",     type: "folder" },
      { name: "libadwaita-web", type: "folder" },
    ],
  },
};

function segmentsForPath(path: string): PathBarSegment[] {
  const parts = path.split("/").filter(Boolean);
  const segs: PathBarSegment[] = [];
  let cumulative = "";
  for (const part of parts) {
    cumulative = `${cumulative}/${part}`;
    const label = FOLDER_MAP[cumulative]?.label ?? (part.charAt(0).toUpperCase() + part.slice(1));
    segs.push({ label, path: cumulative });
  }
  return segs;
}

// ─── Inline file icons ─────────────────────────────────────────────────────────

function FolderIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
      <path d="M4 10a4 4 0 0 1 4-4h8l4 5h12a4 4 0 0 1 4 4v17a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V10Z"
        fill="var(--gnome-accent-bg-color, #3584e4)" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
      <rect x="8" y="4" width="24" height="32" rx="3"
        fill="var(--gnome-card-bg-color, #fff)"
        stroke="var(--gnome-headerbar-border-color, rgba(0,0,0,.15))" strokeWidth="1.5" />
      <path d="M14 14h12M14 19h12M14 24h8"
        stroke="var(--gnome-window-fg-color, rgba(0,0,0,.4))"
        strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
      <rect x="6" y="6" width="28" height="28" rx="4" fill="#c084fc" />
      <circle cx="15" cy="15" r="3" fill="white" opacity="0.7" />
      <path d="M6 28l8-8 5 5 5-6 10 9" stroke="white" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArchiveIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
      <rect x="8" y="8" width="24" height="24" rx="3"
        fill="var(--gnome-warning-bg-color, #e5a50a)" />
      <path d="M17 8v24M23 8v24" stroke="white" strokeWidth="2" opacity="0.4" />
      <rect x="14" y="18" width="12" height="7" rx="1.5" fill="white" opacity="0.8" />
    </svg>
  );
}

function FileIcon({ type }: { type: FileEntry["type"] }) {
  switch (type) {
    case "folder":   return <FolderIcon />;
    case "document": return <DocumentIcon />;
    case "image":    return <ImageIcon />;
    case "archive":  return <ArchiveIcon />;
  }
}

// ─── Dual header bar ───────────────────────────────────────────────────────────
//
// GNOME Files splits the header into two bars:
//   LEFT  — sidebar header (fixed width = sidebar): search · title · menu
//   RIGHT — content header (flex:1): back/forward · PathBar · actions
//
// A border-right on the left section visually joins it to the sidebar below.

const userActions = [
  { label: "View Profile",     onClick: () => {} },
  { label: "Account Settings", onClick: () => {} },
  { label: "Sign Out",         onClick: () => {}, variant: "destructive" as const },
];

function DualHeaderBar({
  sidebarCollapsed,
  onToggleSidebar,
  segments,
  onNavigate,
  canGoBack,
  canGoForward,
  onBack,
  onForward,
}: {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  segments: PathBarSegment[];
  onNavigate: (path: string) => void;
  canGoBack: boolean;
  canGoForward: boolean;
  onBack: () => void;
  onForward: () => void;
}) {
  const sidebarW = sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  return (
    <div style={{ display: "flex", height: "100%" }}>

      {/* ── Sidebar header ─────────────────────────────────────────────────── */}
      <div style={{
        width: sidebarW,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "0 8px",
        background: "var(--gnome-sidebar-bg-color, #ebebeb)",
        borderRight: "1px solid var(--gnome-headerbar-border-color, rgba(0,0,0,.12))",
        transition: "width 200ms ease",
        overflow: "hidden",
        position: "relative" as const,
        marginBottom: -1,
        paddingBottom: 1,
        zIndex: 1,
      }}>
        {/* Search */}
        <Button variant="flat" style={{ minWidth: "unset", flexShrink: 0 }} aria-label="Search">
          <Icon icon={Search} width={16} height={16} />
        </Button>

        {/* App title (hidden when collapsed) */}
        {!sidebarCollapsed && (
          <Text variant="heading" style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            Files
          </Text>
        )}

        <Spacer />

        {/* Toggle sidebar */}
        <Button
          variant="flat"
          style={{ minWidth: "unset", flexShrink: 0 }}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={onToggleSidebar}
        >
          <Icon icon={ViewSidebar} width={16} height={16} />
        </Button>
      </div>

      {/* ── Content header ─────────────────────────────────────────────────── */}
      <Toolbar style={{ flex: 1, minHeight: "unset", height: "100%", padding: "0 8px", gap: 4 }}>

        {/* Back / Forward */}
        <Button
          variant="flat"
          style={{ minWidth: "unset" }}
          aria-label="Go back"
          disabled={!canGoBack}
          onClick={onBack}
        >
          <Icon icon={GoPrevious} width={16} height={16} />
        </Button>
        <Button
          variant="flat"
          style={{ minWidth: "unset" }}
          aria-label="Go forward"
          disabled={!canGoForward}
          onClick={onForward}
        >
          <Icon icon={GoNext} width={16} height={16} />
        </Button>

        {/* PathBar */}
        <div style={{
          flex: "1 1 auto",
          display: "flex",
          alignItems: "center",
          background: "var(--gnome-card-bg-color, rgba(0,0,0,.05))",
          borderRadius: "var(--gnome-radius-md, 8px)",
          border: "1px solid var(--gnome-headerbar-border-color, rgba(0,0,0,.1))",
          padding: "0 6px",
          minWidth: 0,
          minHeight: 32,
          overflow: "hidden",
        }}>
          <PathBar
            segments={segments}
            onNavigate={onNavigate}
            style={{ width: "100%" }}
          />
        </div>

        {/* Refresh */}
        <Button variant="flat" style={{ minWidth: "unset" }} aria-label="Refresh">
          <Icon icon={Refresh} width={16} height={16} />
        </Button>

        {/* More */}
        <Button variant="flat" style={{ minWidth: "unset" }} aria-label="More actions">
          <Icon icon={ViewMore} width={16} height={16} />
        </Button>

        {/* User */}
        <Popover
          placement="bottom"
          content={<UserCard name="Ada Lovelace" email="ada@gnome.org" actions={userActions} />}
        >
          <button type="button" aria-label="User menu" style={{
            background: "transparent", border: "none", cursor: "pointer",
            padding: 2, borderRadius: "50%", display: "flex",
          }}>
            <Avatar name="Ada Lovelace" size="sm" />
          </button>
        </Popover>
      </Toolbar>
    </div>
  );
}

// ─── Sidebar ───────────────────────────────────────────────────────────────────

function FileManagerSidebar({
  collapsed,
  currentPath,
  onNavigate,
}: {
  collapsed: boolean;
  currentPath: string;
  onNavigate: (path: string) => void;
}) {
  const places = [
    { id: "/home",           label: "Home",      icon: GoHome     },
    { id: "/home/documents", label: "Documents", icon: ViewSidebar },
    { id: "/home/pictures",  label: "Pictures",  icon: Star       },
    { id: "/home/projects",  label: "Projects",  icon: Settings   },
  ];

  const network = [
    { id: "/shared",  label: "Shared",  icon: Share, badge: 2    },
    { id: "/starred", label: "Starred", icon: Star,  badge: null },
  ];

  return (
    <Sidebar collapsed={collapsed} style={{ height: "100%" }}>
      <SidebarSection title="Places">
        {places.map(({ id, label, icon }) => (
          <SidebarItem
            key={id}
            label={label}
            icon={icon}
            active={currentPath === id || currentPath.startsWith(`${id}/`)}
            onClick={() => onNavigate(id)}
          />
        ))}
      </SidebarSection>

      <SidebarSection title="Network">
        {network.map(({ id, label, icon, badge }) => (
          <SidebarItem
            key={id}
            label={label}
            icon={icon}
            active={currentPath === id}
            suffix={badge ? <Badge variant="accent">{badge}</Badge> : undefined}
            onClick={() => onNavigate(id)}
          />
        ))}
      </SidebarSection>
    </Sidebar>
  );
}

// ─── File views ────────────────────────────────────────────────────────────────

function FileGrid({ files, onOpen }: { files: FileEntry[]; onOpen: (f: FileEntry) => void }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(104px, 1fr))",
      gap: 4,
      padding: "4px 0",
    }}>
      {files.map((file) => (
        <button
          key={file.name}
          type="button"
          onClick={() => onOpen(file)}
          style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: 6, padding: "10px 8px 8px",
            background: "transparent", border: "1.5px solid transparent",
            borderRadius: "var(--gnome-radius-md, 8px)",
            cursor: "pointer", font: "inherit", textAlign: "center",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "var(--gnome-hover-overlay, rgba(0,0,0,.06))";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          }}
        >
          <FileIcon type={file.type} />
          <span style={{
            fontSize: "var(--gnome-font-size-caption, 0.75rem)",
            lineHeight: 1.3,
            color: "var(--gnome-window-fg-color, rgba(0,0,0,.8))",
            wordBreak: "break-word", maxWidth: "100%",
            fontFamily: "var(--gnome-font-family, sans-serif)",
          }}>
            {file.name}
          </span>
          {file.size && (
            <span style={{
              fontSize: "0.65rem", opacity: 0.55,
              fontFamily: "var(--gnome-font-family, sans-serif)",
              color: "var(--gnome-window-fg-color)",
            }}>
              {file.size}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

function FileList({ files, onOpen }: { files: FileEntry[]; onOpen: (f: FileEntry) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {files.map((file, i) => (
        <div key={file.name}>
          {i > 0 && <Separator />}
          <button
            type="button"
            onClick={() => onOpen(file)}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "6px 16px", width: "100%",
              background: "transparent", border: "none",
              cursor: "pointer", font: "inherit", textAlign: "start",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "var(--gnome-hover-overlay, rgba(0,0,0,.06))";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            }}
          >
            <span style={{ flexShrink: 0 }}><FileIcon type={file.type} /></span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <Text variant="body" style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {file.name}
              </Text>
              {file.modified && (
                <Text variant="caption" color="dim" style={{ display: "block" }}>
                  {file.modified}{file.size ? ` · ${file.size}` : ""}
                </Text>
              )}
            </span>
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Full app ──────────────────────────────────────────────────────────────────

function FileManagerApp({ startMobileOpen = false }: { startMobileOpen?: boolean }) {
  const [currentPath, setCurrentPath] = useState("/home");
  const [history, setHistory] = useState(["/home"]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(startMobileOpen);
  const [view, setView] = useState<"grid" | "list">("grid");

  const segments = segmentsForPath(currentPath);
  const files = FOLDER_MAP[currentPath]?.files ?? FOLDER_MAP["/home"].files;

  function navigate(path: string) {
    if (!FOLDER_MAP[path]) return;
    const newHistory = [...history.slice(0, historyIndex + 1), path];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentPath(path);
    setSidebarOpen(false);
  }

  function goBack() {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentPath(history[newIndex]);
    }
  }

  function goForward() {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCurrentPath(history[newIndex]);
    }
  }

  function openFile(file: FileEntry) {
    if (file.type === "folder") {
      navigate(`${currentPath}/${file.name.toLowerCase().replace(/ /g, "-")}`);
    }
  }

  function toggleSidebar() {
    if (window.matchMedia("(max-width: 639px)").matches) {
      setSidebarOpen((v) => !v);
    } else {
      setSidebarCollapsed((v) => !v);
    }
  }

  return (
    <Layout
      topBar={
        <DualHeaderBar
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={toggleSidebar}
          segments={segments}
          onNavigate={navigate}
          canGoBack={historyIndex > 0}
          canGoForward={historyIndex < history.length - 1}
          onBack={goBack}
          onForward={goForward}
        />
      }
      sidebar={
        <FileManagerSidebar
          collapsed={sidebarCollapsed}
          currentPath={currentPath}
          onNavigate={navigate}
        />
      }
      sidebarOpen={sidebarOpen}
      onSidebarClose={() => setSidebarOpen(false)}
      bottomBar={
        <Toolbar style={{ minHeight: 32, padding: "0 16px" }}>
          <Text variant="caption" color="dim">{files.length} items</Text>
          <Spacer />
          <Text variant="caption" color="dim">GNOME Files 50.0</Text>
        </Toolbar>
      }
    >
      {/* Content header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px 8px",
        gap: 12,
      }}>
        <Text variant="title-2">{segments.at(-1)?.label ?? "Home"}</Text>
        <InlineViewSwitcher value={view} onValueChange={(v) => setView(v as "grid" | "list")} aria-label="View">
          <InlineViewSwitcherItem name="grid" label="Grid" />
          <InlineViewSwitcherItem name="list" label="List" />
        </InlineViewSwitcher>
      </div>

      {/* Files */}
      <div style={{ padding: "0 12px 16px" }}>
        {view === "grid"
          ? <FileGrid files={files} onOpen={openFile} />
          : <FileList files={files} onOpen={openFile} />
        }
      </div>
    </Layout>
  );
}

// ─── Meta ──────────────────────────────────────────────────────────────────────

const meta: Meta = {
  title: "Layout/FileManager",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
GNOME Files (Nautilus)–style file browser assembled from **\`@gnome-ui/layout\`**
and **\`@gnome-ui/react\`** components.

### Dual-headerbar pattern

The top bar is split into two sections that sit side-by-side:

| Section | Width | Contents |
|---------|-------|----------|
| Sidebar header | 240 px (56 px collapsed) | Search · Title · Toggle button |
| Content header | \`flex: 1\` | Back/Forward · **PathBar** · Refresh · More · Avatar |

This mirrors the \`AdwOverlaySplitView\` dual-\`AdwHeaderBar\` pattern used in GNOME Files.

**Closes:** [#16](https://github.com/ElJijuna/gnome-ui/issues/16)
**Depends on:** [#17 PathBar](https://github.com/ElJijuna/gnome-ui/issues/17)
        `,
      },
    },
  },
};

export default meta;

// ─── Stories ───────────────────────────────────────────────────────────────────

/** Full GNOME Files–style browser. Click folders or breadcrumbs to navigate; use ← → to go back/forward. */
export const Default: StoryObj = {
  name: "File manager",
  render: () => <FileManagerApp />,
  parameters: { controls: { disable: true } },
};

/** 360 px mobile viewport — sidebar becomes an overlay panel. */
export const MobileOverlay: StoryObj = {
  name: "Mobile overlay (360 px)",
  render: () => <FileManagerApp startMobileOpen={false} />,
  parameters: {
    controls: { disable: true },
    viewport: { defaultViewport: "mobile1" },
    chromatic: { viewports: [360] },
  },
};
