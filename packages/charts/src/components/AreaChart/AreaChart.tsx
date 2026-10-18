import { useNumberFormatter } from '@gnome-ui/react';
import { useMemo, useState } from 'react';
import {
  Area,
  CartesianGrid,
  Legend,
  AreaChart as RechartsAreaChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { GNOME_CHART_PALETTE } from '@/colors';
import { GNOME_TOOLTIP_ITEM_STYLE, GNOME_TOOLTIP_STYLE } from '@/tooltipStyle';
import { type ChartLegendPosition, getLegendProps } from '@/types/legend';

import styles from './AreaChart.module.css';

export interface AreaChartSeries {
  dataKey: string;
  name?: string;
  color?: string;
}

export interface AreaChartPointClickEvent {
  /** The data entry for the clicked day/point */
  data: Record<string, unknown>;
  /** The index of the data entry in the dataset */
  index: number;
  /** The value on the X-axis for this point (e.g. the date) */
  label?: string;
  /** The raw active payload per series from Recharts */
  payload?: unknown;
}

export interface AreaChartProps {
  data: Record<string, unknown>[];
  series: AreaChartSeries[];
  xAxisKey?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  /** Position of the legend when `showLegend` is true. Defaults to `"bottom"`. */
  legendPosition?: ChartLegendPosition;
  stacked?: boolean;
  gradient?: boolean;
  className?: string;
  'aria-label'?: string;
  /**
   * Value on the x-axis (or index) of the selected point/day.
   * Can be controlled externally.
   */
  selectedPoint?: string | number | null;
  /**
   * Callback fired when a point/day in the series is selected/clicked.
   * Emits the selected point's data and information.
   */
  onPointClick?: (event: AreaChartPointClickEvent) => void;
  /**
   * Alias for `onPointClick`.
   */
  onSelect?: (event: AreaChartPointClickEvent) => void;
  /**
   * Whether to display a vertical reference line at the selected point.
   * Defaults to `true`.
   */
  showSelectionLine?: boolean;
}

const AXIS_STYLE = {
  fontSize: 12,
  fill: 'var(--gnome-window-fg-color, rgba(0,0,0,0.8))',
  fontFamily: 'var(--gnome-font-family, system-ui)',
};

export const AreaChart = ({
  data,
  series,
  xAxisKey = 'name',
  height = 300,
  showGrid = true,
  showLegend = false,
  legendPosition = 'bottom',
  stacked = false,
  gradient = false,
  className,
  'aria-label': ariaLabel,
  selectedPoint,
  onPointClick,
  onSelect,
  showSelectionLine = true,
}: AreaChartProps) => {
  const [internalSelected, setInternalSelected] = useState<string | number | null>(null);
  const activeSelected = selectedPoint !== undefined ? selectedPoint : internalSelected;
  const isInteractive = Boolean(onPointClick || onSelect);

  const formatNumber = useNumberFormatter().format;

  const seriesWithColors = series.map((s, i) => ({
    ...s,
    resolvedColor: s.color ?? GNOME_CHART_PALETTE[i % GNOME_CHART_PALETTE.length],
  }));

  const selectedX = useMemo(() => {
    if (activeSelected === null || activeSelected === undefined) {
      return null;
    }
    if (typeof activeSelected === 'number') {
      const item = data[activeSelected];
      return (item?.[xAxisKey] as string | number | undefined) ?? activeSelected;
    }
    return activeSelected;
  }, [activeSelected, data, xAxisKey]);

  const handleClick = (nextState: unknown) => {
    if (!nextState || typeof nextState !== 'object') {
      return;
    }
    const state = nextState as {
      activeTooltipIndex?: number;
      activeIndex?: number;
      activeLabel?: string | number;
      activePayload?: Array<{ payload?: Record<string, unknown> }>;
    };

    const index = state.activeTooltipIndex ?? state.activeIndex;
    if (index === undefined || index === null || index < 0) {
      return;
    }

    const item = data[index] ?? state.activePayload?.[0]?.payload;
    if (!item) {
      return;
    }

    const label =
      state.activeLabel !== undefined
        ? String(state.activeLabel)
        : (item[xAxisKey] as string | undefined);

    const eventPayload: AreaChartPointClickEvent = {
      data: item,
      index,
      label: label !== undefined ? String(label) : undefined,
      payload: state.activePayload,
    };

    if (selectedPoint === undefined) {
      setInternalSelected(
        item[xAxisKey] !== undefined ? (item[xAxisKey] as string | number) : index,
      );
    }

    onPointClick?.(eventPayload);
    onSelect?.(eventPayload);
  };

  return (
    <div
      role="img"
      aria-label={
        ariaLabel ?? `Area chart with ${series.map((s) => s.name ?? s.dataKey).join(', ')}`
      }
      className={[styles.container, isInteractive && styles.selectable, className]
        .filter(Boolean)
        .join(' ')}
      style={{ height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart
          accessibilityLayer
          data={data}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          onClick={handleClick}
        >
          {gradient && (
            <defs>
              {seriesWithColors.map((s) => (
                <linearGradient
                  key={s.dataKey}
                  id={`grad-${s.dataKey}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" style={{ stopColor: s.resolvedColor, stopOpacity: 0.4 }} />
                  <stop offset="95%" style={{ stopColor: s.resolvedColor, stopOpacity: 0 }} />
                </linearGradient>
              ))}
            </defs>
          )}
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
          {showSelectionLine && selectedX !== null && selectedX !== undefined && (
            <ReferenceLine
              x={selectedX}
              stroke="var(--gnome-accent-bg, #3584e4)"
              strokeWidth={2}
              strokeDasharray="3 3"
            />
          )}
          {seriesWithColors.map((s) => (
            <Area
              key={s.dataKey}
              type="monotone"
              dataKey={s.dataKey}
              name={s.name ?? s.dataKey}
              stroke={s.resolvedColor}
              fill={gradient ? `url(#grad-${s.dataKey})` : s.resolvedColor}
              fillOpacity={gradient ? 1 : 0.15}
              strokeWidth={2}
              stackId={stacked ? 'stack' : undefined}
              activeDot={isInteractive ? { r: 5, strokeWidth: 2 } : true}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
};
