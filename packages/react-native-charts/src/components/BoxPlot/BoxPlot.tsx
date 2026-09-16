import { useGnomeTheme, useNumberFormatter } from '@gnome-ui/react-native';
import { StyleSheet, Text, View } from 'react-native';

import { getChartPalette } from '@/colors';
import { withAlpha } from '@/internal/colorAlpha';

export interface BoxPlotStats {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  outliers?: number[];
}

export type BoxPlotDataItem =
  | { label: string; color?: string; values: number[] }
  | ({ label: string; color?: string } & BoxPlotStats);

export interface BoxPlotProps {
  data: BoxPlotDataItem[];
  height?: number;
  /** Render individual points beyond the whiskers (values outside 1.5×IQR). Defaults to `true`. */
  showOutliers?: boolean;
  valueFormatter?: (value: number) => string;
  'aria-label'?: string;
}

const percentile = (sorted: number[], p: number): number => {
  const idx = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);

  if (lower === upper) {
    return sorted[lower]!;
  }

  const weight = idx - lower;

  return sorted[lower]! * (1 - weight) + sorted[upper]! * weight;
};

const computeStats = (values: number[]): BoxPlotStats => {
  const sorted = [...values].sort((a, b) => a - b);
  const q1 = percentile(sorted, 25);
  const median = percentile(sorted, 50);
  const q3 = percentile(sorted, 75);
  const iqr = q3 - q1;
  const lowerFence = q1 - 1.5 * iqr;
  const upperFence = q3 + 1.5 * iqr;
  const inRange = sorted.filter((v) => v >= lowerFence && v <= upperFence);
  const outliers = sorted.filter((v) => v < lowerFence || v > upperFence);

  return {
    min: inRange.length ? inRange[0]! : sorted[0]!,
    q1,
    median,
    q3,
    max: inRange.length ? inRange[inRange.length - 1]! : sorted[sorted.length - 1]!,
    outliers,
  };
};

const resolveStats = (item: BoxPlotDataItem): BoxPlotStats =>
  'values' in item
    ? computeStats(item.values)
    : {
        min: item.min,
        q1: item.q1,
        median: item.median,
        q3: item.q3,
        max: item.max,
        outliers: item.outliers,
      };

const TICK_FONT_SIZE = 11;
const TICK_LINE_HEIGHT = 14;
const LABEL_MARGIN_TOP = 8;
// Reserved height for each column's own label row below its track, and for a
// matching invisible spacer at the bottom of the axis column — see the note
// on `styles.axisSpacer` for why this (not a padding trick) is what actually
// keeps the tick labels aligned with the real track's max/min positions.
const LABEL_ROW_HEIGHT = LABEL_MARGIN_TOP + TICK_LINE_HEIGHT;
const AXIS_WIDTH = 44;

/**
 * No layout algorithm and no Victory Native/Skia primitive needed — same
 * situation `BulletChart`/`Heatmap` found: the web version is already just
 * absolutely-positioned percentage `<div>`s (here vertical instead of
 * horizontal), which RN's own `View` percentage `top`/`height` styles port
 * directly, the same technique `BulletTrack` already validated on-device for
 * `left`/`width`.
 */
