import type { HTMLAttributes } from 'react';

import styles from './LevelBar.module.css';

export type LevelBarVariant = 'accent' | 'success' | 'warning' | 'error';

export interface LevelBarProps extends HTMLAttributes<HTMLDivElement> {
  /** Current value, between `min` and `max`. */
  value: number;
  /** Minimum value. Defaults to `0`. */
  min?: number;
  /** Maximum value. Defaults to `1`. */
  max?: number;
  /** Threshold at or below which the bar renders in `lowVariant`. */
  low?: number;
  /** Colour used when `value <= low`. Defaults to `"warning"`. */
  lowVariant?: LevelBarVariant;
  /** Threshold at or above which the bar renders in `highVariant`. */
  high?: number;
  /** Colour used when `value >= high`. Defaults to `"error"`. */
  highVariant?: LevelBarVariant;
  /** Colour used between `low` and `high`. Defaults to `"accent"`. */
  variant?: LevelBarVariant;
  /**
   * Render as a row of discrete blocks instead of a continuous fill —
   * mirrors GtkLevelBar's discrete mode (e.g. signal-strength indicators).
   */
  discrete?: boolean;
  /** Number of blocks when `discrete` is true. Defaults to `10`. */
  numBlocks?: number;
  /** Accessible label describing what the level represents. */
  'aria-label'?: string;
  /** Associates the bar with a visible element that labels it. */
  'aria-labelledby'?: string;
}

const resolveVariant = (
  value: number,
  low: number | undefined,
  lowVariant: LevelBarVariant,
  high: number | undefined,
  highVariant: LevelBarVariant,
  variant: LevelBarVariant,
): LevelBarVariant => {
  if (low !== undefined && value <= low) {
    return lowVariant;
  }

  if (high !== undefined && value >= high) {
    return highVariant;
  }

  return variant;
};

/**
 * Discrete level indicator with colour-coded low/high offset zones —
 * mirrors `GtkLevelBar`. Use for a gauge/measurement display (disk usage,
 * battery, signal strength), not for task progress — see `ProgressBar` for
 * that — and not for a proportional category breakdown — see `SegmentedBar`
 * for that.
 *
 * Renders as `role="meter"`, the WAI-ARIA role for a scalar measurement
 * within a known range (distinct from `role="progressbar"`).
 */
export const LevelBar = ({
  value,
  min = 0,
  max = 1,
  low,
  lowVariant = 'warning',
  high,
  highVariant = 'error',
  variant = 'accent',
  discrete = false,
  numBlocks = 10,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...props
}: LevelBarProps) => {
  const range = max - min;
  const clamped = Math.min(max, Math.max(min, value));
  const fraction = range > 0 ? (clamped - min) / range : 0;
  const resolvedVariant = resolveVariant(clamped, low, lowVariant, high, highVariant, variant);

  return (
    <div
      role="meter"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-valuenow={clamped}
      aria-valuemin={min}
      aria-valuemax={max}
      className={[styles.track, discrete ? styles.discrete : null, className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {discrete ? (
        Array.from({ length: numBlocks }, (_, i) => {
          const blockFraction = (i + 1) / numBlocks;

          return (
            <span
              key={i}
              aria-hidden="true"
              className={[styles.block, blockFraction <= fraction ? styles[resolvedVariant] : null]
                .filter(Boolean)
                .join(' ')}
            />
          );
        })
      ) : (
        <div
          className={[styles.fill, styles[resolvedVariant]].filter(Boolean).join(' ')}
          style={{ width: `${fraction * 100}%` }}
        />
      )}
    </div>
  );
};
