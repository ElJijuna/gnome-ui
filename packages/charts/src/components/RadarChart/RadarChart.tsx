import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart as RechartsRadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import { GNOME_CHART_PALETTE } from '../../colors';
import { GNOME_TOOLTIP_ITEM_STYLE, GNOME_TOOLTIP_STYLE } from '../../tooltipStyle';
import { type ChartLegendPosition, getLegendProps } from '../../types/legend';

import styles from './RadarChart.module.css';

export interface RadarChartSeries {
  dataKey: string;
  name?: string;
  color?: string;
}

export interface RadarChartProps {
  data: Record<string, unknown>[];
  series: RadarChartSeries[];
  angleKey?: string;
  height?: number;
  filled?: boolean;
  showLegend?: boolean;
  /** Position of the legend when `showLegend` is true. Defaults to `"bottom"`. */
  legendPosition?: ChartLegendPosition;
  className?: string;
  'aria-label'?: string;
}

const AXIS_STYLE = {
  fontSize: 12,
  fill: 'var(--gnome-window-fg-color, rgba(0,0,0,0.8))',
  fontFamily: 'var(--gnome-font-family, system-ui)',
};

export const RadarChart = ({
  data,
  series,
  angleKey = 'name',
  height = 400,
  filled = false,
  showLegend = false,
  legendPosition = 'bottom',
  className,
  'aria-label': ariaLabel,
}: RadarChartProps) => {
  return (
    <div
      role="img"
      aria-label={
        ariaLabel ?? `Radar chart with ${series.map((s) => s.name ?? s.dataKey).join(', ')}`
      }
      className={[styles.container, className].filter(Boolean).join(' ')}
      style={{ height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart
          accessibilityLayer
          data={data}
          margin={{ top: 8, right: 24, left: 24, bottom: 8 }}
        >
          <PolarGrid stroke="var(--gnome-light-3, #deddda)" />
          <PolarAngleAxis dataKey={angleKey} tick={AXIS_STYLE} />
          <PolarRadiusAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={GNOME_TOOLTIP_STYLE} itemStyle={GNOME_TOOLTIP_ITEM_STYLE} />
          {showLegend && (
            <Legend
              {...getLegendProps(legendPosition)}
              wrapperStyle={{
                fontFamily: 'var(--gnome-font-family, system-ui)',
                fontSize: 12,
              }}
            />
          )}
          {series.map((s, i) => {
            const color = s.color ?? GNOME_CHART_PALETTE[i % GNOME_CHART_PALETTE.length];

            return (
              <Radar
                key={s.dataKey}
                dataKey={s.dataKey}
                name={s.name ?? s.dataKey}
                stroke={color}
                fill={color}
                fillOpacity={filled ? 0.35 : 0}
                dot={false}
              />
            );
          })}
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
};
