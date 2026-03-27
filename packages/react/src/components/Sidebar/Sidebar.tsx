import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Sidebar.module.css";

export interface SidebarProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

/**
 * Lateral navigation panel following the Adwaita `.navigation-sidebar` style.
 *
 * Renders as `<nav>`. Compose with `SidebarItem` for individual entries.
 *
 * @see https://developer.gnome.org/hig/patterns/nav/sidebars.html
 */
export function Sidebar({ children, className, ...props }: SidebarProps) {
  return (
    <nav
      className={[styles.sidebar, className].filter(Boolean).join(" ")}
      {...props}
    >
      <ul role="list" className={styles.list}>
        {children}
      </ul>
    </nav>
  );
}
