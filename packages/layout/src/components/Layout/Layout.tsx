import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Layout.module.css";

export type LayoutHeight = "viewport" | "parent";
export type LayoutScroll = "content" | "page" | "none";

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
   * Controls sidebar visibility **on narrow (mobile) viewports only**.
   * On wider viewports the sidebar is always visible regardless of this prop.
   * Defaults to `false`.
   */
  sidebarOpen?: boolean;
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
  sidebarOpen = false,
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
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={rootClass}
      {...props}
    >
      {resolvedHeader && <header className={styles.topBar}>{resolvedHeader}</header>}

      <div className={bodyClass}>
        {sidebar && (
          <>
            <aside className={styles.sidebar}>{sidebar}</aside>
            {/* Backdrop — visible on mobile when sidebar is open */}
            <div
              className={styles.backdrop}
              onClick={onSidebarClose}
              aria-hidden="true"
            />
          </>
        )}
        <main className={styles.content}>{children}</main>
      </div>

      {resolvedFooter && <footer className={styles.bottomBar}>{resolvedFooter}</footer>}
    </div>
  );
}
