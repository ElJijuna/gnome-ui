import { useNumberFormatter } from '@gnome-ui/react';
import {
  CartesianGrid,
  Legend,
  ScatterChart as RechartsScatterChart,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';

import { GNOME_CHART_PALETTE } from '../../colors';
import { GNOME_TOOLTIP_ITEM_STYLE, GNOME_TOOLTIP_STYLE } from '../../tooltipStyle';
import { type ChartLegendPosition, getLegendProps } from '../../types/legend';

import styles from './ScatterChart.module.css';

export interface ScatterChartSeries {
  data: Record<string, unknown>[];
  name?: string;
  color?: string;
  xKey?: string;
  yKey?: string;
  zKey?: string;
}

export interface ScatterChartProps {
  series: ScatterChartSeries[];
  xLabel?: string;
  yLabel?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  /** Position of the legend when `showLegend` is true. Defaults to `"bottom"`. */
  legendPosition?: ChartLegendPosition;
  bubbleRange?: [number, number];
  className?: string;
}

const AXIS_STYLE = {
  fontSize: 12,
  fill: 'var(--gnome-window-fg-color, rgba(0,0,0,0.8))',
  fontFamily: 'var(--gnome-font-family, system-ui)',
};

export const ScatterChart = ({
  series,
  xLabel,
  yLabel,
  height = 300,
  showGrid = true,
  showLegend = false,
  legendPosition = 'bottom',
  bubbleRange = [40, 400],
  className,
}: ScatterChartProps) => {
  const formatNumber = useNumberFormatter().format;
  const hasBubble = series.some((s) => s.zKey !== null);

  return (
    <div
      className={[styles.container, className].filter(Boolean).join(' ')}
      style={{ height }}
      role="img"
      aria-label="Scatter chart"
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsScatterChart accessibilityLayer margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--gnome-divider-color, rgba(0,0,0,0.07))"
            />
          )}
          <XAxis
            dataKey="x"
            type="number"
            name={xLabel ?? 'x'}
            tick={AXIS_STYLE}
            axisLine={{ stroke: 'var(--gnome-border-subtle, rgba(0,0,0,0.15))' }}
            tickLine={false}
            tickFormatter={formatNumber}
          />
          <YAxis
            dataKey="y"
            type="number"
            name={yLabel ?? 'y'}
            tick={AXIS_STYLE}
            axisLine={false}
            tickLine={false}
            width={40}
            tickFormatter={formatNumber}
          />
          {hasBubble && <ZAxis dataKey="z" range={bubbleRange} />}
          <Tooltip
            contentStyle={GNOME_TOOLTIP_STYLE}
            itemStyle={GNOME_TOOLTIP_ITEM_STYLE}
            cursor={{ strokeDasharray: '3 3' }}
            formatter={(value: number, name: string) => [formatNumber(value), name]}
          />
          {showLegend && (
            <Legend
              {...getLegendProps(legendPosition)}
              wrapperStyle={{
                fontFamily: 'var(--gnome-font-family, system-ui)',
                fontSize: 12,
              }}
            />
          )}
          {series.map((s, i) => (
            <Scatter
              key={s.name ?? i}
              name={s.name}
              data={s.data}
              fill={s.color ?? GNOME_CHART_PALETTE[i % GNOME_CHART_PALETTE.length]}
              fillOpacity={0.8}
            />
          ))}
        </RechartsScatterChart>
      </ResponsiveContainer>
    </div>
  );
};
