import {
  useEffect,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import styles from "./Layout.module.css";

export type LayoutHeight = "viewport" | "parent";
export type LayoutScroll = "content" | "page" | "none";
export type LayoutSidebarBreakpoint = "narrow" | "medium" | "wide";
export type LayoutSidebarCollapseMode = "none" | "rail" | "overlay";
export type LayoutSidebarPlacement = "start" | "end";
export type LayoutSidebarOpenChangeReason = "backdrop" | "escape" | "trigger";

export interface LayoutProps extends Omit<HTMLAttributes<HTMLDivElement>, "height"> {
  /**
   * Top bar area — typically a `Toolbar` or `HeaderBar` with logo, search,
   * and action buttons. Pinned to the top; never scrolls.
   *
   * @deprecated Prefer `header` for new code. `topBar` remains supported for
   * compatibility and takes precedence when both props are provided.
   */
  topBar?: ReactNode;
  /**
   * Header area — alias for `topBar` using the Ant-style / shell-style naming.
   * Typically a `Toolbar`, `HeaderBar`, or future `AppHeader`.
   */
  header?: ReactNode;
  /**
   * Sidebar navigation panel — typically a `Sidebar` component.
   * Rendered at the leading edge of the body zone and fills the full
   * available height.
   *
   * On viewports narrower than 640 px the sidebar becomes an overlay panel
   * that slides in from the leading edge. Use `sidebarOpen` to control its
   * visibility and `onSidebarClose` to handle backdrop / dismiss events.
   */
  sidebar?: ReactNode;
  /**
   * Sidebar edge. `start` follows the text direction; `end` mirrors right-side
   * sider layouts.
   */
  sidebarPlacement?: LayoutSidebarPlacement;
  /**
   * Breakpoint where the sidebar becomes an overlay.
   * - `"narrow"` — 400 px, GNOME split-view threshold.
   * - `"medium"` — 550 px, GNOME bottom-navigation threshold.
   * - `"wide"` — 860 px, GNOME nested-layout threshold.
   */
  sidebarBreakpoint?: LayoutSidebarBreakpoint;
  /**
   * Controls sidebar visibility **on narrow (mobile) viewports only**.
   * On wider viewports the sidebar is always visible regardless of this prop.
   * Defaults to `false`.
   */
  sidebarOpen?: boolean;
  /**
   * Collapse mode for the sidebar slot on wide layouts.
   * - `"none"` — no shell-level collapse styling.
   * - `"rail"` — sidebar remains in flow at `sidebarCollapsedWidth`.
   * - `"overlay"` — collapsed sidebar is hidden until `sidebarOpen`.
   */
  sidebarCollapseMode?: LayoutSidebarCollapseMode;
  /** Whether the sidebar is collapsed on wide layouts. */
  sidebarCollapsed?: boolean;
  /** Width used by `sidebarCollapseMode="rail"`. Defaults to `56`. */
  sidebarCollapsedWidth?: number;
  /**
   * Called when the shell requests sidebar open-state changes, such as backdrop
   * click or Escape. External triggers can call this same handler with
   * `"trigger"` for symmetry.
   */
  onSidebarOpenChange?: (
    open: boolean,
    reason: LayoutSidebarOpenChangeReason,
  ) => void;
  /**
   * Called when the user taps the backdrop behind the sidebar on mobile.
   * Use this to set `sidebarOpen` back to `false`.
   */
  onSidebarClose?: () => void;
  /**
   * Scrollable main content area. Fills the remaining horizontal space
   * after the sidebar and scrolls independently.
   */
  children?: ReactNode;
  /**
   * Bottom status bar — typically a `Toolbar` with status text or action
   * shortcuts. Pinned to the bottom; never scrolls.
   *
   * @deprecated Prefer `footer` for new code. `bottomBar` remains supported for
   * compatibility and takes precedence when both props are provided.
   */
  bottomBar?: ReactNode;
  /**
   * Footer area — alias for `bottomBar` using the Ant-style / shell-style
   * naming. Typically a compact `Toolbar` or status bar.
   */
  footer?: ReactNode;
  /**
   * Height model for the shell.
   * - `"viewport"` — fills the browser viewport (`100vh`), suitable for apps.
   * - `"parent"` — fills its parent (`100%`), suitable for nested layouts.
   *
   * Defaults to `"viewport"` to preserve the original full-page behaviour.
   */
  height?: LayoutHeight;
  /**
   * Scroll model for the shell.
   * - `"content"` — only the content area scrolls; bars remain pinned.
   * - `"page"` — the whole shell can scroll as one document.
   * - `"none"` — no internal scroll containers.
   *
   * Defaults to `"content"` to preserve the original app-shell behaviour.
   */
  scroll?: LayoutScroll;
}

/**
 * Full-page application shell following the GNOME Human Interface Guidelines.
 *
 * Composes four named zones:
 * - **`header` / `topBar`** — pinned header / toolbar row.
 * - **`sidebar`** — fixed-width lateral navigation (e.g. collapsible `Sidebar`).
 * - **`children`** — scrollable main content area.
 * - **`footer` / `bottomBar`** — pinned footer / status toolbar.
 *
 * All zones are optional. All `<div>` props are forwarded to the root element.
 *
 * **Typical usage:**
 * ```tsx
 * import { Layout } from "@gnome-ui/layout";
 * import "@gnome-ui/layout/styles";
 *
 * <Layout
 *   topBar={<AppHeader />}
 *   sidebar={<AppSidebar />}
 *   bottomBar={<AppStatusBar />}
 * >
 *   <main>…content…</main>
 * </Layout>
 * ```
 *
 * @see https://developer.gnome.org/hig/patterns/containers/header-bars.html
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.ToolbarView.html
 */
export function Layout({
  topBar,
  header,
  sidebar,
  sidebarPlacement = "start",
  sidebarBreakpoint = "narrow",
  sidebarOpen = false,
  sidebarCollapseMode = "none",
  sidebarCollapsed = false,
  sidebarCollapsedWidth = 56,
  onSidebarOpenChange,
  onSidebarClose,
  children,
  bottomBar,
  footer,
  height = "viewport",
  scroll = "content",
  className,
  ...props
}: LayoutProps) {
  const resolvedHeader = topBar ?? header;
  const resolvedFooter = bottomBar ?? footer;

  const rootClass = [
    styles.layout,
    height === "parent" ? styles.heightParent : styles.heightViewport,
    scroll === "page" ? styles.scrollPage : undefined,
    scroll === "none" ? styles.scrollNone : styles.scrollContent,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const bodyClass = [
    styles.body,
    sidebar && sidebarOpen ? styles.bodySidebarOpen : undefined,
    sidebarPlacement === "end" ? styles.bodySidebarEnd : undefined,
    sidebarBreakpoint === "medium" ? styles.breakpointMedium : undefined,
    sidebarBreakpoint === "wide" ? styles.breakpointWide : styles.breakpointNarrow,
    sidebarCollapseMode === "rail" ? styles.collapseRail : undefined,
    sidebarCollapseMode === "overlay" ? styles.collapseOverlay : undefined,
    sidebarCollapsed ? styles.sidebarCollapsed : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  const sidebarStyle = {
    "--layout-sidebar-collapsed-width": `${sidebarCollapsedWidth}px`,
  } as CSSProperties;

  const closeSidebar = (reason: LayoutSidebarOpenChangeReason) => {
    onSidebarOpenChange?.(false, reason);
    onSidebarClose?.();
  };

  useEffect(() => {
    if (!sidebar || !sidebarOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeSidebar("escape");
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [sidebar, sidebarOpen, onSidebarOpenChange, onSidebarClose]);

  const sidebarSlot = sidebar && (
    <aside className={styles.sidebar} style={sidebarStyle}>
      {sidebar}
    </aside>
  );

  return (
    <div
      className={rootClass}
      {...props}
    >
      {resolvedHeader && <header className={styles.topBar}>{resolvedHeader}</header>}

      <div className={bodyClass}>
        {sidebar && sidebarPlacement === "start" && sidebarSlot}
        {sidebar && (
          <div
            className={styles.backdrop}
            onClick={() => closeSidebar("backdrop")}
            aria-hidden="true"
          />
        )}
        <main className={styles.content}>{children}</main>
        {sidebar && sidebarPlacement === "end" && sidebarSlot}
      </div>

      {resolvedFooter && <footer className={styles.bottomBar}>{resolvedFooter}</footer>}
    </div>
  );
}
