export interface SparkBulletChartRange {
  /** Upper bound of this qualitative band. */
  value: number;
  color?: string;
}

export interface SparkBulletChartProps {
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
  ranges?: SparkBulletChartRange[];
  /** Performance bar color. Defaults to `var(--gnome-accent-color)`. */
  color?: string;
  /** Track height in px. Defaults to 16. */
  height?: number;
  className?: string;
  'aria-label'?: string;
}

const DEFAULT_RANGE_COLORS = [
  'var(--gnome-light-2, #f6f5f4)',
  'var(--gnome-light-3, #deddda)',
  'var(--gnome-light-4, #c0bfbc)',
];

export const SparkBulletChart = ({
  value,
  target,
  min = 0,
  max = 100,
  ranges,
  color = 'var(--gnome-accent-color, #3584e4)',
  height = 16,
  className,
  'aria-label': ariaLabel,
}: SparkBulletChartProps) => {
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
      style={{ position: 'relative', width: '100%', height, borderRadius: 3, overflow: 'hidden' }}
      className={className}
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
    >
      {bands.map((band, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: toPercent(band.start),
            width: `${(Math.min(max, band.end) - Math.max(min, band.start)) * (100 / domain)}%`,
            backgroundColor: band.color,
          }}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          top: '30%',
          bottom: '30%',
          left: 0,
          width: toPercent(value),
          borderRadius: 2,
          backgroundColor: color,
        }}
      />
      {target !== undefined && (
        <div
          style={{
            position: 'absolute',
            top: '12%',
            bottom: '12%',
            left: toPercent(target),
            width: 2,
            transform: 'translateX(-1px)',
            backgroundColor: 'var(--gnome-window-fg-color, rgb(0 0 0 / 0.8))',
          }}
        />
      )}
    </div>
  );
};
