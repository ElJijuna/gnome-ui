import { useNumberFormatter } from '@gnome-ui/react';
import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart as RechartsRadialBarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import { GNOME_TOOLTIP_ITEM_STYLE, GNOME_TOOLTIP_STYLE } from '../../tooltipStyle';

import styles from './GaugeChart.module.css';

export interface GaugeChartThreshold {
  value: number;
  color: string;
}

export interface GaugeChartProps {
  value: number;
  min?: number;
  max?: number;
  height?: number;
  /** Explicit arc color, overrides `thresholds`. Defaults to `var(--gnome-accent-color)`. */
  color?: string;
  /** Ascending value/color bands (e.g. green/yellow/red status zones). Ignored when `color` is set. */
  thresholds?: GaugeChartThreshold[];
  showValue?: boolean;
  valueFormatter?: (value: number) => string;
  /** Caption rendered under the value. */
  label?: string;
  className?: string;
  'aria-label'?: string;
}

const resolveColor = (
  value: number,
  color: string | undefined,
  thresholds: GaugeChartThreshold[] | undefined,
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

export const GaugeChart = ({
  value,
  min = 0,
  max = 100,
  height = 220,
  color,
  thresholds,
  showValue = true,
  valueFormatter,
  label,
  className,
  'aria-label': ariaLabel,
}: GaugeChartProps) => {
  const formatNumber = useNumberFormatter().format;
  const format = valueFormatter ?? formatNumber;

  const clampedValue = Math.min(max, Math.max(min, value));
  const arcColor = resolveColor(value, color, thresholds);
  const chartData = [{ name: label ?? 'value', value: clampedValue, fill: arcColor }];

  return (
    <div
      role="img"
      aria-label={ariaLabel ?? `Gauge: ${label ? `${label} ` : ''}${format(value)}`}
      className={[styles.container, className].filter(Boolean).join(' ')}
      style={{ height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadialBarChart
          accessibilityLayer
          data={chartData}
          startAngle={180}
          endAngle={0}
          cx="50%"
          cy="85%"
          innerRadius="70%"
          outerRadius="100%"
          barSize={20}
        >
          <PolarAngleAxis type="number" domain={[min, max]} angleAxisId={0} tick={false} />
          <RadialBar
            dataKey="value"
            background={{ fill: 'var(--gnome-light-3, #deddda)' }}
            cornerRadius="50%"
          />
          <Tooltip
            contentStyle={GNOME_TOOLTIP_STYLE}
            itemStyle={GNOME_TOOLTIP_ITEM_STYLE}
            formatter={(v: number) => [format(v), label ?? 'Value']}
          />
        </RechartsRadialBarChart>
      </ResponsiveContainer>
      {showValue && (
        <div className={styles.valueLabel}>
          <span className={styles.value}>{format(value)}</span>
          {label && <span className={styles.caption}>{label}</span>}
        </div>
      )}
    </div>
  );
};
