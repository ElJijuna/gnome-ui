import {
  type HTMLAttributes,
  type KeyboardEvent,
  type PointerEvent,
  useCallback,
  useRef,
} from 'react';

import styles from './RangeSlider.module.css';

export interface RangeSliderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Current `[lower, upper]` values. Both must be between `min` and `max`. */
  value: [number, number];
  /** Called when either thumb moves. */
  onChange: (value: [number, number]) => void;
  /** Minimum value. Defaults to `0`. */
  min?: number;
  /** Maximum value. Defaults to `100`. */
  max?: number;
  /**
   * Granularity of each step.
   * - Arrow keys move by one step.
   * - Page Up/Down move by 10 steps.
   * Defaults to `1`.
   */
  step?: number;
  /**
   * Minimum allowed gap between the lower and upper thumb, in value units.
   * Prevents the thumbs from crossing or overlapping. Defaults to `0`.
   */
  minDistance?: number;
  /** Disables the control. */
  disabled?: boolean;
  /**
   * Marks to display along the track.
   * Each mark can have an optional label rendered below the track.
   */
  marks?: Array<{ value: number; label?: string }>;
  /** Accessible label for the lower-bound thumb. Defaults to `"Minimum value"`. */
  minLabel?: string;
  /** Accessible label for the upper-bound thumb. Defaults to `"Maximum value"`. */
  maxLabel?: string;
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function snapToStep(v: number, min: number, step: number, decimals: number) {
  return parseFloat((Math.round((v - min) / step) * step + min).toFixed(decimals));
}

function countDecimals(n: number) {
  const s = n.toString();
  const dot = s.indexOf('.');

  return dot === -1 ? 0 : s.length - dot - 1;
}

/**
 * Dual-thumb slider for selecting a min/max range, following the Adwaita
 * `GtkScale` pattern used by `Slider`.
 *
 * Distinct from `Slider`, which only supports a single value — use `RangeSlider`
 * for range filters (price, date range, etc.) where both bounds are adjustable.
 *
 * - Pointer (mouse / touch / pen) drag either thumb, or click the track to jump
 *   the nearest thumb to that position.
 * - Keyboard: focus a thumb, then ← / → move by one step; Page Up/Down by 10
 *   steps; Home/End jump to the opposite bound (clamped by the other thumb).
 * - Thumbs cannot cross; `minDistance` enforces an optional minimum gap.
 *
 * @see https://developer.gnome.org/hig/patterns/controls/sliders.html
 */
