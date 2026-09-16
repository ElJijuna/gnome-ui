import { useGnomeTheme, useNumberFormatter } from '@gnome-ui/react-native';
import { Text as SkiaText } from '@shopify/react-native-skia';
import { CartesianChart, StackedBar } from 'victory-native';

import { ChartContainer } from '@/internal/ChartContainer';
import { useChartFont } from '@/internal/useChartFont';

export interface WaterfallChartDataItem {
  label: string;
  value: number;
  /** Anchor this bar to zero (absolute value) instead of floating from the running total — for start/end/subtotal bars. */
  isTotal?: boolean;
}

export interface WaterfallChartProps {
  data: WaterfallChartDataItem[];
  height?: number;
  /** Color for positive (increase) bars. Defaults to the theme's green. */
  increaseColor?: string;
  /** Color for negative (decrease) bars. Defaults to the theme's red. */
  decreaseColor?: string;
  /** Color for `isTotal` bars. Defaults to the theme accent color. */
  totalColor?: string;
  showGrid?: boolean;
  /** Show the signed delta (or absolute value for totals) above each bar. */
  showValues?: boolean;
  valueFormatter?: (value: number) => string;
  'aria-label'?: string;
}

type Kind = 'increase' | 'decrease' | 'total';

interface BridgeRow {
  // Index signature so `CartesianChart`'s `RawData extends Record<string, unknown>`
  // constraint is satisfied structurally — same requirement `SparkLineChart` works
  // around with a plain `Record<string, number>` instead of a named interface.
  [key: string]: unknown;
  name: string;
  base: number;
  value: number;
  kind: Kind;
  displayValue: string;
}

// Same running-cumulative recipe as the web version: each non-total bar
// floats between the prior running total and the new one, `base` is the
// lower of the two so the bar's own height (`value`, always >= 0) reaches
// the higher one. `isTotal` bars reset the running total and anchor to zero.
const buildBridgeData = (
  data: WaterfallChartDataItem[],
  format: (value: number) => string,
): BridgeRow[] => {
  let cumulative = 0;

  return data.map((item) => {
    let base: number;
    let barValue: number;
    let kind: Kind;

    if (item.isTotal) {
      base = 0;
      barValue = item.value;
      kind = 'total';
      cumulative = item.value;
    } else {
      const start = cumulative;
      const end = cumulative + item.value;
      base = Math.min(start, end);
      barValue = Math.abs(item.value);
      kind = item.value >= 0 ? 'increase' : 'decrease';
      cumulative = end;
    }

    return {
      name: item.label,
      base,
      value: barValue,
      kind,
      displayValue:
        kind === 'total'
          ? format(item.value)
          : `${item.value >= 0 ? '+' : ''}${format(item.value)}`,
    };
  });
};

// Fully transparent, not the `"transparent"` CSS keyword — Skia's own color
// parser support for named CSS colors (as opposed to `#RRGGBB[AA]` hex) isn't
// guaranteed the way it is in a browser, so every hand-rolled Skia chart in
// this package that needs an invisible fill uses an explicit alpha channel.
const TRANSPARENT_COLOR = '#00000000';

const VALUE_FONT_SIZE = 11;
const VALUE_LABEL_GAP = 6;

export const WaterfallChart = ({
  data,
  height = 300,
  increaseColor,
  decreaseColor,
  totalColor,
  showGrid = true,
  showValues = false,
  valueFormatter,
  'aria-label': ariaLabel,
}: WaterfallChartProps) => {
  const theme = useGnomeTheme();
  const formatNumber = useNumberFormatter().format;
  const format = valueFormatter ?? formatNumber;
  const font = useChartFont();
  const valueFont = useChartFont(VALUE_FONT_SIZE);

  const resolvedIncreaseColor = increaseColor ?? theme.green4;
  const resolvedDecreaseColor = decreaseColor ?? theme.red3;
  const resolvedTotalColor = totalColor ?? theme.accentColor;

  const colorFor = (kind: Kind) =>
    kind === 'total'
      ? resolvedTotalColor
      : kind === 'increase'
        ? resolvedIncreaseColor
        : resolvedDecreaseColor;

  const chartData = buildBridgeData(data, format);

  // CartesianChart's auto y-domain is each yKey's own raw extent — `base` and
  // `value` are two independent series to it, unaware that the visible bar
  // top is actually their sum. Same category of fix as AreaChart's `stacked`
  // domain override: without this, a tall bar's top (or a dip below zero)
  // silently clips at whichever series' own max/min is smaller.
  const tops = chartData.map((d) => d.base + d.value);
  const yMax = Math.max(0, ...tops, ...chartData.map((d) => d.base));
  const yMin = Math.min(0, ...tops, ...chartData.map((d) => d.base));

  const label =
    ariaLabel ?? `Waterfall chart: ${data.map((d) => `${d.label} ${format(d.value)}`).join(', ')}`;

  return (
    <ChartContainer
      accessibilityLabel={label}
      legendPosition="bottom"
      legend={null}
      height={height}
    >
      <CartesianChart<BridgeRow, 'name', 'base' | 'value'>
        data={chartData}
        xKey="name"
        yKeys={['base', 'value']}
        domain={{ y: [yMin, yMax] }}
        domainPadding={{ left: 20, right: 20, top: showValues ? 24 : 12 }}
        axisOptions={{
          font,
          labelColor: theme.windowFgColor,
          lineColor: {
            grid: showGrid ? theme.dividerColor : 'transparent',
            frame: theme.borderSubtle,
          },
          formatYLabel: (v) => formatNumber(Number(v)),
          // Victory Native's own categorical-axis default (`tickCount: 5`)
          // downsamples x-axis ticks once there are more than 5 categories —
          // fine for a chart where dropping an occasional label is harmless,
          // but every step in a bridge is a named, meaningful data point
          // whose label loss reads as a real gap. Confirmed on-device: with
          // 6 bars, the default silently dropped the 3rd category's label
          // entirely (not just crowded it) rather than every bar's own name.
          tickCount: { x: chartData.length, y: 5 },
        }}
      >
        {({ points, chartBounds, yScale }) => (
          <>
            <StackedBar
              points={[points.base, points.value]}
              chartBounds={chartBounds}
              barOptions={({ seriesIndex, datumIndex }) =>
                seriesIndex === 0
                  ? { color: TRANSPARENT_COLOR }
                  : {
                      color: colorFor(chartData[datumIndex]!.kind),
                      roundedCorners: {
                        topLeft: 3,
                        topRight: 3,
                        bottomLeft: 3,
                        bottomRight: 3,
                      },
                    }
              }
            />
            {showValues &&
              valueFont &&
              chartData.map((row, i) => {
                const point = points.value[i];
                if (!point) {
                  return null;
                }

                const text = row.displayValue;
                const textWidth = valueFont.measureText(text).width;
                const topY = yScale(row.base + row.value);

                return (
                  <SkiaText
                    key={`${row.name}-${i}`}
                    x={point.x - textWidth / 2}
                    y={topY - VALUE_LABEL_GAP}
                    text={text}
                    font={valueFont}
                    color={theme.windowFgColor}
                  />
                );
              })}
          </>
        )}
      </CartesianChart>
    </ChartContainer>
  );
};
