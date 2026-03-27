import type { HTMLAttributes } from "react";
import type { IconDefinition } from "@gnome-ui/icons";
import { Icon } from "../Icon";
import { Close } from "@gnome-ui/icons";
import styles from "./Chip.module.css";

export interface ChipProps extends HTMLAttributes<HTMLElement> {
  /** Text label displayed inside the chip. */
  label: string;
  /** Leading icon from `@gnome-ui/icons`. */
  icon?: IconDefinition;
  /**
   * When provided, renders a remove (×) button and calls this handler.
   * The chip root becomes a `<span>`; only the remove button is interactive.
   */
  onRemove?: () => void;
  /**
   * When true the chip renders as a toggle button.
   * Use `selected` + `onToggle` to control its state.
   */
  selectable?: boolean;
  /** Active/selected state. Only relevant when `selectable` is true. */
  selected?: boolean;
  /**
   * Called when a selectable chip is clicked.
   * Only relevant when `selectable` is true.
   */
  onToggle?: () => void;
  /** Disabled state — applies to both selectable chips and the remove button. */
  disabled?: boolean;
}

/**
 * Compact pill-shaped label for tags, filters, and selection states.
 *
 * Three usage modes:
 * - **Static** — just a visual label (no `onRemove`, no `selectable`).
 * - **Removable** — add `onRemove` to show a × button.
 * - **Selectable** — add `selectable` + `selected` + `onToggle` for toggle behaviour.
 *
 * Pair with `WrapBox` for multi-chip layouts.
 */
export function Chip({
  label,
  icon,
  onRemove,
  selectable = false,
  selected = false,
  onToggle,
  disabled = false,
  className,
  ...props
}: ChipProps) {
  const isInteractive = selectable && !onRemove;

  const chipClasses = [
    styles.chip,
    selected ? styles.selected : null,
    disabled ? styles.disabled : null,
    isInteractive ? styles.selectable : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {icon && (
        <span className={styles.icon}>
          <Icon icon={icon} size="sm" aria-hidden />
        </span>
      )}
      <span className={styles.label}>{label}</span>
      {onRemove && (
        <button
          type="button"
          className={styles.remove}
          aria-label={`Remove ${label}`}
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          tabIndex={disabled ? -1 : 0}
        >
          <Icon icon={Close} size="sm" aria-hidden />
        </button>
      )}
    </>
  );

  if (isInteractive) {
    return (
      <button
        type="button"
        role="checkbox"
        aria-checked={selected}
        aria-label={label}
        disabled={disabled}
        onClick={onToggle}
        className={chipClasses}
        {...(props as HTMLAttributes<HTMLButtonElement>)}
      >
        {content}
      </button>
    );
  }

  return (
    <span
      className={chipClasses}
      {...props}
    >
      {content}
    </span>
  );
}
