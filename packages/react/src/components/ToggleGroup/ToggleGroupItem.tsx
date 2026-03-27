import type { ButtonHTMLAttributes } from "react";
import type { IconDefinition } from "@gnome-ui/icons";
import { Icon } from "../Icon";
import { useToggleGroup } from "./ToggleGroup";
import styles from "./ToggleGroup.module.css";

export interface ToggleGroupItemProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** String identifier — used as the group's `value` when this item is selected. */
  name: string;
  /** Visible label. Omit for icon-only items (provide `aria-label` instead). */
  label?: string;
  /** Icon from `@gnome-ui/icons`. */
  icon?: IconDefinition;
}

/**
 * Individual toggle inside a `ToggleGroup`.
 *
 * Can be icon-only, label-only, or icon + label. For icon-only items always
 * provide an `aria-label` so screen readers can identify the option.
 */
export function ToggleGroupItem({
  name,
  label,
  icon,
  disabled,
  className,
  ...props
}: ToggleGroupItemProps) {
  const { value, onValueChange } = useToggleGroup();
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
