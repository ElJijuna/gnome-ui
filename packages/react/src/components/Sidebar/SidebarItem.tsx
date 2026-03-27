import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { IconDefinition } from "@gnome-ui/icons";
import { Icon } from "../Icon";
import styles from "./Sidebar.module.css";

export interface SidebarItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Primary label. */
  label: string;
  /** Icon from `@gnome-ui/icons`. */
  icon?: IconDefinition;
  /** Marks this item as the currently active view. */
  active?: boolean;
  /** Optional trailing badge — typically a count or dot. */
  badge?: ReactNode;
}

/**
 * Individual navigation item inside a `Sidebar`.
 *
 * Renders as `<button>` so it is keyboard-accessible and works
 * without a router. Wire `onClick` to your navigation logic.
 */
export function SidebarItem({
  label,
  icon,
  active = false,
  badge,
  className,
  ...props
}: SidebarItemProps) {
  return (
    <li className={styles.item}>
      <button
        type="button"
        aria-current={active ? "page" : undefined}
        className={[
          styles.itemBtn,
          active ? styles.active : null,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {icon && (
          <span className={styles.itemIcon}>
            <Icon icon={icon} size="md" aria-hidden />
          </span>
        )}
        <span className={styles.itemLabel}>{label}</span>
        {badge && <span className={styles.itemBadge}>{badge}</span>}
      </button>
    </li>
  );
}
