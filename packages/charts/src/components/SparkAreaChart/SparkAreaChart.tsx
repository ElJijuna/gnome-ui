import { useId, useState } from 'react';
import { Area, AreaChart as RechartsAreaChart, ResponsiveContainer } from 'recharts';

import { GNOME_CHART_PALETTE } from '../../colors';
import type { SparkSeries } from '../../types/spark';

type SparkData = number[] | Record<string, unknown>[];

export type { SparkSeries };

export interface SparkAreaChartProps {
  data: SparkData;
  /**
   * Data key to plot. Ignored when `series` is provided.
   * Required when `data` is an array of objects. Defaults to `"value"`.
   */
  dataKey?: string;
  /**
   * Stroke and fill colour. Ignored when `series` is provided.
   * Defaults to `var(--gnome-accent-color, #3584e4)`.
   */
  color?: string;
  /**
   * Multiple series to render on the same chart.
   * When provided, `dataKey` and `color` are ignored.
   * Data must be an array of objects containing all series keys.
   *
   * @example
   * <SparkAreaChart
   *   data={[{ up: 42, down: 18 }, { up: 58, down: 24 }]}
   *   series={[{ key: 'up' }, { key: 'down', color: '#e01b24' }]}
   * />
   */
  series?: SparkSeries[];
  /** Chart height in px. Defaults to 40. */
  height?: number;
  /** Stroke width. Defaults to 1.5. */
  strokeWidth?: number;
  /** Render gradient fill. Defaults to `true`. */
  gradient?: boolean;
  /** Fill opacity when `gradient` is `false`. Defaults to 0.2. */
  fillOpacity?: number;
  /**
   * Enable hover-based emphasis.
   *
   * When `true`, moving the pointer over the chart intensifies the fill
   * (gradient stops 40 % → 0 % at rest, 70 % → 10 % on hover) and
   * increases the stroke width by 0.5 px on hover.
   * No visual change occurs without pointer interaction.
   */
  highlighted?: boolean;
  className?: string;
  'aria-label'?: string;
}

function normalize(data: SparkData, key: string): Record<string, unknown>[] {
  if (!data.length) {
    return [];
  }

  return typeof data[0] === 'number'
    ? (data as number[]).map((v) => ({ [key]: v }))
    : (data as Record<string, unknown>[]);
}

export const SparkAreaChart = ({
  data,
  dataKey = 'value',
  color = 'var(--gnome-accent-color, #3584e4)',
  series,
  height = 40,
  strokeWidth = 1.5,
  gradient = true,
  fillOpacity = 0.2,
  highlighted = false,
  className,
  'aria-label': ariaLabel,
}: SparkAreaChartProps) => {
  const uid = useId();
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const activeSeries = series
    ? series.map((s, i) => ({
        key: s.key,
        color: s.color ?? GNOME_CHART_PALETTE[i % GNOME_CHART_PALETTE.length],
      }))
    : [{ key: dataKey, color }];

  const isMultiSeries = activeSeries.length > 1;

  const normalized =
    activeSeries.length === 1
      ? normalize(data, activeSeries[0].key)
      : (data as Record<string, unknown>[]);

  // Single series: full container triggers hover (easier target than a thin stroke).
  // Multi-series: each Area sets its own key so only one series highlights at a time.
  const isSeriesActive = (key: string) => highlighted && hoveredKey === key;

  return (
    <div
      style={{ width: '100%', height }}
      className={className}
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      onMouseEnter={
        highlighted && !isMultiSeries ? () => setHoveredKey(activeSeries[0].key) : undefined
      }
      onMouseLeave={highlighted ? () => setHoveredKey(null) : undefined}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart
          accessibilityLayer
          data={normalized}
          margin={{ top: 2, right: 0, left: 0, bottom: 0 }}
        >
          {gradient && (
            <defs>
              {activeSeries.map((s) => (
                <linearGradient
                  key={s.key}
                  id={`spark-area-${uid}-${s.key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={s.color}
                    stopOpacity={isSeriesActive(s.key) ? 0.7 : 0.4}
                  />
                  <stop
                    offset="95%"
                    stopColor={s.color}
                    stopOpacity={isSeriesActive(s.key) ? 0.1 : 0}
                  />
                </linearGradient>
              ))}
            </defs>
          )}
          {activeSeries.map((s) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              stroke={s.color}
              strokeWidth={isSeriesActive(s.key) ? strokeWidth + 0.5 : strokeWidth}
              fill={gradient ? `url(#spark-area-${uid}-${s.key})` : s.color}
              fillOpacity={gradient ? 1 : fillOpacity}
              dot={false}
              isAnimationActive={false}
              onMouseEnter={isMultiSeries && highlighted ? () => setHoveredKey(s.key) : undefined}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
};
