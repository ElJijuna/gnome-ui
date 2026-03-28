import { useState, useId, type HTMLAttributes, type ReactNode } from "react";
import styles from "./CheckRow.module.css";

export interface CheckRowProps extends Omit<HTMLAttributes<HTMLButtonElement>, "onChange"> {
  /** Primary label. */
  title: string;
  /** Secondary line below the title. */
  subtitle?: string;
  /** Icon or image placed at the leading edge. */
  leading?: ReactNode;
  /** Controlled checked state. */
  checked?: boolean;
  /** Initial checked state when uncontrolled. Defaults to `false`. */
  defaultChecked?: boolean;
  /** Called when the checked state changes. */
  onCheckedChange?: (checked: boolean) => void;
  /** Disables the row. */
  disabled?: boolean;
}

/**
 * Activatable row with an integrated checkbox.
 *
 * The entire row is a button — clicking anywhere toggles the checkbox.
 * Mirrors the `AdwCheckButton`-in-a-row pattern used in list selection contexts.
 *
 * Supports both controlled (`checked`) and uncontrolled (`defaultChecked`) modes.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.CheckButton.html
 */
export function CheckRow({
  title,
  subtitle,
  leading,
  checked: controlledChecked,
  defaultChecked = false,
  onCheckedChange,
  disabled = false,
  className,
  onClick,
  ...props
}: CheckRowProps) {
  const isControlled = controlledChecked !== undefined;
  const [uncontrolledChecked, setUncontrolledChecked] = useState(defaultChecked);
  const checked = isControlled ? controlledChecked : uncontrolledChecked;

  const labelId = useId();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const next = !checked;
    if (!isControlled) setUncontrolledChecked(next);
    onCheckedChange?.(next);
    onClick?.(e);
  };

  return (
    <button
      role="checkbox"
      aria-checked={checked}
      aria-labelledby={labelId}
      disabled={disabled}
      className={[styles.row, disabled ? styles.disabled : null, className]
        .filter(Boolean)
        .join(" ")}
      onClick={handleClick}
      {...props}
    >
      {/* Visual checkbox — aria-hidden since the button carries the role */}
      <span className={styles.checkboxWrap} aria-hidden="true">
        <span className={[styles.checkbox, checked ? styles.checkboxChecked : null].filter(Boolean).join(" ")}>
          {checked && (
            <svg className={styles.checkmark} width="12" height="12" viewBox="0 0 12 12" focusable="false">
              <path
                d="M2 6l3 3 5-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
      </span>

      {leading && <span className={styles.leading}>{leading}</span>}

      <span className={styles.content} id={labelId}>
        <span className={styles.title}>{title}</span>
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
      </span>
    </button>
  );
}
