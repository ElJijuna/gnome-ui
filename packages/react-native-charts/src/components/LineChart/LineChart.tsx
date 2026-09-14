import { useGnomeTheme, useNumberFormatter } from '@gnome-ui/react-native';
import { Circle, matchFont } from '@shopify/react-native-skia';
import { StyleSheet, Text, View } from 'react-native';
import { CartesianChart, Line } from 'victory-native';

import { getChartPalette } from '@/colors';
import { type ChartLegendPosition, isVerticalLegendPosition } from '@/types/legend';

/**
 * Local structural replicas of victory-native's own (unexported) `InputFields`/
 * `NumericalFields` mapped types — required so `xAxisKey`/`series[].dataKey`'s
 * generics line up with what `CartesianChart` itself infers for `xKey`/`yKeys`,
 * since TS compares these mapped types structurally, not by import identity.
 */
type InputKeys<RawData> = {
  [K in keyof RawData as RawData[K] extends number | string ? K : never]: RawData[K];
};
type NumericalKeys<RawData> = {
  [K in keyof RawData as RawData[K] extends number | null | undefined ? K : never]: RawData[K];
};

export interface LineChartSeries<YK extends string = string> {
  dataKey: YK;
  name?: string;
  color?: string;
}

export interface LineChartProps<
  RawData extends Record<string, string | number>,
  YK extends keyof NumericalKeys<RawData> & string,
> {
  data: RawData[];
  series: LineChartSeries<YK>[];
  xAxisKey?: keyof InputKeys<RawData> & string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  /** Position of the legend when `showLegend` is true. Defaults to `"bottom"`. */
  legendPosition?: ChartLegendPosition;
  'aria-label'?: string;
}

export const LineChart = <
  RawData extends Record<string, string | number>,
  YK extends keyof NumericalKeys<RawData> & string,
>({
  data,
  series,
  xAxisKey = 'name' as keyof InputKeys<RawData> & string,
  height = 300,
  showGrid = true,
  showLegend = false,
  legendPosition = 'bottom',
  'aria-label': ariaLabel,
}: LineChartProps<RawData, YK>) => {
  const theme = useGnomeTheme();
  const formatNumber = useNumberFormatter().format;
  const palette = getChartPalette(theme);
  // Deliberately NOT `theme.fontFamily` ("Adwaita Sans") here: confirmed on-device
  // that Skia's `matchFont` silently renders no glyphs at all for an unregistered
  // family (unlike RN's own `<Text>`, which falls back to the OS default font for
  // an unknown `fontFamily` string — Skia's `FontMgr.matchFamilyStyle` has no such
  // substitution). Omitting `fontFamily` defaults to `"System"`, which is always
  // registered.
  const font = matchFont({ fontSize: 12 });

  const yKeys = series.map((s) => s.dataKey);
  const seriesColor = (s: LineChartSeries<YK>, i: number) => s.color ?? palette[i % palette.length];

  const label = ariaLabel ?? `Line chart with ${series.map((s) => s.name ?? s.dataKey).join(', ')}`;

  const isVertical = isVerticalLegendPosition(legendPosition);
  const legendFirst = legendPosition === 'top' || legendPosition === 'left';

  const legend = showLegend ? (
    <View
      style={[styles.legend, isVertical ? styles.legendVertical : styles.legendHorizontal]}
      importantForAccessibility="no-hide-descendants"
    >
      {series.map((s, i) => (
        <View key={s.dataKey} style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: seriesColor(s, i) }]} />
          <Text
            numberOfLines={1}
            style={[
              styles.legendLabel,
              { color: theme.windowFgColor, fontFamily: theme.fontFamily },
            ]}
          >
            {s.name ?? s.dataKey}
          </Text>
        </View>
      ))}
    </View>
  ) : null;

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={label}
      style={isVertical ? styles.rowContainer : styles.columnContainer}
    >
      {legendFirst && legend}
      <View style={[{ height }, isVertical && styles.flexFill]}>
        <CartesianChart
          data={data}
          xKey={xAxisKey}
          yKeys={yKeys}
          domainPadding={{ left: 12, right: 12, top: 12 }}
          axisOptions={{
            font,
            labelColor: theme.windowFgColor,
            lineColor: {
              grid: showGrid ? theme.dividerColor : 'transparent',
              frame: theme.borderSubtle,
            },
            formatYLabel: (v) => formatNumber(Number(v)),
          }}
        >
          {({ points }) => (
            <>
              {series.map((s, i) => (
                <Line
                  key={s.dataKey}
                  points={points[s.dataKey]}
                  color={seriesColor(s, i)}
                  strokeWidth={2}
                  curveType="natural"
                  animate={{ type: 'timing', duration: 300 }}
                />
              ))}
              {series.map((s, i) =>
                points[s.dataKey]
                  .filter((p) => p.y !== null)
                  .map((p, pointIndex) => (
                    <Circle
                      key={`${s.dataKey}-${pointIndex}`}
                      cx={p.x}
                      cy={p.y ?? 0}
                      r={3}
                      color={seriesColor(s, i)}
                    />
                  )),
              )}
            </>
          )}
        </CartesianChart>
      </View>
      {!legendFirst && legend}
    </View>
  );
};

const styles = StyleSheet.create({
  columnContainer: {
    flexDirection: 'column',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  flexFill: {
    flex: 1,
  },
  legend: {
    flexWrap: 'wrap',
    gap: 12,
  },
  legendHorizontal: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  legendVertical: {
    flexDirection: 'column',
    justifyContent: 'center',
    paddingHorizontal: 8,
    flexShrink: 1,
  },
  legendItem: {
    flexDirection: 'row',
    flexShrink: 1,
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
  },
  legendLabel: {
    fontSize: 12,
    flexShrink: 1,
  },
});
