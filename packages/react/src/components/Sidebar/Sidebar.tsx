import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Sidebar.module.css";

export interface SidebarProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

/**
 * Lateral navigation panel following the Adwaita `.navigation-sidebar` style.
 *
 * Updated for libadwaita 1.9 / GNOME 50: compose with `SidebarSection` to
 * group items under named headings separated by dividers.
 * For flat (unsectioned) sidebars, place `SidebarItem` children directly.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.Sidebar.html
 * @see https://developer.gnome.org/hig/patterns/nav/sidebars.html
 */
export function Sidebar({ children, className, ...props }: SidebarProps) {
  return (
    <nav
      className={[styles.sidebar, className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </nav>
  );
}
