import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Sidebar.module.css";

export interface SidebarSectionProps extends HTMLAttributes<HTMLElement> {
  /**
   * Section heading. Rendered in small caps above the items.
   * Omit for an untitled section (e.g. the first group in a sidebar).
   */
  title?: string;
  children?: ReactNode;
}

/**
 * Named group of `SidebarItem` entries inside a `Sidebar`.
 *
 * Sections are separated by a thin divider. The title is optional —
 * omit it for the primary section when the grouping is self-evident.
 *
 * Mirrors the `AdwSidebar` section model (libadwaita 1.9 / GNOME 50).
 *
 * @example
 * ```tsx
 * <Sidebar>
 *   <SidebarSection title="Mailboxes">
 *     <SidebarItem label="Inbox" icon={GoHome} active />
 *     <SidebarItem label="Sent"  icon={Share} />
 *   </SidebarSection>
 *   <SidebarSection title="Tags">
 *     <SidebarItem label="Work"     icon={Star} />
 *     <SidebarItem label="Personal" icon={Star} />
 *   </SidebarSection>
 * </Sidebar>
 * ```
 */
export function SidebarSection({
  title,
  children,
  className,
  ...props
}: SidebarSectionProps) {
  return (
    <section
      className={[styles.section, className].filter(Boolean).join(" ")}
      {...props}
    >
      {title && (
        <h3 className={styles.sectionTitle}>{title}</h3>
      )}
      <ul role="list" className={styles.list}>
        {children}
      </ul>
    </section>
  );
}
