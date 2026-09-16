import { useGnomeTheme } from '@gnome-ui/react-native';
import { View } from 'react-native';
import { Pie, PolarChart } from 'victory-native';

import { getChartPalette } from '@/colors';
import { sparkAccessibilityProps } from '@/internal/sparkTypes';

export interface SparkPieChartDataItem {
  value: number;
  color?: string;
}

export interface SparkPieChartProps {
  data: SparkPieChartDataItem[];
  /** Chart diameter in dp. Defaults to `40`. */
  size?: number;
  /** Render as a donut (hollow center) instead of a solid pie. Defaults to `false`. */
  donut?: boolean;
  /** Gap in degrees between adjacent slices. Ignored for single-item data. Defaults to `2`. */
  paddingAngle?: number;
  'aria-label'?: string;
}

// Fully transparent, not the `"transparent"` CSS keyword — same lesson
// `WaterfallChart` already documented: Skia's color parser can't be assumed
// to support named CSS colors the way a browser does.
const TRANSPARENT_COLOR = '#00000000';

interface PolarSlice {
  // Index signature so `PolarChart`'s `RawData extends Record<string, unknown>`
  // constraint is satisfied structurally — same requirement `WaterfallChart`'s
  // `BridgeRow` works around for `CartesianChart`.
  [key: string]: unknown;
  // `PolarChart`'s `labelKey` is a required prop even though this chart never
  // renders a `Pie.Label` — an unused-but-present field, the same role
  // `SparkLineChart`'s synthetic `__x` field plays for `CartesianChart`'s
  // required `xKey`.
  label: '';
  value: number;
  resolvedColor: string;
}

/**
 * `Pie.Chart` (the same `PolarChart`/`Pie.Chart` primitive `PieChart` uses)
 * has no built-in `paddingAngle` between slices at all — unlike `PieChart`,
 * this web component actually uses one. Rather than a background-color
 * stroke overlay (Victory Native's own `PieSliceAngularInset` trick, which
 * would only look right on a background matching whatever color it's given —
 * fragile for an inline chart meant to sit on cards/rows/arbitrary
 * surfaces), each gap is a real synthetic "spacer" slice interleaved between
 * the real ones with a transparent `resolvedColor` — a true empty gap, not a
 * background-dependent illusion. The spacer's own `value` is solved
 * algebraically so its rendered sweep comes out to exactly `paddingAngle`
 * degrees once mixed into the shared total `Pie.Chart` computes each slice's
 * angle from: `spacer / (total + gaps * spacer) * 360 = paddingAngle`, i.e.
 * `spacer = paddingAngle * total / (360 - gaps * paddingAngle)`.
 */
export const SparkPieChart = ({
  data,
  size = 40,
  donut = false,
  paddingAngle = 2,
  'aria-label': ariaLabel,
}: SparkPieChartProps) => {
  const theme = useGnomeTheme();
  const palette = getChartPalette(theme);

  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  const gapCount = Math.max(0, data.length - 1);
  const availableDegrees = Math.max(0, 360 - gapCount * paddingAngle);
  const spacerValue =
    gapCount > 0 && availableDegrees > 0 ? (paddingAngle * totalValue) / availableDegrees : 0;

  const chartData: PolarSlice[] = [];
  data.forEach((item, i) => {
    chartData.push({
      label: '',
      value: item.value,
      resolvedColor: item.color ?? palette[i % palette.length],
    });

    if (i < data.length - 1) {
      chartData.push({ label: '', value: spacerValue, resolvedColor: TRANSPARENT_COLOR });
    }
  });

  return (
    <View {...sparkAccessibilityProps(ariaLabel)} style={{ width: size, height: size }}>
      <PolarChart data={chartData} labelKey="label" valueKey="value" colorKey="resolvedColor">
        <Pie.Chart innerRadius={donut ? '55%' : 0} />
      </PolarChart>
    </View>
  );
};
