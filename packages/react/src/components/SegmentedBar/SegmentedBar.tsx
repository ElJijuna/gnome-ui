import { useState, memo } from "react";
import type { HTMLAttributes } from "react";
import { Tooltip } from "../Tooltip";
import styles from "./SegmentedBar.module.css";

export interface SegmentedBarSegment {
  /** Category name shown in the tooltip. */
  label: string;
  /**
   * Percentage value 0–100.
   * The sum of all segments should equal 100.
   * If it does not, values are redistributed proportionally.
   */
  value: number;
  /**
   * CSS color string for this segment.
   * When omitted, a cycling palette of GNOME design tokens is used.
   */
  color?: string;
}

export interface SegmentedBarProps extends HTMLAttributes<HTMLDivElement> {
  /** Segments to display. Each segment contributes its share of the full bar width. */
  values: SegmentedBarSegment[];
  /**
   * Accessible label for the bar as a whole.
   * Auto-generated from `values` when omitted (e.g. "TypeScript 45%, JavaScript 30%").
   */
  "aria-label"?: string;
}

const COLOR_COUNT = 8;

/**
 * Horizontal bar split into proportional segments, one per category.
 *
 * Hover a segment to highlight it and see its tooltip with label and percentage.
 * Typical use case: repository language distribution.
 *
 * ```tsx
 * <SegmentedBar
 *   values={[
 *     { label: "TypeScript", value: 60, color: "#3178c6" },
 *     { label: "JavaScript", value: 30, color: "#f7df1e" },
 *     { label: "CSS",        value: 10, color: "#563d7c" },
 *   ]}
 * />
 * ```
 */
export const SegmentedBar = memo(function SegmentedBar({
  values,
  className,
  "aria-label": ariaLabel,
  ...props
}: SegmentedBarProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const total = values.reduce((sum, s) => sum + s.value, 0) || 100;

  const defaultLabel = values.map((s) => `${s.label} ${s.value}%`).join(", ");

  return (
    <div
      role="img"
      aria-label={ariaLabel ?? defaultLabel}
      className={[styles.track, className].filter(Boolean).join(" ")}
      {...props}
    >
      {values.map((segment, i) => {
        const width = `${(segment.value / total) * 100}%`;
        const pct = segment.value % 1 === 0 ? segment.value : segment.value.toFixed(1);
        const tooltipLabel = `${segment.label}: ${pct}%`;

        return (
          <Tooltip key={segment.label} label={tooltipLabel} placement="top" delay={200}>
            <div
              className={[
                styles.segment,
                !segment.color ? styles[`color${i % COLOR_COUNT}`] : null,
                activeIndex !== null && activeIndex !== i ? styles.dimmed : null,
                activeIndex === i ? styles.highlighted : null,
              ]
                .filter(Boolean)
                .join(" ")}
              style={{
                width,
                ...(segment.color ? { backgroundColor: segment.color } : {}),
              }}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
            />
          </Tooltip>
        );
      })}
    </div>
  );
});
