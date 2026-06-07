import { useNumberFormatter } from '@gnome-ui/react';
import {
  Area,
  Bar,
  CartesianGrid,
  Legend,
  Line,
  ComposedChart as RechartsComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { GNOME_CHART_PALETTE } from '../../colors';

import styles from './ComposedChart.module.css';

export interface ComposedChartSeries {
  dataKey: string;
  type: 'bar' | 'line' | 'area';
  name?: string;
  color?: string;
}

export interface ComposedChartProps {
  data: Record<string, unknown>[];
  series: ComposedChartSeries[];
  xAxisKey?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
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

export const ComposedChart = ({
  data,
  series,
  xAxisKey = 'name',
  height = 300,
  showGrid = true,
  showLegend = false,
  className,
}: ComposedChartProps) => {
  const formatNumber = useNumberFormatter().format;

  return (
    <div className={[styles.container, className].filter(Boolean).join(' ')} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
            contentStyle={TOOLTIP_CONTENT_STYLE}
            cursor={{ fill: 'var(--gnome-card-shade-color, rgba(0,0,0,0.07))' }}
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
          {series.map((s, i) => {
            const color = s.color ?? GNOME_CHART_PALETTE[i % GNOME_CHART_PALETTE.length];

            if (s.type === 'bar') {
              return (
                <Bar
                  key={s.dataKey}
                  dataKey={s.dataKey}
                  name={s.name ?? s.dataKey}
                  fill={color}
                  radius={[4, 4, 0, 0]}
                />
              );
            }

            if (s.type === 'area') {
              return (
                <Area
                  key={s.dataKey}
                  dataKey={s.dataKey}
                  name={s.name ?? s.dataKey}
                  stroke={color}
                  fill={color}
                  fillOpacity={0.15}
                  strokeWidth={2}
                  dot={false}
                  type="monotone"
                />
              );
            }

            return (
              <Line
                key={s.dataKey}
                dataKey={s.dataKey}
                name={s.name ?? s.dataKey}
                stroke={color}
                strokeWidth={2}
                dot={false}
                type="monotone"
              />
            );
          })}
        </RechartsComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
