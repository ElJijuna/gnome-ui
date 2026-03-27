import {
  useRef,
  useCallback,
  type PointerEvent,
  type KeyboardEvent,
  type HTMLAttributes,
} from "react";
import styles from "./Slider.module.css";

export interface SliderProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Current value. Must be between `min` and `max`. */
  value: number;
  /** Called when the value changes. */
  onChange: (value: number) => void;
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
  /** Disables the control. */
  disabled?: boolean;
  /**
   * Marks to display along the track.
   * Each mark can have an optional label rendered below the track.
   */
  marks?: Array<{ value: number; label?: string }>;
  /** Accessible label. Required when no visible `<label>` is present. */
  "aria-label"?: string;
  /** Associates the control with a visible label element. */
  "aria-labelledby"?: string;
  /** `id` of an element that describes the current value (e.g. a live region). */
  "aria-describedby"?: string;
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function snapToStep(v: number, min: number, step: number, decimals: number) {
  return parseFloat((Math.round((v - min) / step) * step + min).toFixed(decimals));
}

function countDecimals(n: number) {
  const s = n.toString();
  const dot = s.indexOf(".");
  return dot === -1 ? 0 : s.length - dot - 1;
}

/**
 * Draggable range slider following the Adwaita `GtkScale` pattern.
 *
 * - Pointer (mouse / touch / pen) drag to set value continuously.
 * - Keyboard: ← / → move by one step; Page Up/Down by 10 steps; Home/End jump to bounds.
 * - Optional tick marks with labels.
 * - Fills the track from the left up to the thumb (accent colour).
 *
 * @see https://developer.gnome.org/hig/patterns/controls/sliders.html
 */
export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  marks,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  ...props
}: SliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dp = countDecimals(step);

  const pct = ((clamp(value, min, max) - min) / (max - min)) * 100;

  const setFromX = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return;
      const { left, width } = trackRef.current.getBoundingClientRect();
      const raw = ((clientX - left) / width) * (max - min) + min;
      onChange(clamp(snapToStep(raw, min, step, dp), min, max));
    },
    [min, max, step, dp, onChange]
  );

  // Pointer drag — capture on the thumb, move anywhere
  const handlePointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (disabled) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      setFromX(e.clientX);
    },
    [disabled, setFromX]
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
      setFromX(e.clientX);
    },
    [setFromX]
  );

  // Keyboard
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const set = (next: number) => {
        e.preventDefault();
        onChange(clamp(snapToStep(next, min, step, dp), min, max));
      };
      switch (e.key) {
        case "ArrowRight":
        case "ArrowUp":
          set(value + step);
          break;
        case "ArrowLeft":
        case "ArrowDown":
          set(value - step);
          break;
        case "PageUp":
          set(value + step * 10);
          break;
        case "PageDown":
          set(value - step * 10);
          break;
        case "Home":
          set(min);
          break;
        case "End":
          set(max);
          break;
      }
    },
    [value, step, min, max, dp, onChange]
  );

  const hasMarks   = marks && marks.length > 0;
  const hasLabels  = hasMarks && marks.some((m) => m.label);

  return (
    <div
      className={[
        styles.wrapper,
        hasLabels ? styles.hasLabels : null,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {/* Accessible slider */}
      <div
        ref={trackRef}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        aria-disabled={disabled || undefined}
        className={[styles.track, disabled ? styles.disabled : null]
          .filter(Boolean)
          .join(" ")}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onKeyDown={disabled ? undefined : handleKeyDown}
      >
        {/* Filled portion */}
        <div className={styles.fill} style={{ width: `${pct}%` }} />

        {/* Thumb */}
        <div
          className={styles.thumb}
          style={{ left: `${pct}%` }}
          aria-hidden="true"
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
              <span
                key={m.value}
                className={styles.markLabel}
                style={{ left: `${mPct}%` }}
              >
                {m.label}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
