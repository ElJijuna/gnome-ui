import { useGnomeTheme } from '@gnome-ui/react-native';
import { View } from 'react-native';
import { CartesianChart, Line } from 'victory-native';

import { getChartPalette } from '@/colors';

/** Configuration for a single series in a multi-series spark chart. */
export interface SparkSeries {
  /** Data key to read from each data object. */
  key: string;
  /** Override color for this series. Falls back to the GNOME chart palette by index when omitted. */
  color?: string;
}

type SparkData = number[] | Record<string, string | number>[];

export interface SparkLineChartProps {
  data: SparkData;
  /**
   * Data key to plot. Ignored when `series` is provided.
   * Required when `data` is an array of objects. Defaults to `"value"`.
   */
  dataKey?: string;
  /** Stroke color. Ignored when `series` is provided. Defaults to the active accent color. */
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
  'aria-label'?: string;
}

function normalize(data: SparkData, key: string): Record<string, number>[] {
  if (data.length === 0) {
    return [];
  }

  return typeof data[0] === 'number'
    ? (data as number[]).map((v, i) => ({ __x: i, [key]: v }))
    : (data as Record<string, number>[]).map((d, i) => ({ ...d, __x: i }));
}

/**
 * Minimal inline chart — no axes, no grid, no legend, no tooltip. Reuses
 * `CartesianChart` for its scaling math (the same primitive `LineChart`
 * composes) with the axis/grid/frame all made invisible, rather than the
 * hover-reveal `highlighted` mode the web version has: this package's touch
 * targets are typically much larger than a sparkline embedded in a table
 * cell, and there's no long-press-sized affordance that reads naturally on
 * something this small — dropped rather than faked.
 */
export const SparkLineChart = ({
  data,
  dataKey = 'value',
  color,
  series,
  height = 40,
  strokeWidth = 1.5,
  'aria-label': ariaLabel,
}: SparkLineChartProps) => {
  const theme = useGnomeTheme();
  const palette = getChartPalette(theme);

  const activeSeries = series
    ? series.map((s, i) => ({ key: s.key, color: s.color ?? palette[i % palette.length] }))
    : [{ key: dataKey, color: color ?? theme.accentColor }];

  const normalized =
    activeSeries.length === 1
      ? normalize(data, activeSeries[0].key)
      : (data as Record<string, number>[]).map((d, i) => ({ ...d, __x: i }));

  const accessibilityProps = ariaLabel
    ? { accessible: true, accessibilityRole: 'image' as const, accessibilityLabel: ariaLabel }
    : {
        accessibilityElementsHidden: true,
        importantForAccessibility: 'no-hide-descendants' as const,
      };

  return (
    <View {...accessibilityProps} style={{ height }}>
      <CartesianChart<Record<string, number>, '__x', string>
        data={normalized}
        xKey="__x"
        yKeys={activeSeries.map((s) => s.key)}
        domainPadding={{ left: 0, right: 0, top: 4, bottom: 4 }}
        axisOptions={{ lineColor: 'transparent' }}
      >
        {({ points }) => (
          <>
            {activeSeries.map((s) => (
              <Line
                key={s.key}
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
