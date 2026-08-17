import { useNumberFormatter } from '@gnome-ui/react';
import type { TooltipProps } from 'recharts';
import {
  Bar,
  CartesianGrid,
  Cell,
  LabelList,
  BarChart as RechartsBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { GNOME_TOOLTIP_ITEM_STYLE, GNOME_TOOLTIP_STYLE } from '@/tooltipStyle';

import styles from './WaterfallChart.module.css';

export interface WaterfallChartDataItem {
  label: string;
  value: number;
  /** Anchor this bar to zero (absolute value) instead of floating from the running total — for start/end/subtotal bars. */
  isTotal?: boolean;
}

export interface WaterfallChartProps {
  data: WaterfallChartDataItem[];
  height?: number;
  /** Color for positive (increase) bars. Defaults to green. */
  increaseColor?: string;
  /** Color for negative (decrease) bars. Defaults to red. */
  decreaseColor?: string;
  /** Color for `isTotal` bars. Defaults to the accent color. */
  totalColor?: string;
  showGrid?: boolean;
  /** Show the signed delta (or absolute value for totals) above each bar. */
  showValues?: boolean;
  valueFormatter?: (value: number) => string;
  className?: string;
  'aria-label'?: string;
}

const AXIS_STYLE = {
  fontSize: 12,
  fill: 'var(--gnome-window-fg-color, rgba(0,0,0,0.8))',
  fontFamily: 'var(--gnome-font-family, system-ui)',
};

const LABEL_STYLE = {
  fontSize: 11,
  fill: 'var(--gnome-window-fg-color, rgba(0,0,0,0.8))',
  fontFamily: 'var(--gnome-font-family, system-ui)',
};

type Kind = 'increase' | 'decrease' | 'total';

const buildChartData = (data: WaterfallChartDataItem[], format: (value: number) => string) => {
  let cumulative = 0;

  return data.map((item) => {
    let base: number;
    let barValue: number;
    let kind: Kind;

    if (item.isTotal) {
      base = 0;
      barValue = item.value;
      kind = 'total';
      cumulative = item.value;
    } else {
      const start = cumulative;
      const end = cumulative + item.value;
      base = Math.min(start, end);
      barValue = Math.abs(item.value);
      kind = item.value >= 0 ? 'increase' : 'decrease';
      cumulative = end;
    }

    return {
      name: item.label,
      base,
      value: barValue,
      kind,
      rawValue: item.value,
      displayValue: kind === 'total' ? format(item.value) : `${item.value >= 0 ? '+' : ''}${format(item.value)}`,
    };
  });
};

const WaterfallTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (!active || !payload?.length) {
    return null;
  }

  const entry = payload.find((p) => p.dataKey === 'value');
  const point = entry?.payload as { name: string; displayValue: string } | undefined;

  if (!point) {
    return null;
  }

  return (
    <div style={GNOME_TOOLTIP_STYLE}>
      <div>{point.name}</div>
      <div style={GNOME_TOOLTIP_ITEM_STYLE}>{point.displayValue}</div>
    </div>
  );
};

export const WaterfallChart = ({
  data,
  height = 300,
  increaseColor = 'var(--gnome-green-4, #2ec27e)',
  decreaseColor = 'var(--gnome-red-3, #e01b24)',
  totalColor = 'var(--gnome-accent-color, #3584e4)',
  showGrid = true,
  showValues = false,
  valueFormatter,
  className,
  'aria-label': ariaLabel,
}: WaterfallChartProps) => {
  const formatNumber = useNumberFormatter().format;
  const format = valueFormatter ?? formatNumber;

  const chartData = buildChartData(data, format);
  const colorFor = (kind: Kind) =>
    kind === 'total' ? totalColor : kind === 'increase' ? increaseColor : decreaseColor;

  return (
    <div
      role="img"
      aria-label={
        ariaLabel ?? `Waterfall chart: ${data.map((d) => `${d.label} ${format(d.value)}`).join(', ')}`
      }
      className={[styles.container, className].filter(Boolean).join(' ')}
      style={{ height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          accessibilityLayer
          data={chartData}
          margin={{ top: showValues ? 20 : 8, right: 8, left: 0, bottom: 0 }}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--gnome-divider-color, rgba(0,0,0,0.07))"
              vertical={false}
            />
          )}
          <XAxis
            dataKey="name"
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
            content={<WaterfallTooltip />}
            cursor={{ fill: 'var(--gnome-card-shade-color, rgba(0,0,0,0.07))' }}
          />
          <Bar dataKey="base" stackId="waterfall" fill="transparent" isAnimationActive={false} />
          <Bar dataKey="value" stackId="waterfall" radius={[3, 3, 3, 3]} isAnimationActive={false}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={colorFor(entry.kind)} />
            ))}
            {showValues && (
              <LabelList dataKey="displayValue" position="top" style={LABEL_STYLE} />
            )}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};
