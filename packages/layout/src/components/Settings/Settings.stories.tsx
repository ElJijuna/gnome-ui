/**
 * Settings — Layout/Settings
 *
 * GNOME Settings–style preferences app assembled from @gnome-ui/layout and
 * @gnome-ui/react components. Demonstrates the NavigationSplitView pattern:
 * left sidebar with category navigation + right panel showing sub-pages.
 */

import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Search, Settings as SettingsIcon, Share, OpenMenu,
  Applications, Notifications, Person, Heart,
  InputMouse, InputKeyboard, InputTablet,
  ColorManagement, Printer, Accessibility, Lock,
} from "@gnome-ui/icons";
import type { IconDefinition } from "@gnome-ui/icons";
import {
  Button,
  Spacer,
  Sidebar,
  SidebarSection,
  SidebarItem,
  BoxedList,
  ActionRow,
  SwitchRow,
  PreferencesGroup,
  Text,
  Icon,
} from "@gnome-ui/react";
import { Layout } from "../Layout/Layout";

// ─── Nav structure ─────────────────────────────────────────────────────────────

type NavId =
  | "apps" | "notifications" | "search" | "online-accounts"
  | "sharing" | "wellbeing" | "mouse" | "keyboard"
  | "color" | "printers" | "tablets" | "accessibility"
  | "privacy" | "system";

interface NavItem { id: NavId; label: string; icon: IconDefinition }

const NAV_ITEMS: NavItem[] = [
  { id: "apps",            label: "Apps",               icon: Applications },
  { id: "notifications",   label: "Notifications",      icon: Notifications },
  { id: "search",          label: "Search",             icon: Search },
  { id: "online-accounts", label: "Online Accounts",    icon: Person },
  { id: "sharing",         label: "Sharing",            icon: Share },
  { id: "wellbeing",       label: "Wellbeing",          icon: Heart },
  { id: "mouse",           label: "Mouse & Touchpad",   icon: InputMouse },
  { id: "keyboard",        label: "Keyboard",           icon: InputKeyboard },
  { id: "color",           label: "Color Management",   icon: ColorManagement },
  { id: "printers",        label: "Printers",           icon: Printer },
  { id: "tablets",         label: "Graphics Tablets",   icon: InputTablet },
  { id: "accessibility",   label: "Accessibility",      icon: Accessibility },
  { id: "privacy",         label: "Privacy & Security", icon: Lock },
  { id: "system",          label: "System",             icon: SettingsIcon },
];

// ─── Sub-page: Accessibility → Seeing ─────────────────────────────────────────

function SeeingPage() {
  return (
    <div style={{ padding: "16px 16px 32px", display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Screen Reader */}
      <PreferencesGroup>
        <BoxedList>
          <ActionRow
            title="Screen Reader"
            subtitle="The screen reader reads displayed text as you move the focus"
            trailing={
              <Button variant="default" style={{ whiteSpace: "nowrap" }}>
                Configure
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden style={{ marginLeft: 4 }}>
                  <path d="M7 2h3v3M10 2 5.5 6.5M3 3H2v7h7V9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Button>
            }
          />
        </BoxedList>
      </PreferencesGroup>

      {/* Seeing toggles */}
      <PreferencesGroup>
        <BoxedList>
          <SwitchRow title="High Contrast"    subtitle="Increase color contrast of foreground and background interface elements" />
          <SwitchRow title="On/Off Shapes"    subtitle="Use shapes to indicate state in addition to or instead of color" />
          <SwitchRow title="Reduced Motion"   subtitle="Toggle reduced motion animations throughout the user interface" defaultChecked />
          <SwitchRow title="Large Text"       subtitle="Increase the size of all text in the user interface" />
          <ActionRow
            interactive
            title="Cursor Size"
            subtitle="Increase the size of the cursor"
            trailing={
              <span style={{ display: "flex", alignItems: "center", gap: 4, opacity: 0.55, fontSize: "0.9rem" }}>
                Default
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                  <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            }
            onClick={() => {}}
          />
          <SwitchRow title="Sound Keys"           subtitle="Beep when Num Lock or Caps Lock are turned on or off" />
          <SwitchRow title="Always Show Scrollbars" subtitle="Make scrollbars always visible" />
        </BoxedList>
      </PreferencesGroup>
    </div>
  );
}

// ─── Placeholder for other pages ───────────────────────────────────────────────

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div style={{ padding: 32, display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
      <Text variant="body" color="dim">{title} settings coming soon.</Text>
    </div>
  );
}

// ─── Dual header (same pattern as FileManager) ─────────────────────────────────

function DualHeader({
  sidebarCollapsed,
  onToggleSidebar,
  activeLabel,
  subPage,
  onBack,
}: {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  activeLabel: string;
  subPage: string | null;
  onBack: () => void;
}) {
  const sidebarW = sidebarCollapsed ? 56 : 240;

  return (
    <div style={{ display: "flex", height: "100%" }}>
      {/* Sidebar header */}
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
        /* Extend 1 px down to cover the topBar's border-bottom under the sidebar section */
        position: "relative" as const,
        marginBottom: -1,
        paddingBottom: 1,
        zIndex: 1,
      }}>
        {sidebarCollapsed ? (
          /* Collapsed: only the OpenMenu toggle centered */
          <Button
            variant="flat"
            style={{ minWidth: "unset", flexShrink: 0, margin: "0 auto" }}
            aria-label="Expand sidebar"
            onClick={onToggleSidebar}
          >
            <Icon icon={OpenMenu} width={16} height={16} />
          </Button>
        ) : (
          /* Expanded: Search · Title · OpenMenu toggle */
          <>
            <Button variant="flat" style={{ minWidth: "unset", flexShrink: 0 }} aria-label="Search">
              <Icon icon={Search} width={16} height={16} />
            </Button>
            <Text variant="heading" style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden" }}>
              Settings
            </Text>
            <Button
              variant="flat"
              style={{ minWidth: "unset", flexShrink: 0 }}
              aria-label="Collapse sidebar"
              onClick={onToggleSidebar}
            >
              <Icon icon={OpenMenu} width={16} height={16} />
            </Button>
          </>
        )}
      </div>

      {/* Content header */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        padding: "0 8px",
        gap: 4,
        position: "relative",
      }}>
        {/* Back button (sub-page only) */}
        {subPage && (
          <Button variant="flat" style={{ minWidth: "unset" }} aria-label="Back" onClick={onBack}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Button>
        )}

        {/* Centered title */}
        <div style={{
          position: "absolute", left: 0, right: 0,
          display: "flex", justifyContent: "center", pointerEvents: "none",
        }}>
          <Text variant="heading">{subPage ?? activeLabel}</Text>
        </div>

        <Spacer />

        {/* Close button */}
        <Button variant="flat" style={{ minWidth: "unset" }} aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M3 3l10 10M13 3 3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </Button>
      </div>
    </div>
  );
}

