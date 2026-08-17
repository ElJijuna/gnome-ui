import { useNumberFormatter } from '@gnome-ui/react';

import { GNOME_CHART_PALETTE } from '@/colors';

import styles from './BoxPlot.module.css';

export interface BoxPlotStats {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  outliers?: number[];
}

export type BoxPlotDataItem =
  | { label: string; color?: string; values: number[] }
  | ({ label: string; color?: string } & BoxPlotStats);

export interface BoxPlotProps {
  data: BoxPlotDataItem[];
  height?: number;
  /** Render individual points beyond the whiskers (values outside 1.5×IQR). Defaults to `true`. */
  showOutliers?: boolean;
  valueFormatter?: (value: number) => string;
  className?: string;
  'aria-label'?: string;
}

const percentile = (sorted: number[], p: number): number => {
  const idx = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);

  if (lower === upper) {
    return sorted[lower];
  }

  const weight = idx - lower;

  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
};

const computeStats = (values: number[]): BoxPlotStats => {
  const sorted = [...values].sort((a, b) => a - b);
  const q1 = percentile(sorted, 25);
  const median = percentile(sorted, 50);
  const q3 = percentile(sorted, 75);
  const iqr = q3 - q1;
  const lowerFence = q1 - 1.5 * iqr;
  const upperFence = q3 + 1.5 * iqr;
  const inRange = sorted.filter((v) => v >= lowerFence && v <= upperFence);
  const outliers = sorted.filter((v) => v < lowerFence || v > upperFence);

  return {
    min: inRange.length ? inRange[0] : sorted[0],
    q1,
    median,
    q3,
    max: inRange.length ? inRange[inRange.length - 1] : sorted[sorted.length - 1],
    outliers,
  };
};

const resolveStats = (item: BoxPlotDataItem): BoxPlotStats =>
  'values' in item
    ? computeStats(item.values)
    : {
        min: item.min,
        q1: item.q1,
        median: item.median,
        q3: item.q3,
        max: item.max,
        outliers: item.outliers,
      };

export const BoxPlot = ({
  data,
  height = 320,
  showOutliers = true,
  valueFormatter,
  className,
  'aria-label': ariaLabel,
}: BoxPlotProps) => {
  const formatNumber = useNumberFormatter().format;
  const format = valueFormatter ?? formatNumber;

  const resolved = data.map((item, i) => ({
    label: item.label,
    color: item.color ?? GNOME_CHART_PALETTE[i % GNOME_CHART_PALETTE.length],
    stats: resolveStats(item),
  }));

  const allValues = resolved.flatMap((r) => [
    r.stats.min,
    r.stats.max,
    ...(r.stats.outliers ?? []),
  ]);
  const rawMin = allValues.length ? Math.min(...allValues) : 0;
  const rawMax = allValues.length ? Math.max(...allValues) : 1;
  const padding = (rawMax - rawMin || 1) * 0.08;
  const domainMin = rawMin - padding;
  const domainMax = rawMax + padding;
  const domainRange = domainMax - domainMin || 1;

  const toY = (value: number) => 100 - ((value - domainMin) / domainRange) * 100;

  const ticks = [domainMax, (domainMax + domainMin) / 2, domainMin];

  return (
    <div
      role="img"
      aria-label={
        ariaLabel ??
        `Box plot: ${resolved.map((r) => `${r.label} median ${format(r.stats.median)}`).join(', ')}`
      }
      className={[styles.container, className].filter(Boolean).join(' ')}
      style={{ height }}
    >
      <div className={styles.axis}>
        {ticks.map((t, i) => (
          <span key={i} className={styles.tickLabel} style={{ top: `${toY(t)}%` }}>
            {format(t)}
          </span>
        ))}
      </div>
      <div className={styles.columns}>
        {resolved.map((r, i) => {
          const { stats, color } = r;
          const maxY = toY(stats.max);
          const minY = toY(stats.min);
          const q1Y = toY(stats.q1);
          const q3Y = toY(stats.q3);
          const medianY = toY(stats.median);

          return (
            <div key={i} className={styles.column}>
              <div
                className={styles.track}
                title={`${r.label}: min ${format(stats.min)}, Q1 ${format(stats.q1)}, median ${format(stats.median)}, Q3 ${format(stats.q3)}, max ${format(stats.max)}`}
              >
                <div
                  className={styles.whisker}
                  style={{ top: `${maxY}%`, height: `${minY - maxY}%`, backgroundColor: color }}
                />
                <div
                  className={styles.whiskerCap}
                  style={{ top: `${maxY}%`, backgroundColor: color }}
                />
                <div
                  className={styles.whiskerCap}
                  style={{ top: `${minY}%`, backgroundColor: color }}
                />
                <div
                  className={styles.box}
                  style={{
                    top: `${q3Y}%`,
                    height: `${q1Y - q3Y}%`,
                    borderColor: color,
                    backgroundColor: `color-mix(in srgb, ${color} 20%, transparent)`,
                  }}
                />
                <div className={styles.median} style={{ top: `${medianY}%` }} />
                {showOutliers &&
                  stats.outliers?.map((value, j) => (
                    <div
                      key={j}
                      className={styles.outlier}
                      style={{ top: `${toY(value)}%`, backgroundColor: color }}
                      title={`${r.label} outlier: ${format(value)}`}
                    />
                  ))}
              </div>
              <span className={styles.label}>{r.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
