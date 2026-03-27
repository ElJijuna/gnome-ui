import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { IconDefinition } from "@gnome-ui/icons";
import { Icon } from "../Icon";
import { useViewSwitcherSidebar } from "./ViewSwitcherSidebar";
import styles from "./ViewSwitcherSidebar.module.css";

export interface ViewSwitcherSidebarItemProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** String identifier — matched against the group's `value`. */
  name: string;
  /** View label. */
  label: string;
  /** Icon from `@gnome-ui/icons`. */
  icon?: IconDefinition;
  /**
   * Optional trailing count (unread messages, items…).
   * Rendered as a small badge at the trailing edge.
   */
  count?: number;
  /**
   * Optional trailing widget. Takes precedence over `count`.
   * Use for custom badges, buttons, or status indicators.
   */
  suffix?: ReactNode;
}

/**
 * Individual view item inside a `ViewSwitcherSidebar`.
 *
 * Renders as `role="radio"`. Only the active item is in the natural Tab order;
 * all others use `tabIndex={-1}` and are reached via arrow-key navigation.
 */
export function ViewSwitcherSidebarItem({
  name,
  label,
  icon,
  count,
  suffix,
  disabled,
  className,
  ...props
}: ViewSwitcherSidebarItemProps) {
  const { value, onValueChange } = useViewSwitcherSidebar();
  const active = value === name;
  const trailing = suffix ?? (count != null ? count : null);

  return (
    <li className={styles.item}>
      <button
        type="button"
        role="radio"
        aria-checked={active}
        tabIndex={active ? 0 : -1}
        disabled={disabled}
        onClick={() => onValueChange(name)}
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
        {trailing != null && (
          <span className={styles.itemSuffix}>
            {typeof trailing === "number" ? (
              <span className={styles.count}>{trailing > 99 ? "99+" : trailing}</span>
            ) : (
              trailing
            )}
          </span>
        )}
      </button>
    </li>
  );
}
