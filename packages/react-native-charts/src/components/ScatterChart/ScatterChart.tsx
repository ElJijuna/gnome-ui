import { useGnomeTheme, useNumberFormatter } from '@gnome-ui/react-native';
import { CartesianChart, Scatter } from 'victory-native';

import { getChartPalette } from '@/colors';
import { ChartContainer } from '@/internal/ChartContainer';
import { ChartLegend } from '@/internal/ChartLegend';
import { useChartFont } from '@/internal/useChartFont';
import { type ChartLegendPosition } from '@/types/legend';

export interface ScatterChartSeries {
  data: Record<string, string | number>[];
  name?: string;
  color?: string;
  /** Key read from each point in `data` for the x position. Defaults to `"x"`. */
  xKey?: string;
  /** Key read from each point in `data` for the y position. Defaults to `"y"`. */
  yKey?: string;
  /** Key read from each point in `data` for bubble size. Omit for a fixed dot size. */
  zKey?: string;
}

export interface ScatterChartProps {
  series: ScatterChartSeries[];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  /** Position of the legend when `showLegend` is true. Defaults to `"bottom"`. */
  legendPosition?: ChartLegendPosition;
  /** Bubble area range in px², low to high, for series using `zKey`. Defaults to `[40, 400]`. */
  bubbleRange?: [number, number];
  'aria-label'?: string;
}

const yKeyFor = (i: number) => `__y_${i}`;
const zKeyFor = (i: number) => `__z_${i}`;

/**
 * Unlike every other chart in this package, each series here owns its own
 * independent point list (arbitrary `xKey`/`yKey`/`zKey` field names, not
 * rows shared across series) — `CartesianChart` needs one `xKey`/`yKeys` set
 * shared across a single `data` array, so every series' points are merged
 * into one combined row array first. Each merged row only populates its own
 * series' `__y_i` (and `__z_i`) field; Victory Native's `Scatter` itself
 * skips any point whose `y` isn't a number, so other series' rows naturally
 * render as gaps rather than needing to be filtered out.
 *
 * The web version's `xLabel`/`yLabel` props are dropped — they only ever fed
 * Recharts' tooltip `name` text, and this package has no interactive tooltip
 * yet (see the package README), so they'd have no visible effect here.
 */
export const ScatterChart = ({
  series,
  height = 300,
  showGrid = true,
  showLegend = false,
  legendPosition = 'bottom',
  bubbleRange = [40, 400],
  'aria-label': ariaLabel,
}: ScatterChartProps) => {
  const theme = useGnomeTheme();
  const formatNumber = useNumberFormatter().format;
  const palette = getChartPalette(theme);
  const font = useChartFont();

  const seriesColor = (s: ScatterChartSeries, i: number) => s.color ?? palette[i % palette.length];

  const combinedData: Record<string, number>[] = series.flatMap((s, i) => {
    const xKey = s.xKey ?? 'x';
    const yKey = s.yKey ?? 'y';
    return s.data.map((row) => {
      const merged: Record<string, number> = { __x: Number(row[xKey]) };
      merged[yKeyFor(i)] = Number(row[yKey]);
      if (s.zKey && row[s.zKey] !== undefined) {
        merged[zKeyFor(i)] = Number(row[s.zKey]);
      }
      return merged;
    });
  });

  const zValues = combinedData
    .flatMap((row) => series.map((_, i) => row[zKeyFor(i)]))
    .filter((v): v is number => typeof v === 'number');
  const zMin = zValues.length ? Math.min(...zValues) : 0;
  const zMax = zValues.length ? Math.max(...zValues) : 1;
  const zRange = zMax - zMin || 1;
  const radiusForArea = (area: number) => Math.sqrt(area / Math.PI);
  const minRadius = radiusForArea(bubbleRange[0]);
  const maxRadius = radiusForArea(bubbleRange[1]);

  const label = ariaLabel ?? 'Scatter chart';

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
              key: s.name ?? String(i),
              label: s.name ?? `Series ${i + 1}`,
              color: seriesColor(s, i),
            }))}
          />
        ) : null
      }
    >
      <CartesianChart<Record<string, number>, '__x', string>
        data={combinedData}
        xKey="__x"
        yKeys={series.map((_, i) => yKeyFor(i))}
        domainPadding={{ left: 12, right: 12, top: 12, bottom: 12 }}
        axisOptions={{
          font,
          labelColor: theme.windowFgColor,
          lineColor: {
            grid: showGrid ? theme.dividerColor : 'transparent',
            frame: theme.borderSubtle,
          },
          formatYLabel: (v) => formatNumber(Number(v)),
          formatXLabel: (v) => formatNumber(Number(v)),
        }}
      >
        {({ points }) => (
          <>
            {series.map((s, i) => {
              const seriesPoints = points[yKeyFor(i)];
              // `CartesianChart` sorts its `data` by `xKey` internally (confirmed
              // by reading `transformInputData`), so `points[key]`'s order does
              // NOT match `combinedData`'s original row order — index-based
              // lookups into `combinedData` would silently pull the wrong z value
              // for most points. Match by each point's own raw (pre-scale)
              // `xValue`/`yValue` instead, which survive the internal sort intact.
              const zByRawXY = new Map<string, number>();
              if (s.zKey) {
                for (const row of combinedData) {
                  const z = row[zKeyFor(i)];
                  if (typeof z === 'number') {
                    zByRawXY.set(`${row.__x}|${row[yKeyFor(i)]}`, z);
                  }
                }
              }

              return (
                <Scatter
                  key={s.name ?? i}
                  points={seriesPoints}
                  color={seriesColor(s, i)}
                  opacity={0.8}
                  radius={
                    s.zKey
                      ? (pt) => {
                          const z = zByRawXY.get(`${pt.xValue}|${pt.yValue}`);
                          return typeof z === 'number'
                            ? minRadius + ((z - zMin) / zRange) * (maxRadius - minRadius)
                            : minRadius;
                        }
                      : 6
                  }
                />
              );
            })}
          </>
        )}
      </CartesianChart>
    </ChartContainer>
  );
};
