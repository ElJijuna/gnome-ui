import { useState, useId, type HTMLAttributes, type ReactNode } from "react";
import styles from "./SwitchRow.module.css";

export interface SwitchRowProps extends Omit<HTMLAttributes<HTMLButtonElement>, "onChange"> {
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
 * Activatable row with an integrated switch.
 *
 * The entire row is a button — clicking anywhere toggles the switch.
 * Mirrors `AdwSwitchRow`, which differs from `ActionRow + trailing Switch`
 * because the row itself is the interactive element.
 *
 * Supports both controlled (`checked`) and uncontrolled (`defaultChecked`) modes.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.SwitchRow.html
 */
export function SwitchRow({
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
}: SwitchRowProps) {
  const isControlled = controlledChecked !== undefined;
  const [uncontrolledChecked, setUncontrolledChecked] = useState(defaultChecked);
  const checked = isControlled ? controlledChecked : uncontrolledChecked;

  const switchId = useId();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const next = !checked;
    if (!isControlled) setUncontrolledChecked(next);
    onCheckedChange?.(next);
    onClick?.(e);
  };

  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-labelledby={switchId}
      disabled={disabled}
      className={[styles.row, disabled ? styles.disabled : null, className]
        .filter(Boolean)
        .join(" ")}
      onClick={handleClick}
      {...props}
    >
      {leading && <span className={styles.leading}>{leading}</span>}

      <span className={styles.content} id={switchId}>
        <span className={styles.title}>{title}</span>
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
      </span>

      {/* Visual switch indicator — aria-hidden since the button carries the role */}
      <span className={styles.switchTrack} aria-hidden="true">
        <span className={[styles.switchThumb, checked ? styles.switchThumbOn : null].filter(Boolean).join(" ")} />
      </span>
    </button>
  );
}
