import { useGnomeTheme, useNumberFormatter } from '@gnome-ui/react-native';
import { LinearGradient } from '@shopify/react-native-skia';
import { Area, CartesianChart, Line, StackedArea } from 'victory-native';

import { getChartPalette } from '@/colors';
import { ChartContainer } from '@/internal/ChartContainer';
import { ChartLegend } from '@/internal/ChartLegend';
import { type InputKeys, type NumericalKeys } from '@/internal/chartKeys';
import { withAlpha } from '@/internal/colorAlpha';
import { useChartFont } from '@/internal/useChartFont';
import { type ChartLegendPosition } from '@/types/legend';

export interface AreaChartSeries<YK extends string = string> {
  dataKey: YK;
  name?: string;
  color?: string;
}

export interface AreaChartProps<
  RawData extends Record<string, string | number>,
  YK extends keyof NumericalKeys<RawData> & string,
> {
  data: RawData[];
  series: AreaChartSeries<YK>[];
  xAxisKey?: keyof InputKeys<RawData> & string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  /** Position of the legend when `showLegend` is true. Defaults to `"bottom"`. */
  legendPosition?: ChartLegendPosition;
  /** Stack series on top of each other instead of overlapping. Defaults to `false`. */
  stacked?: boolean;
  /** Fade the fill from the series color to transparent instead of a flat tint. Defaults to `false`. */
  gradient?: boolean;
  'aria-label'?: string;
}

export const AreaChart = <
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
  stacked = false,
  gradient = false,
  'aria-label': ariaLabel,
}: AreaChartProps<RawData, YK>) => {
  const theme = useGnomeTheme();
  const formatNumber = useNumberFormatter().format;
  const palette = getChartPalette(theme);
  const font = useChartFont();

  const yKeys = series.map((s) => s.dataKey);
  const seriesColor = (s: AreaChartSeries<YK>, i: number) => s.color ?? palette[i % palette.length];

  const label = ariaLabel ?? `Area chart with ${series.map((s) => s.name ?? s.dataKey).join(', ')}`;

  // CartesianChart's auto y-domain is the extent of each yKey's own raw values —
  // it has no idea `stacked` sums them, so a stacked chart's y-axis (and the
  // topmost band's fill) silently clips at each series' own max instead of the
  // cumulative total. Confirmed on-device: without this, the top series' peak
  // renders flat, cut off at the un-stacked axis ceiling. Only override the
  // domain in stacked mode — the default per-series extent is exactly right
  // when series overlap instead of stacking.
  const stackedMax = stacked
    ? Math.max(...data.map((d) => series.reduce((sum, s) => sum + (Number(d[s.dataKey]) || 0), 0)))
    : undefined;

  return (
    <ChartContainer
      accessibilityLabel={label}
      legendPosition={legendPosition}
      height={height}
      legend={
        showLegend ? (
          <ChartLegend
            position={legendPosition}
            textColor={theme.windowFgColor}
            fontFamily={theme.fontFamily}
            entries={series.map((s, i) => ({
              key: s.dataKey,
              label: s.name ?? s.dataKey,
              color: seriesColor(s, i),
            }))}
          />
        ) : null
      }
    >
      <CartesianChart
        data={data}
        xKey={xAxisKey}
        yKeys={yKeys}
        domain={stackedMax !== undefined ? { y: [0, stackedMax] } : undefined}
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
        {({ points, chartBounds }) =>
          stacked ? (
            <StackedArea
              points={series.map((s) => points[s.dataKey])}
              y0={chartBounds.bottom}
              curveType="natural"
              colors={series.map((s, i) => seriesColor(s, i))}
              animate={{ type: 'timing', duration: 300 }}
              areaOptions={
                gradient
                  ? ({ rowIndex }) => {
                      const color = seriesColor(series[rowIndex] as AreaChartSeries<YK>, rowIndex);
                      return {
                        children: (
                          <LinearGradient
                            start={{ x: 0, y: chartBounds.top }}
                            end={{ x: 0, y: chartBounds.bottom }}
                            colors={[withAlpha(color, 0.5), withAlpha(color, 0)]}
                          />
                        ),
                      };
                    }
                  : undefined
              }
            />
          ) : (
            <>
              {series.map((s, i) => {
                const color = seriesColor(s, i);
                return (
                  <Area
                    key={s.dataKey}
                    points={points[s.dataKey]}
                    y0={chartBounds.bottom}
                    curveType="natural"
                    color={color}
                    opacity={gradient ? 1 : 0.15}
                    animate={{ type: 'timing', duration: 300 }}
                  >
                    {gradient && (
                      <LinearGradient
                        start={{ x: 0, y: chartBounds.top }}
                        end={{ x: 0, y: chartBounds.bottom }}
                        colors={[withAlpha(color, 0.5), withAlpha(color, 0)]}
                      />
                    )}
                  </Area>
                );
              })}
              {series.map((s, i) => (
                <Line
                  key={`${s.dataKey}-stroke`}
                  points={points[s.dataKey]}
                  color={seriesColor(s, i)}
                  strokeWidth={2}
                  curveType="natural"
                  animate={{ type: 'timing', duration: 300 }}
                />
              ))}
            </>
          )
        }
      </CartesianChart>
    </ChartContainer>
  );
};
