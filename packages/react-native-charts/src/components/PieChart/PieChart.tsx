import { useGnomeTheme, useNumberFormatter } from '@gnome-ui/react-native';
import { Pie, PolarChart } from 'victory-native';

import { getChartPalette } from '@/colors';
import { ChartContainer } from '@/internal/ChartContainer';
import { ChartLegend } from '@/internal/ChartLegend';
import { useChartFont } from '@/internal/useChartFont';
import { type ChartLegendPosition } from '@/types/legend';

export interface PieChartDataItem {
  label: string;
  value: number;
  color?: string;
}

export interface PieChartProps {
  data: PieChartDataItem[];
  height?: number;
  /** Hollow center, mirroring a donut chart. Defaults to `false`. */
  donut?: boolean;
  /** Draw each slice's label inside it. Slices under 4% of the total are skipped to avoid clutter. Defaults to `false`. */
  showLabels?: boolean;
  showLegend?: boolean;
  /** Position of the legend when `showLegend` is true. Defaults to `"bottom"`. */
  legendPosition?: ChartLegendPosition;
  'aria-label'?: string;
}

/** Slices under this share of the total skip their label — matches the web version's clutter guard. */
const MIN_LABEL_SHARE = 0.04;

export const PieChart = ({
  data,
  height = 300,
  donut = false,
  showLabels = false,
  showLegend = false,
  legendPosition = 'bottom',
  'aria-label': ariaLabel,
}: PieChartProps) => {
  const theme = useGnomeTheme();
  const formatNumber = useNumberFormatter().format;
  const palette = getChartPalette(theme);
  const font = useChartFont(11);

  const chartData = data.map((item, i) => ({
    ...item,
    resolvedColor: item.color ?? palette[i % palette.length],
  }));

  const label =
    ariaLabel ?? `Pie chart: ${data.map((d) => `${d.label} ${formatNumber(d.value)}`).join(', ')}`;

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
            entries={chartData.map((d, i) => ({
              key: `${d.label}-${i}`,
              label: d.label,
              color: d.resolvedColor,
            }))}
          />
        ) : null
      }
    >
      <PolarChart data={chartData} labelKey="label" valueKey="value" colorKey="resolvedColor">
        <Pie.Chart innerRadius={donut ? '45%' : 0}>
          {({ slice }) => (
            <Pie.Slice>
              {showLabels && slice.sweepAngle / 360 >= MIN_LABEL_SHARE && (
                <Pie.Label font={font} color={theme.windowFgColor} radiusOffset={0.7} />
              )}
            </Pie.Slice>
          )}
        </Pie.Chart>
      </PolarChart>
    </ChartContainer>
  );
};
