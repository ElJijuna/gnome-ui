import { useGnomeTheme } from '@gnome-ui/react-native';
import { LinearGradient } from '@shopify/react-native-skia';
import { View } from 'react-native';
import { Area, CartesianChart, Line } from 'victory-native';

import { getChartPalette } from '@/colors';
import { withAlpha } from '@/internal/colorAlpha';
import {
  normalizeSparkData,
  resolveSparkSeries,
  type SparkData,
  type SparkSeries,
  sparkAccessibilityProps,
} from '@/internal/sparkTypes';

export type { SparkSeries };

export interface SparkAreaChartProps {
  data: SparkData;
  /**
   * Data key to plot. Ignored when `series` is provided.
   * Required when `data` is an array of objects. Defaults to `"value"`.
   */
  dataKey?: string;
  /** Stroke and fill color. Ignored when `series` is provided. Defaults to the active accent color. */
  color?: string;
  /**
   * Multiple series to render on the same chart. When provided, `dataKey` and
   * `color` are ignored — `data` must be an array of objects containing all
   * series keys.
   */
  series?: SparkSeries[];
  /** Chart height in dp. Defaults to `40`. */
  height?: number;
  /** Stroke width. Defaults to `1.5`. */
  strokeWidth?: number;
  /** Render a gradient fill fading to transparent instead of a flat tint. Defaults to `true`. */
  gradient?: boolean;
  /** Fill opacity when `gradient` is `false`. Defaults to `0.2`. */
  fillOpacity?: number;
  'aria-label'?: string;
}

/**
 * Minimal inline chart — no axes, no grid, no legend, no tooltip. Same
 * `CartesianChart`-with-hidden-axes approach as `SparkLineChart`, plus an
 * `Area` fill underneath the `Line` stroke (matching `AreaChart`'s own
 * fill-then-stroke layering, since Victory Native's `Area` only fills).
 * The web version's hover-based `highlighted` intensify-on-hover mode is
 * dropped for the same reason `SparkLineChart` drops it: no touch-sized
 * affordance reads naturally on something embedded this small.
 */
export const SparkAreaChart = ({
  data,
  dataKey = 'value',
  color,
  series,
  height = 40,
  strokeWidth = 1.5,
  gradient = true,
  fillOpacity = 0.2,
  'aria-label': ariaLabel,
}: SparkAreaChartProps) => {
  const theme = useGnomeTheme();
  const palette = getChartPalette(theme);

  const activeSeries = resolveSparkSeries(series, dataKey, color, theme.accentColor, palette);

  const normalized =
    activeSeries.length === 1
      ? normalizeSparkData(data, activeSeries[0].key)
      : (data as Record<string, number>[]).map((d, i) => ({ ...d, __x: i }));

  return (
    <View {...sparkAccessibilityProps(ariaLabel)} style={{ height }}>
      <CartesianChart<Record<string, number>, '__x', string>
        data={normalized}
        xKey="__x"
        yKeys={activeSeries.map((s) => s.key)}
        domainPadding={{ left: 0, right: 0, top: 4, bottom: 4 }}
        axisOptions={{ lineColor: 'transparent' }}
      >
        {({ points, chartBounds }) => (
          <>
            {activeSeries.map((s) => (
              <Area
                key={s.key}
                points={points[s.key]}
                y0={chartBounds.bottom}
                curveType="natural"
                color={s.color}
                opacity={gradient ? 1 : fillOpacity}
              >
                {gradient && (
                  <LinearGradient
                    start={{ x: 0, y: chartBounds.top }}
                    end={{ x: 0, y: chartBounds.bottom }}
                    colors={[withAlpha(s.color, 0.4), withAlpha(s.color, 0)]}
                  />
                )}
              </Area>
            ))}
            {activeSeries.map((s) => (
              <Line
                key={`${s.key}-stroke`}
                points={points[s.key]}
                color={s.color}
                strokeWidth={strokeWidth}
                curveType="natural"
              />
            ))}
          </>
        )}
      </CartesianChart>
    </View>
  );
};
