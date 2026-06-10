import { useNumberFormatter } from '@gnome-ui/react';
import {
  Bar,
  CartesianGrid,
  Legend,
  BarChart as RechartsBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { GNOME_CHART_PALETTE } from '../../colors';
import { GNOME_TOOLTIP_ITEM_STYLE, GNOME_TOOLTIP_STYLE } from '../../tooltipStyle';
import { type ChartLegendPosition, getLegendProps } from '../../types/legend';

import styles from './BarChart.module.css';

export interface BarChartSeries {
  dataKey: string;
  name?: string;
  color?: string;
}

export interface BarChartProps {
  data: Record<string, unknown>[];
  series: BarChartSeries[];
  xAxisKey?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  /** Position of the legend when `showLegend` is true. Defaults to `"bottom"`. */
  legendPosition?: ChartLegendPosition;
  className?: string;
}

const AXIS_STYLE = {
  fontSize: 12,
  fill: 'var(--gnome-window-fg-color, rgba(0,0,0,0.8))',
  fontFamily: 'var(--gnome-font-family, system-ui)',
};

export const BarChart = ({
  data,
  series,
  xAxisKey = 'name',
  height = 300,
  showGrid = true,
  showLegend = false,
  legendPosition = 'bottom',
  className,
}: BarChartProps) => {
  const formatNumber = useNumberFormatter().format;

  return (
    <div className={[styles.container, className].filter(Boolean).join(' ')} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          accessibilityLayer
          data={data}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--gnome-divider-color, rgba(0,0,0,0.07))"
              vertical={false}
            />
          )}
          <XAxis
            dataKey={xAxisKey}
            tick={AXIS_STYLE}
            axisLine={{ stroke: 'var(--gnome-border-subtle, rgba(0,0,0,0.15))' }}
            tickLine={false}
          />
          <YAxis
            tick={AXIS_STYLE}
            axisLine={false}
            tickLine={false}
            width={40}
            tickFormatter={formatNumber}
          />
          <Tooltip
            contentStyle={GNOME_TOOLTIP_STYLE}
            itemStyle={GNOME_TOOLTIP_ITEM_STYLE}
            cursor={{ fill: 'var(--gnome-card-shade-color, rgba(0,0,0,0.07))' }}
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
            <Bar
              key={s.dataKey}
              dataKey={s.dataKey}
              name={s.name ?? s.dataKey}
              fill={s.color ?? GNOME_CHART_PALETTE[i % GNOME_CHART_PALETTE.length]}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};
