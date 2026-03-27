import type { HTMLAttributes } from "react";
import styles from "./ProgressBar.module.css";

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Current progress value between `0` and `1` (e.g. `0.6` = 60 %).
   * Omit or set to `undefined` for the indeterminate (pulsing) state.
   */
  value?: number;
  /** Accessible label describing what is loading. */
  "aria-label"?: string;
  /** Associates the bar with a visible element that labels it. */
  "aria-labelledby"?: string;
}

/**
 * Determinate and indeterminate progress bar following the Adwaita style.
 *
 * - **Determinate** — pass `value` (0–1) to show exact progress.
 * - **Indeterminate** — omit `value` for an animated pulse when duration is unknown.
 *
 * Renders as `role="progressbar"` with `aria-valuenow` / `aria-valuemin` /
 * `aria-valuemax` for screen readers.
 *
 * @see https://developer.gnome.org/hig/patterns/feedback/progress.html
 */
export function ProgressBar({
  value,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: ProgressBarProps) {
  const isIndeterminate = value === undefined || value === null;
  const clamped = isIndeterminate ? undefined : Math.min(1, Math.max(0, value));
  const percent = clamped !== undefined ? clamped * 100 : undefined;

  return (
    <div
      role="progressbar"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-valuenow={clamped !== undefined ? Math.round(percent!) : undefined}
      aria-valuemin={isIndeterminate ? undefined : 0}
      aria-valuemax={isIndeterminate ? undefined : 100}
      className={[styles.track, className].filter(Boolean).join(" ")}
      {...props}
    >
      <div
        className={[
          styles.fill,
          isIndeterminate ? styles.indeterminate : null,
        ]
          .filter(Boolean)
          .join(" ")}
        style={!isIndeterminate ? { width: `${percent}%` } : undefined}
      />
    </div>
  );
}
