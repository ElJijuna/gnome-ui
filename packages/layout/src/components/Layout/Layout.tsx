import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Layout.module.css";

export interface LayoutProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Top bar area — typically a `Toolbar` or `HeaderBar` with logo, search,
   * and action buttons. Pinned to the top; never scrolls.
   */
  topBar?: ReactNode;
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
   */
  bottomBar?: ReactNode;
}

/**
 * Full-page application shell following the GNOME Human Interface Guidelines.
 *
 * Composes four named zones:
 * - **`topBar`** — pinned header / toolbar row (e.g. `Toolbar` with logo + search).
 * - **`sidebar`** — fixed-width lateral navigation (e.g. collapsible `Sidebar`).
 * - **`children`** — scrollable main content area.
 * - **`bottomBar`** — pinned footer / status toolbar.
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
  sidebar,
  sidebarOpen = false,
  onSidebarClose,
  children,
  bottomBar,
  className,
  ...props
}: LayoutProps) {
  const bodyClass = [
    styles.body,
    sidebar && sidebarOpen ? styles.bodySidebarOpen : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={[styles.layout, className].filter(Boolean).join(" ")}
      {...props}
    >
      {topBar && <div className={styles.topBar}>{topBar}</div>}

      <div className={bodyClass}>
        {sidebar && (
          <>
            <div className={styles.sidebar}>{sidebar}</div>
            {/* Backdrop — visible on mobile when sidebar is open */}
            <div
              className={styles.backdrop}
              onClick={onSidebarClose}
              aria-hidden="true"
            />
          </>
        )}
        <div className={styles.content}>{children}</div>
      </div>

      {bottomBar && <div className={styles.bottomBar}>{bottomBar}</div>}
    </div>
  );
}
