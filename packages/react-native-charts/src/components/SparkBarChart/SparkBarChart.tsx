import { useGnomeTheme } from '@gnome-ui/react-native';
import { View } from 'react-native';
import { Bar, CartesianChart } from 'victory-native';

import { normalizeSparkData, type SparkData, sparkAccessibilityProps } from '@/internal/sparkTypes';

export interface SparkBarChartProps {
  data: SparkData;
  /** Required when `data` is an array of objects. Defaults to `"value"`. */
  dataKey?: string;
  /** Defaults to the active accent color. */
  color?: string;
  /** Chart height in dp. Defaults to `40`. */
  height?: number;
  /** Bar width in dp. Auto-sized to fit when omitted. */
  barSize?: number;
  /** Fill opacity. Defaults to `0.85`. */
  fillOpacity?: number;
  'aria-label'?: string;
}

/**
 * Minimal inline chart — no axes, no grid, no legend, no tooltip. Unlike
 * `SparkLineChart`/`SparkAreaChart`, the web version has no multi-`series`
 * mode for bars at all, so this one doesn't either. Uses Victory Native's
 * standalone `Bar` (not `BarGroup`/`BarGroup.Bar`, which `BarChart` needs
 * for grouping multiple series side by side) since there's only ever one
 * series here. The web version's hover-based `highlighted` mode is dropped,
 * same reasoning as the other spark charts.
 */
export const SparkBarChart = ({
  data,
  dataKey = 'value',
  color,
  height = 40,
  barSize,
  fillOpacity = 0.85,
  'aria-label': ariaLabel,
}: SparkBarChartProps) => {
  const theme = useGnomeTheme();
  const resolvedColor = color ?? theme.accentColor;
  const normalized = normalizeSparkData(data, dataKey);

  return (
    <View {...sparkAccessibilityProps(ariaLabel)} style={{ height }}>
      <CartesianChart<Record<string, number>, '__x', string>
        data={normalized}
        xKey="__x"
        yKeys={[dataKey]}
        domainPadding={{ left: 8, right: 8, top: 4, bottom: 0 }}
        axisOptions={{ lineColor: 'transparent' }}
      >
        {({ points, chartBounds }) => (
          <Bar
            points={points[dataKey]}
            chartBounds={chartBounds}
            color={resolvedColor}
            opacity={fillOpacity}
            roundedCorners={{ topLeft: 2, topRight: 2 }}
            barWidth={barSize}
          />
        )}
      </CartesianChart>
    </View>
  );
};
