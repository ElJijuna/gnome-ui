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
  bubbleRange?: [number, number];
  className?: string;
}

const AXIS_STYLE = {
  fontSize: 12,
  fill: 'var(--gnome-window-fg-color, rgba(0,0,0,0.8))',
  fontFamily: 'var(--gnome-font-family, system-ui)',
};

const TOOLTIP_CONTENT_STYLE = {
  backgroundColor: 'var(--gnome-popover-bg-color, #fff)',
  border: '1px solid var(--gnome-border-subtle, rgba(0,0,0,0.15))',
  borderRadius: 'var(--gnome-radius-md, 8px)',
  fontFamily: 'var(--gnome-font-family, system-ui)',
  fontSize: 12,
  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
};

export const ScatterChart = ({
  series,
  xLabel,
  yLabel,
  height = 300,
  showGrid = true,
  showLegend = false,
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
            contentStyle={TOOLTIP_CONTENT_STYLE}
            cursor={{ strokeDasharray: '3 3' }}
            formatter={(value: number, name: string) => [formatNumber(value), name]}
          />
          {showLegend && (
            <Legend
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
