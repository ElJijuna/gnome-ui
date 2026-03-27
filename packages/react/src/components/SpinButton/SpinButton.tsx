import { useCallback, type KeyboardEvent, type HTMLAttributes } from "react";
import styles from "./SpinButton.module.css";

export interface SpinButtonProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Current value. */
  value: number;
  /** Called when the value changes. */
  onChange: (value: number) => void;
  /** Minimum allowed value. Defaults to `0`. */
  min?: number;
  /** Maximum allowed value. Defaults to `100`. */
  max?: number;
  /** Amount to increment/decrement per step. Defaults to `1`. */
  step?: number;
  /** Number of decimal places shown. Derived from `step` when omitted. */
  decimals?: number;
  /** Disables the control. */
  disabled?: boolean;
  /** Accessible label. Required when no visible `<label>` is associated. */
  "aria-label"?: string;
  /** Associates the control with a visible label element. */
  "aria-labelledby"?: string;
}

function countDecimals(n: number): number {
  const s = n.toString();
  const dot = s.indexOf(".");
  return dot === -1 ? 0 : s.length - dot - 1;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Numeric input with − and + buttons following the Adwaita `GtkSpinButton` style.
 *
 * Supports keyboard interaction: ↑/↓ increment by one step,
 * Page Up/Down increment by 10×, Home/End jump to min/max.
 *
 * @see https://developer.gnome.org/hig/patterns/controls/spin-buttons.html
 */
export function SpinButton({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  decimals,
  disabled = false,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: SpinButtonProps) {
  const dp = decimals ?? countDecimals(step);

  const set = useCallback(
    (next: number) => onChange(parseFloat(clamp(next, min, max).toFixed(dp))),
    [onChange, min, max, dp],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      switch (e.key) {
        case "ArrowUp":   e.preventDefault(); set(value + step); break;
        case "ArrowDown": e.preventDefault(); set(value - step); break;
        case "PageUp":    e.preventDefault(); set(value + step * 10); break;
        case "PageDown":  e.preventDefault(); set(value - step * 10); break;
        case "Home":      e.preventDefault(); set(min); break;
        case "End":       e.preventDefault(); set(max); break;
      }
    },
    [value, step, min, max, set],
  );

  return (
    <div
      role="spinbutton"
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={disabled ? undefined : handleKeyDown}
      className={[styles.spin, disabled ? styles.disabled : null, className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        disabled={disabled || value <= min}
        className={styles.btn}
        onClick={() => set(value - step)}
      >
        −
      </button>

      <span className={styles.value} aria-hidden="true">
        {value.toFixed(dp)}
      </span>

      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        disabled={disabled || value >= max}
        className={styles.btn}
        onClick={() => set(value + step)}
      >
        +
      </button>
    </div>
  );
}
