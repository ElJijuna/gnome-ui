export interface SparkGaugeChartThreshold {
  value: number;
  color: string;
}

export interface SparkGaugeChartProps {
  value: number;
  min?: number;
  max?: number;
  /** Defaults to `var(--gnome-accent-color, #3584e4)`. */
  color?: string;
  /** Ascending value/color bands (e.g. green/yellow/red status zones). Ignored when `color` is set. */
  thresholds?: SparkGaugeChartThreshold[];
  /** Ring diameter in px. Defaults to 40. */
  size?: number;
  /** Ring stroke width in px. Defaults to 4. */
  strokeWidth?: number;
  className?: string;
  'aria-label'?: string;
}

const resolveColor = (
  value: number,
  color: string | undefined,
  thresholds: SparkGaugeChartThreshold[] | undefined,
) => {
  if (color) {
    return color;
  }

  if (thresholds && thresholds.length > 0) {
    const sorted = [...thresholds].sort((a, b) => a.value - b.value);
    let resolved = sorted[0].color;

    for (const threshold of sorted) {
      if (value >= threshold.value) {
        resolved = threshold.color;
      }
    }

    return resolved;
  }

  return 'var(--gnome-accent-color, #3584e4)';
};

export const SparkGaugeChart = ({
  value,
  min = 0,
  max = 100,
  color,
  thresholds,
  size = 40,
  strokeWidth = 4,
  className,
  'aria-label': ariaLabel,
}: SparkGaugeChartProps) => {
  const clampedValue = Math.min(max, Math.max(min, value));
  const ratio = (clampedValue - min) / (max - min || 1);
  const radius = Math.max(0, (size - strokeWidth) / 2);
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - ratio);
  const resolvedColor = resolveColor(value, color, thresholds);
  const center = size / 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
    >
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="var(--gnome-light-3, #deddda)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={resolvedColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        transform={`rotate(-90 ${center} ${center})`}
      />
    </svg>
  );
};
