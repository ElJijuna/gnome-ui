import { useGnomeTheme, useNumberFormatter } from '@gnome-ui/react-native';
import { BarGroup, CartesianChart } from 'victory-native';

import { getChartPalette } from '@/colors';
import { ChartContainer } from '@/internal/ChartContainer';
import { ChartLegend } from '@/internal/ChartLegend';
import { type InputKeys, type NumericalKeys } from '@/internal/chartKeys';
import { useChartFont } from '@/internal/useChartFont';
import { type ChartLegendPosition } from '@/types/legend';

export interface BarChartSeries<YK extends string = string> {
  dataKey: YK;
  name?: string;
  color?: string;
}

export interface BarChartProps<
  RawData extends Record<string, string | number>,
  YK extends keyof NumericalKeys<RawData> & string,
> {
  data: RawData[];
  series: BarChartSeries<YK>[];
  xAxisKey?: keyof InputKeys<RawData> & string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  /** Position of the legend when `showLegend` is true. Defaults to `"bottom"`. */
  legendPosition?: ChartLegendPosition;
  'aria-label'?: string;
}

export const BarChart = <
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
}: BarChartProps<RawData, YK>) => {
  const theme = useGnomeTheme();
  const formatNumber = useNumberFormatter().format;
  const palette = getChartPalette(theme);
  const font = useChartFont();

  const yKeys = series.map((s) => s.dataKey);
  const seriesColor = (s: BarChartSeries<YK>, i: number) => s.color ?? palette[i % palette.length];

  const label = ariaLabel ?? `Bar chart with ${series.map((s) => s.name ?? s.dataKey).join(', ')}`;

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
          <BarGroup
            chartBounds={chartBounds}
            betweenGroupPadding={0.3}
            withinGroupPadding={0.15}
            roundedCorners={{ topLeft: 4, topRight: 4 }}
          >
            {series.map((s, i) => (
              <BarGroup.Bar
                key={s.dataKey}
                points={points[s.dataKey]}
                color={seriesColor(s, i)}
                animate={{ type: 'timing', duration: 300 }}
              />
            ))}
          </BarGroup>
        )}
      </CartesianChart>
    </ChartContainer>
  );
};
