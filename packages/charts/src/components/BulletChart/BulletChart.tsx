import { useNumberFormatter } from '@gnome-ui/react';

import styles from './BulletChart.module.css';

export interface BulletChartRange {
  /** Upper bound of this qualitative band. */
  value: number;
  color?: string;
}

export interface BulletChartProps {
  /** Performance measure — the current value. */
  value: number;
  /** Comparative measure — rendered as a perpendicular tick. */
  target?: number;
  min?: number;
  max?: number;
  /**
   * Ascending upper bounds for qualitative bands (e.g. poor/satisfactory/good).
   * Defaults to a neutral grayscale ramp when colors are omitted.
   */
  ranges?: BulletChartRange[];
  /** Performance bar color. Defaults to `var(--gnome-accent-color)`. */
  color?: string;
  /** Track height in px. Defaults to 32. */
  height?: number;
  /** Caption rendered to the left of the track. */
  label?: string;
  showValue?: boolean;
  valueFormatter?: (value: number) => string;
  className?: string;
  'aria-label'?: string;
}

const DEFAULT_RANGE_COLORS = [
  'var(--gnome-light-2, #f6f5f4)',
  'var(--gnome-light-3, #deddda)',
  'var(--gnome-light-4, #c0bfbc)',
];

export const BulletChart = ({
  value,
  target,
  min = 0,
  max = 100,
  ranges,
  color = 'var(--gnome-accent-color, #3584e4)',
  height = 32,
  label,
  showValue = true,
  valueFormatter,
  className,
  'aria-label': ariaLabel,
}: BulletChartProps) => {
  const formatNumber = useNumberFormatter().format;
  const format = valueFormatter ?? formatNumber;

  const domain = max - min || 1;
  const toPercent = (v: number) => `${(Math.min(max, Math.max(min, v)) - min) * (100 / domain)}%`;

  const bands = ranges?.length
    ? ranges
        .slice()
        .sort((a, b) => a.value - b.value)
        .map((range, i, sorted) => ({
          start: i === 0 ? min : sorted[i - 1].value,
          end: range.value,
          color: range.color ?? DEFAULT_RANGE_COLORS[i % DEFAULT_RANGE_COLORS.length],
        }))
    : [{ start: min, end: max, color: DEFAULT_RANGE_COLORS[1] }];

  return (
    <div
      role="img"
      aria-label={
        ariaLabel ??
        `Bullet chart: ${label ? `${label} ` : ''}${format(value)}${
          target !== undefined ? ` (target ${format(target)})` : ''
        }`
      }
      className={[styles.container, className].filter(Boolean).join(' ')}
    >
      {label && <span className={styles.label}>{label}</span>}
      <div className={styles.track} style={{ height }}>
        {bands.map((band, i) => (
          <div
            key={i}
            className={styles.band}
            style={{
              left: toPercent(band.start),
              width: `${(Math.min(max, band.end) - Math.max(min, band.start)) * (100 / domain)}%`,
              backgroundColor: band.color,
            }}
          />
        ))}
        <div className={styles.bar} style={{ width: toPercent(value), backgroundColor: color }} />
        {target !== undefined && (
          <div className={styles.target} style={{ left: toPercent(target) }} />
        )}
      </div>
      {showValue && (
        <span className={styles.value}>
          {format(value)}
          {target !== undefined && <span className={styles.targetValue}> / {format(target)}</span>}
        </span>
      )}
    </div>
  );
};