export const BoxPlot = ({
  data,
  height = 320,
  showOutliers = true,
  valueFormatter,
  'aria-label': ariaLabel,
}: BoxPlotProps) => {
  const theme = useGnomeTheme();
  const palette = getChartPalette(theme);
  const formatNumber = useNumberFormatter().format;
  const format = valueFormatter ?? formatNumber;

  const resolved = data.map((item, i) => ({
    label: item.label,
    color: item.color ?? palette[i % palette.length]!,
    stats: resolveStats(item),
  }));

  const allValues = resolved.flatMap((r) => [
    r.stats.min,
    r.stats.max,
    ...(r.stats.outliers ?? []),
  ]);
  const rawMin = allValues.length ? Math.min(...allValues) : 0;
  const rawMax = allValues.length ? Math.max(...allValues) : 1;
  const padding = (rawMax - rawMin || 1) * 0.08;
  const domainMin = rawMin - padding;
  const domainMax = rawMax + padding;
  const domainRange = domainMax - domainMin || 1;

  const toY = (value: number) => 100 - ((value - domainMin) / domainRange) * 100;

  const ticks = [domainMax, (domainMax + domainMin) / 2, domainMin];

  const label =
    ariaLabel ??
    `Box plot: ${resolved.map((r) => `${r.label} median ${format(r.stats.median)}`).join(', ')}`;

  const dimLabelStyle = {
    fontSize: TICK_FONT_SIZE,
    color: theme.windowFgColor,
    // No RN theme token for the web's `--gnome-dim-label-color` — same gap
    // `GaugeChart`/`BulletChart` already documented — approximated with
    // reduced opacity instead of inventing a token for secondary text.
    opacity: 0.55,
    fontFamily: theme.fontFamily,
  } as const;

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={label}
      style={[styles.container, { height }]}
    >
      <View style={styles.axisColumn}>
        <View style={styles.axisTrack}>
          {ticks.map((t, i) => (
            <Text
              key={i}
              numberOfLines={1}
              style={[
                dimLabelStyle,
                styles.tickLabel,
                {
                  top: `${toY(t)}%`,
                  lineHeight: TICK_LINE_HEIGHT,
                  marginTop: -TICK_LINE_HEIGHT / 2,
                },
              ]}
            >
              {format(t)}
            </Text>
          ))}
        </View>
        <View style={styles.axisSpacer} />
      </View>
      <View style={styles.columns}>
        {resolved.map((r, i) => {
          const { stats, color } = r;
          const maxY = toY(stats.max);
          const minY = toY(stats.min);
          const q1Y = toY(stats.q1);
          const q3Y = toY(stats.q3);
          const medianY = toY(stats.median);

          return (
            <View key={i} style={styles.column}>
              <View style={styles.track}>
                <View
                  style={[
                    styles.whisker,
                    { top: `${maxY}%`, height: `${minY - maxY}%`, backgroundColor: color },
                  ]}
                />
                <View style={[styles.whiskerCap, { top: `${maxY}%`, backgroundColor: color }]} />
                <View style={[styles.whiskerCap, { top: `${minY}%`, backgroundColor: color }]} />
                <View
                  style={[
                    styles.box,
                    {
                      top: `${q3Y}%`,
                      height: `${q1Y - q3Y}%`,
                      borderColor: color,
                      borderRadius: theme.radiusSm,
                      backgroundColor: withAlpha(color, 0.2),
                    },
                  ]}
                />
                <View
                  style={[
                    styles.median,
                    { top: `${medianY}%`, backgroundColor: theme.windowFgColor },
                  ]}
                />
                {showOutliers &&
                  stats.outliers?.map((value, j) => (
                    <View
                      key={j}
                      style={[styles.outlier, { top: `${toY(value)}%`, backgroundColor: color }]}
                    />
                  ))}
              </View>
              <Text
                numberOfLines={1}
                style={[
                  dimLabelStyle,
                  styles.label,
                  { lineHeight: TICK_LINE_HEIGHT, marginTop: LABEL_MARGIN_TOP },
                ]}
              >
                {r.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
  axisColumn: {
    width: AXIS_WIDTH,
    flexDirection: 'column',
  },
  axisTrack: {
    flex: 1,
    position: 'relative',
  },
  // Reserves the exact same height as each column's own label row below it
  // (`LABEL_ROW_HEIGHT`, not the web's `padding-bottom: 24px` trick), so
  // `axisTrack`'s flex-computed height matches every column's `track` height
  // by construction — both are "shared row height minus one label row" —
  // rather than relying on how percentage `top` resolves against a padded
  // containing block, which doesn't actually shift the 0%/100% positions in
  // either CSS or RN's Yoga layout.
  axisSpacer: {
    height: LABEL_ROW_HEIGHT,
  },
  // A generous explicit `width` (well beyond the 44dp axis column) plus
  // `textAlign: 'right'`, rather than pinning `left: 0` (a fixed 36dp box —
  // truncated "334.56" to "334...." on-device) or leaving `left`/`width`
  // unset entirely (RN still clamped an unconstrained absolutely-positioned
  // `Text`'s measured width to its containing block's size in practice —
  // "331.2ms" still truncated to "331.2…" even with no `left` set, confirmed
  // on a second on-device pass). A wide box overflowing to the left of the
  // 44dp column is harmless — nothing else occupies that space — and
  // `textAlign: 'right'` keeps the digits anchored exactly on their tick
  // position regardless of how many characters `valueFormatter` produces.
  tickLabel: {
    position: 'absolute',
    right: 8,
    width: 120,
    textAlign: 'right',
  },
  columns: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  column: {
    flex: 1,
    flexDirection: 'column',
  },
  track: {
    flex: 1,
    position: 'relative',
  },
  whisker: {
    position: 'absolute',
    left: '50%',
    width: 2,
    marginLeft: -1,
  },
  whiskerCap: {
    position: 'absolute',
    left: '30%',
    width: '40%',
    height: 2,
    marginTop: -1,
  },
  box: {
    position: 'absolute',
    left: '15%',
    width: '70%',
    borderWidth: 1.5,
  },
  median: {
    position: 'absolute',
    left: '15%',
    width: '70%',
    height: 2,
    marginTop: -1,
  },
  outlier: {
    position: 'absolute',
    left: '50%',
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: -3,
    marginTop: -3,
  },
  label: {
    textAlign: 'center',
  },
});
