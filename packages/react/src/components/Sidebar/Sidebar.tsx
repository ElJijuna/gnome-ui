import { createContext, useContext, type HTMLAttributes, type ReactNode } from "react";
import styles from "./Sidebar.module.css";

// ─── Context ─────────────────────────────────────────────────────────────────

/** Provides the collapsed state to all descendant `SidebarItem` components. */
export const SidebarCollapsedContext = createContext(false);

/** Returns `true` when the nearest `Sidebar` is in collapsed (icon-only) mode. */
export function useSidebarCollapsed() {
  return useContext(SidebarCollapsedContext);
}

// ─── Component ───────────────────────────────────────────────────────────────

export interface SidebarProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
  /**
   * When `true`, collapses the sidebar to icon-only mode (rail/mini).
   * Labels, suffixes, and section titles are hidden; tooltips are shown
   * automatically on hover using each `SidebarItem`'s label.
   *
   * The width transition is handled by CSS — no JS animation needed.
   */
  collapsed?: boolean;
}

/**
 * Lateral navigation panel following the Adwaita `.navigation-sidebar` style.
 *
 * Updated for libadwaita 1.9 / GNOME 50: compose with `SidebarSection` to
 * group items under named headings separated by dividers.
 * For flat (unsectioned) sidebars, place `SidebarItem` children directly.
 *
 * Pass `collapsed` to switch to icon-only rail mode with animated width transition.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.Sidebar.html
 * @see https://developer.gnome.org/hig/patterns/nav/sidebars.html
 */
export function Sidebar({ children, collapsed = false, className, ...props }: SidebarProps) {
  return (
    <SidebarCollapsedContext.Provider value={collapsed}>
      <nav
        className={[styles.sidebar, collapsed ? styles.collapsed : null, className]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {children}
      </nav>
    </SidebarCollapsedContext.Provider>
  );
}
