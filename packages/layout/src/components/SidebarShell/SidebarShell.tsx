import type { ReactNode } from "react";
import { Sidebar, type SidebarProps } from "@gnome-ui/react";
import styles from "./SidebarShell.module.css";

export interface SidebarShellProps extends Omit<SidebarProps, "children"> {
  /** Fixed header area above the navigation list. */
  header?: ReactNode;
  /** Navigation content, usually `SidebarSection` children. */
  children?: ReactNode;
  /** Fixed footer area below the navigation list. */
  footer?: ReactNode;
}

/**
 * Full-height sidebar composition with fixed header/footer and scrollable
 * GNOME `Sidebar` navigation in the middle.
 */
export function SidebarShell({
  header,
  children,
  footer,
  collapsed,
  className,
  ...sidebarProps
}: SidebarShellProps) {
  return (
    <div
      className={[
        styles.shell,
        collapsed ? styles.collapsed : null,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {header && <div className={styles.header}>{header}</div>}
      <Sidebar className={styles.navigation} collapsed={collapsed} {...sidebarProps}>
        {children}
      </Sidebar>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
}
