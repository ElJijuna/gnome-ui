import { useState, useId, useCallback, type HTMLAttributes, type ReactNode, type KeyboardEvent } from "react";
import styles from "./SpinRow.module.css";

export interface SpinRowProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Primary label. */
  title: string;
  /** Secondary line below the title. */
  subtitle?: string;
  /** Icon or image placed at the leading edge. */
  leading?: ReactNode;
  /** Current value (controlled). */
  value?: number;
  /** Initial value when uncontrolled. Defaults to `0`. */
  defaultValue?: number;
  /** Called when the value changes. */
  onValueChange?: (value: number) => void;
  /** Minimum allowed value. Defaults to `0`. */
  min?: number;
  /** Maximum allowed value. Defaults to `100`. */
  max?: number;
  /** Amount to increment/decrement per step. Defaults to `1`. */
  step?: number;
  /** Number of decimal places shown. Derived from `step` when omitted. */
  decimals?: number;
  /** Disables the row. */
  disabled?: boolean;
}

function countDecimals(n: number): number {
  const s = n.toString();
  const dot = s.indexOf(".");
  return dot === -1 ? 0 : s.length - dot - 1;
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

/**
 * Settings row with an integrated spin button for numeric values.
 *
 * Mirrors `AdwSpinRow` — a standard row layout with − / + buttons at the
 * trailing edge. Use inside a `BoxedList` for settings with numeric ranges
 * (volume, timeout duration, count limits, etc.).
 *
 * Supports both controlled (`value`) and uncontrolled (`defaultValue`) modes.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.SpinRow.html
 */
export function SpinRow({
  title,
  subtitle,
  leading,
  value: controlledValue,
  defaultValue = 0,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  decimals,
  disabled = false,
  className,
  ...props
}: SpinRowProps) {
  const isControlled = controlledValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const value = isControlled ? controlledValue : uncontrolledValue;

  const dp = decimals ?? countDecimals(step);
  const spinId = useId();

  const set = useCallback(
    (next: number) => {
      const clamped = parseFloat(clamp(next, min, max).toFixed(dp));
      if (!isControlled) setUncontrolledValue(clamped);
      onValueChange?.(clamped);
    },
    [isControlled, min, max, dp, onValueChange],
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
      className={[styles.row, disabled ? styles.disabled : null, className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {leading && <span className={styles.leading}>{leading}</span>}

      <span className={styles.content}>
        <span className={styles.title}>{title}</span>
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
      </span>

      {/* Spin button widget */}
      <div
        role="spinbutton"
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-labelledby={spinId}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={disabled ? undefined : handleKeyDown}
        className={styles.spin}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          disabled={disabled || value <= min}
          className={styles.spinBtn}
          onClick={(e) => { e.stopPropagation(); set(value - step); }}
        >
          −
        </button>

        <span id={spinId} className={styles.spinValue} aria-hidden="true">
          {value.toFixed(dp)}
        </span>

        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          disabled={disabled || value >= max}
          className={styles.spinBtn}
          onClick={(e) => { e.stopPropagation(); set(value + step); }}
        >
          +
        </button>
      </div>
    </div>
  );
}