export const RangeSlider = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  minDistance = 0,
  disabled = false,
  marks,
  minLabel = 'Minimum value',
  maxLabel = 'Maximum value',
  className,
  ...props
}: RangeSliderProps) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const trackDragIndexRef = useRef<0 | 1 | null>(null);
  const dp = countDecimals(step);

  const [lo, hi] = value;
  const loPct = ((clamp(lo, min, max) - min) / (max - min)) * 100;
  const hiPct = ((clamp(hi, min, max) - min) / (max - min)) * 100;

  const setValueAt = useCallback(
    (index: 0 | 1, raw: number) => {
      const snapped = snapToStep(raw, min, step, dp);

      if (index === 0) {
        onChange([clamp(snapped, min, hi - minDistance), hi]);
      } else {
        onChange([lo, clamp(snapped, lo + minDistance, max)]);
      }
    },
    [min, max, step, dp, minDistance, lo, hi, onChange],
  );

  const valueFromX = useCallback(
    (clientX: number) => {
      if (!trackRef.current) {
        return min;
      }

      const { left, width } = trackRef.current.getBoundingClientRect();

      return ((clientX - left) / width) * (max - min) + min;
    },
    [min, max],
  );

  const nearestThumbIndex = useCallback(
    (clientX: number): 0 | 1 => {
      const raw = valueFromX(clientX);

      return Math.abs(raw - lo) <= Math.abs(raw - hi) ? 0 : 1;
    },
    [valueFromX, lo, hi],
  );

  // ── Track: click the background to jump + drag the nearest thumb ──────────

  const handleTrackPointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (disabled) {
        return;
      }

      const index = nearestThumbIndex(e.clientX);

      trackDragIndexRef.current = index;
      e.currentTarget.setPointerCapture(e.pointerId);
      setValueAt(index, valueFromX(e.clientX));
    },
    [disabled, nearestThumbIndex, setValueAt, valueFromX],
  );

  const handleTrackPointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (trackDragIndexRef.current === null || !e.currentTarget.hasPointerCapture(e.pointerId)) {
        return;
      }

      setValueAt(trackDragIndexRef.current, valueFromX(e.clientX));
    },
    [setValueAt, valueFromX],
  );

  const handleTrackPointerUp = useCallback(() => {
    trackDragIndexRef.current = null;
  }, []);

  // ── Thumb: drag its own handle directly ────────────────────────────────────

  const makeThumbPointerDown = useCallback(
    (index: 0 | 1) => (e: PointerEvent<HTMLDivElement>) => {
      e.stopPropagation();
      if (disabled) {
        return;
      }

      e.currentTarget.setPointerCapture(e.pointerId);
      setValueAt(index, valueFromX(e.clientX));
    },
    [disabled, setValueAt, valueFromX],
  );

  const makeThumbPointerMove = useCallback(
    (index: 0 | 1) => (e: PointerEvent<HTMLDivElement>) => {
      e.stopPropagation();
      if (!e.currentTarget.hasPointerCapture(e.pointerId)) {
        return;
      }

      setValueAt(index, valueFromX(e.clientX));
    },
    [setValueAt, valueFromX],
  );

  // ── Keyboard ────────────────────────────────────────────────────────────────

  const makeThumbKeyDown = useCallback(
    (index: 0 | 1) => (e: KeyboardEvent<HTMLDivElement>) => {
      const current = index === 0 ? lo : hi;
      const set = (next: number) => {
        e.preventDefault();
        setValueAt(index, next);
      };

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          set(current + step);
          break;
        case 'ArrowLeft':
        case 'ArrowDown':
          set(current - step);
          break;
        case 'PageUp':
          set(current + step * 10);
          break;
        case 'PageDown':
          set(current - step * 10);
          break;
        case 'Home':
          set(index === 0 ? min : lo + minDistance);
          break;
        case 'End':
          set(index === 0 ? hi - minDistance : max);
          break;
      }
    },
    [lo, hi, step, min, max, minDistance, setValueAt],
  );

  const hasMarks = marks && marks.length > 0;
  const hasLabels = hasMarks && marks.some((m) => m.label);

  return (
    <div
      className={[styles.wrapper, hasLabels ? styles.hasLabels : null, className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      <div
        ref={trackRef}
        className={[styles.track, disabled ? styles.disabled : null].filter(Boolean).join(' ')}
        onPointerDown={handleTrackPointerDown}
        onPointerMove={handleTrackPointerMove}
        onPointerUp={handleTrackPointerUp}
        onPointerCancel={handleTrackPointerUp}
      >
        {/* Filled portion between the two thumbs */}
        <div className={styles.fill} style={{ left: `${loPct}%`, width: `${hiPct - loPct}%` }} />

        {/* Lower-bound thumb */}
        <div
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-valuemin={min}
          aria-valuemax={hi}
          aria-valuenow={lo}
          aria-label={minLabel}
          aria-disabled={disabled || undefined}
          className={styles.thumb}
          style={{ left: `${loPct}%` }}
          onPointerDown={makeThumbPointerDown(0)}
          onPointerMove={makeThumbPointerMove(0)}
          onKeyDown={disabled ? undefined : makeThumbKeyDown(0)}
        />

        {/* Upper-bound thumb */}
        <div
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-valuemin={lo}
          aria-valuemax={max}
          aria-valuenow={hi}
          aria-label={maxLabel}
          aria-disabled={disabled || undefined}
          className={styles.thumb}
          style={{ left: `${hiPct}%` }}
          onPointerDown={makeThumbPointerDown(1)}
          onPointerMove={makeThumbPointerMove(1)}
          onKeyDown={disabled ? undefined : makeThumbKeyDown(1)}
        />

        {/* Tick marks */}
        {hasMarks &&
          marks.map((m) => {
            const mPct = ((clamp(m.value, min, max) - min) / (max - min)) * 100;

            return (
              <div
                key={m.value}
                className={styles.tick}
                style={{ left: `${mPct}%` }}
                aria-hidden="true"
              />
            );
          })}
      </div>

      {/* Mark labels */}
      {hasLabels && (
        <div className={styles.labels} aria-hidden="true">
          {marks.map((m) => {
            const mPct = ((clamp(m.value, min, max) - min) / (max - min)) * 100;

            return (
              <span key={m.value} className={styles.markLabel} style={{ left: `${mPct}%` }}>
                {m.label}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};
