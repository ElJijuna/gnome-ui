import type { ButtonHTMLAttributes } from "react";
import type { IconDefinition } from "@gnome-ui/icons";
import { Icon } from "../Icon";
import styles from "./ViewSwitcher.module.css";

export interface ViewSwitcherItemProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Display label. */
  label: string;
  /** Optional icon from `@gnome-ui/icons`. */
  icon?: IconDefinition;
  /** Marks this item as the currently active view. */
  active?: boolean;
}

/**
 * Individual option inside a `ViewSwitcher`.
 *
 * Renders as `role="radio"` so the group has proper radiogroup semantics.
 */
export function ViewSwitcherItem({
  label,
  icon,
  active = false,
  className,
  disabled,
  ...props
}: ViewSwitcherItemProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      tabIndex={active ? 0 : -1}
      disabled={disabled}
      className={[
        styles.item,
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
    </button>
  );
}
