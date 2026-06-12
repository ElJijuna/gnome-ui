import { type ReactElement, type ReactNode, useId, useState } from 'react';
import {
  Area,
  Line,
  AreaChart as RechartsAreaChart,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
} from 'recharts';

import { GNOME_CHART_PALETTE } from '../../colors';
import type { SparkSeries } from '../../types/spark';

type SparkData = number[] | Record<string, unknown>[];

export type { SparkSeries };

export interface SparkLineChartProps {
  data: SparkData;
  /**
   * Data key to plot. Ignored when `series` is provided.
   * Required when `data` is an array of objects. Defaults to `"value"`.
   */
  dataKey?: string;
  /**
   * Stroke colour. Ignored when `series` is provided.
   * Defaults to `var(--gnome-accent-color, #3584e4)`.
   */
  color?: string;
  /**
   * Multiple series to render on the same chart.
   * When provided, `dataKey` and `color` are ignored.
   * Data must be an array of objects containing all series keys.
   *
   * @example
   * <SparkLineChart
   *   data={[{ sent: 42, received: 18 }, { sent: 58, received: 24 }]}
   *   series={[{ key: 'sent' }, { key: 'received', color: '#e01b24' }]}
   * />
   */
  series?: SparkSeries[];
  /** Chart height in px. Defaults to 40. */
  height?: number;
  /** Stroke width. Defaults to 1.5. */
  strokeWidth?: number;
  /**
   * Enable hover-based emphasis.
   *
   * When `true`, moving the pointer over the chart reveals a gradient area
   * fill beneath each line (stops 40 % → 0 %). At rest no fill is shown.
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

export const SparkLineChart = ({
  data,
  dataKey = 'value',
  color = 'var(--gnome-accent-color, #3584e4)',
  series,
  height = 40,
  strokeWidth = 1.5,
  highlighted = false,
  className,
  'aria-label': ariaLabel,
}: SparkLineChartProps) => {
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

  const isSeriesActive = (key: string) => highlighted && hoveredKey === key;

  const container = (chart: ReactNode) => (
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
        {chart as ReactElement}
      </ResponsiveContainer>
    </div>
  );

  // When highlighted, always use AreaChart to avoid remounting on hover.
  // Multi-series: each Area fires its own onMouseEnter to highlight only that series.
  // Single series: container hover controls fillOpacity (0 at rest → 1 on hover).
  if (highlighted) {
    return container(
      <RechartsAreaChart
        accessibilityLayer
        data={normalized}
        margin={{ top: 2, right: 0, left: 0, bottom: 0 }}
      >
        <defs>
          {activeSeries.map((s) => (
            <linearGradient
              key={s.key}
              id={`spark-line-${uid}-${s.key}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="5%" stopColor={s.color} stopOpacity={0.4} />
              <stop offset="95%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        {activeSeries.map((s) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            stroke={s.color}
            strokeWidth={strokeWidth}
            fill={`url(#spark-line-${uid}-${s.key})`}
            fillOpacity={isSeriesActive(s.key) ? 1 : 0}
            dot={false}
            isAnimationActive={false}
            onMouseEnter={isMultiSeries ? () => setHoveredKey(s.key) : undefined}
          />
        ))}
      </RechartsAreaChart>,
    );
  }

  return container(
    <RechartsLineChart
      accessibilityLayer
      data={normalized}
      margin={{ top: 2, right: 0, left: 0, bottom: 0 }}
    >
      {activeSeries.map((s) => (
        <Line
          key={s.key}
          type="monotone"
          dataKey={s.key}
          stroke={s.color}
          strokeWidth={strokeWidth}
          dot={false}
          isAnimationActive={false}
        />
      ))}
    </RechartsLineChart>,
  );
};
