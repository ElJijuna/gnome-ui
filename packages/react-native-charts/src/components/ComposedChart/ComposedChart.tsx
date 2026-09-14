import { useGnomeTheme, useNumberFormatter } from '@gnome-ui/react-native';
import { Area, BarGroup, CartesianChart, Line } from 'victory-native';

import { getChartPalette } from '@/colors';
import { ChartContainer } from '@/internal/ChartContainer';
import { ChartLegend } from '@/internal/ChartLegend';
import { type InputKeys, type NumericalKeys } from '@/internal/chartKeys';
import { useChartFont } from '@/internal/useChartFont';
import { type ChartLegendPosition } from '@/types/legend';

export interface ComposedChartSeries<YK extends string = string> {
  dataKey: YK;
  type: 'bar' | 'line' | 'area';
  name?: string;
  color?: string;
}

export interface ComposedChartProps<
  RawData extends Record<string, string | number>,
  YK extends keyof NumericalKeys<RawData> & string,
> {
  data: RawData[];
  series: ComposedChartSeries<YK>[];
  xAxisKey?: keyof InputKeys<RawData> & string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  /** Position of the legend when `showLegend` is true. Defaults to `"bottom"`. */
  legendPosition?: ChartLegendPosition;
  'aria-label'?: string;
}

/**
 * Bar-type series are rendered first (as a single `BarGroup` cluster), then
 * area-type, then line-type, regardless of each series' own position in the
 * `series` array — `BarGroup` needs every bar it draws as a direct child to
 * compute per-bar width/offset, so bar series can't be interleaved with other
 * chart types the way Recharts' `ComposedChart` interleaves its own children.
 * This still matches the conventional composed-chart look (bars as the base
 * value, line/area as an overlaid trend on top).
 */
export const ComposedChart = <
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
}: ComposedChartProps<RawData, YK>) => {
  const theme = useGnomeTheme();
  const formatNumber = useNumberFormatter().format;
  const palette = getChartPalette(theme);
  const font = useChartFont();

  const yKeys = series.map((s) => s.dataKey);
  const colorByKey = new Map<YK, string>(
    series.map((s, i) => [s.dataKey, s.color ?? palette[i % palette.length]]),
  );
  const seriesColor = (s: ComposedChartSeries<YK>) => colorByKey.get(s.dataKey) as string;

  const barSeries = series.filter((s) => s.type === 'bar');
  const areaSeries = series.filter((s) => s.type === 'area');
  const lineSeries = series.filter((s) => s.type === 'line');

  const label =
    ariaLabel ?? `Composed chart with ${series.map((s) => s.name ?? s.dataKey).join(', ')}`;

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
            entries={series.map((s) => ({
              key: s.dataKey,
              label: s.name ?? s.dataKey,
              color: seriesColor(s),
            }))}
          />
        ) : null
      }
    >
      <CartesianChart
        data={data}
        xKey={xAxisKey}
        yKeys={yKeys}
        domainPadding={{ left: 20, right: 20, top: 12 }}
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
        {({ points, chartBounds }) => (
          <>
            {barSeries.length > 0 && (
              <BarGroup
                chartBounds={chartBounds}
                betweenGroupPadding={0.3}
                withinGroupPadding={0.15}
                roundedCorners={{ topLeft: 4, topRight: 4 }}
              >
                {barSeries.map((s) => (
                  <BarGroup.Bar
                    key={s.dataKey}
                    points={points[s.dataKey]}
                    color={seriesColor(s)}
                    animate={{ type: 'timing', duration: 300 }}
                  />
                ))}
              </BarGroup>
            )}
            {areaSeries.map((s) => {
              const color = seriesColor(s);
              return (
                <Area
                  key={s.dataKey}
                  points={points[s.dataKey]}
                  y0={chartBounds.bottom}
                  curveType="natural"
                  color={color}
                  opacity={0.15}
                  animate={{ type: 'timing', duration: 300 }}
                />
              );
            })}
            {areaSeries.map((s) => (
              <Line
                key={`${s.dataKey}-stroke`}
                points={points[s.dataKey]}
                color={seriesColor(s)}
                strokeWidth={2}
                curveType="natural"
                animate={{ type: 'timing', duration: 300 }}
              />
            ))}
            {lineSeries.map((s) => (
              <Line
                key={s.dataKey}
                points={points[s.dataKey]}
                color={seriesColor(s)}
                strokeWidth={2}
                curveType="natural"
                animate={{ type: 'timing', duration: 300 }}
              />
            ))}
          </>
        )}
      </CartesianChart>
    </ChartContainer>
  );
};
