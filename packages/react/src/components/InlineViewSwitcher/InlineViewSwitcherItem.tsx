import type { ButtonHTMLAttributes } from "react";
import type { IconDefinition } from "@gnome-ui/icons";
import { Icon } from "../Icon";
import { useInlineViewSwitcher } from "./InlineViewSwitcher";
import styles from "./InlineViewSwitcher.module.css";

export interface InlineViewSwitcherItemProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** String identifier — used as the switcher's `value` when this item is active. */
  name: string;
  /** Visible label. */
  label?: string;
  /** Icon from `@gnome-ui/icons`. */
  icon?: IconDefinition;
}

/**
 * Individual view option inside an `InlineViewSwitcher`.
 *
 * Can be icon-only, label-only, or icon + label. For icon-only items always
 * provide an `aria-label` so screen readers can identify the view.
 */
export function InlineViewSwitcherItem({
  name,
  label,
  icon,
  disabled,
  className,
  ...props
}: InlineViewSwitcherItemProps) {
  const { value, onValueChange } = useInlineViewSwitcher();
  const active = value === name;
  const iconOnly = icon && !label;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      tabIndex={active ? 0 : -1}
      disabled={disabled}
      onClick={() => onValueChange(name)}
      className={[
        styles.item,
        active ? styles.active : null,
        iconOnly ? styles.iconOnly : null,
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
      {label && <span className={styles.itemLabel}>{label}</span>}
    </button>
  );
}