// ─── Full app ──────────────────────────────────────────────────────────────────

function SettingsApp() {
  const [active, setActive] = useState<NavId>("accessibility");
  const [subPage, setSubPage] = useState<string | null>("Seeing");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeItem = NAV_ITEMS.find((n) => n.id === active)!;

  function selectNav(id: NavId) {
    setActive(id);
    setSubPage(id === "accessibility" ? "Seeing" : null);
    setSidebarOpen(false);
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
        <DualHeader
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={toggleSidebar}
          activeLabel={activeItem.label}
          subPage={subPage}
          onBack={() => setSubPage(null)}
        />
      }
      sidebar={
        <Sidebar collapsed={sidebarCollapsed} style={{ height: "100%" }}>
          <SidebarSection>
            {NAV_ITEMS.map(({ id, label, icon }) => (
              <SidebarItem
                key={id}
                label={label}
                icon={icon}
                active={active === id}
                onClick={() => selectNav(id)}
              />
            ))}
          </SidebarSection>
        </Sidebar>
      }
      sidebarOpen={sidebarOpen}
      onSidebarClose={() => setSidebarOpen(false)}
    >
      {active === "accessibility" && subPage === "Seeing"
        ? <SeeingPage />
        : <PlaceholderPage title={activeItem.label} />
      }
    </Layout>
  );
}

// ─── Meta ──────────────────────────────────────────────────────────────────────

const meta: Meta = {
  title: "Layout/Settings",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
GNOME Settings–style preferences app assembled from **\`@gnome-ui/layout\`** and **\`@gnome-ui/react\`**.

Demonstrates the dual-headerbar + sidebar navigation pattern with sub-page drill-down.

| Component | Role |
|-----------|------|
| \`Layout\` | Full-page shell |
| \`Sidebar\` / \`SidebarItem\` | Category navigation |
| \`PreferencesGroup\` | Titled section wrapper |
| \`BoxedList\` | Rounded settings list |
| \`SwitchRow\` | Toggle setting row |
| \`ActionRow\` | Navigable / value row |
        `,
      },
    },
  },
};

export default meta;

/** GNOME Settings — Accessibility → Seeing page. */
export const Default: StoryObj = {
  name: "Settings app",
  render: () => <SettingsApp />,
  parameters: { controls: { disable: true } },
};

/** 360 px mobile viewport. */
export const Mobile: StoryObj = {
  name: "Mobile (360 px)",
  render: () => <SettingsApp />,
  parameters: {
    controls: { disable: true },
    viewport: { defaultViewport: "mobile1" },
    chromatic: { viewports: [360] },
  },
};
