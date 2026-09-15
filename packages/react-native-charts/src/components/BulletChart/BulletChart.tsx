import { useGnomeTheme, useNumberFormatter } from '@gnome-ui/react-native';
import { StyleSheet, Text, View } from 'react-native';

export interface BulletChartRange {
  /** Upper bound of this qualitative band. */
  value: number;
  color?: string;
}

export interface BulletChartProps {
  /** Performance measure — the current value. */
  value: number;
  /** Comparative measure — rendered as a perpendicular tick. */
  target?: number;
  min?: number;
  max?: number;
  /**
   * Ascending upper bounds for qualitative bands (e.g. poor/satisfactory/good).
   * Defaults to a neutral grayscale ramp when colors are omitted.
   */
  ranges?: BulletChartRange[];
  /** Performance bar color. Defaults to the theme accent color. */
  color?: string;
  /** Track height in dp. Defaults to 32. */
  height?: number;
  /** Caption rendered to the left of the track. */
  label?: string;
  showValue?: boolean;
  valueFormatter?: (value: number) => string;
  'aria-label'?: string;
}

interface Band {
  start: number;
  end: number;
  color: string;
}

/**
 * No layout algorithm and no Victory Native/Skia primitive needed — same
 * situation `CloudChart` found: the web version is just absolutely-positioned
 * percentage-width `<div>`s inside a flex row, which RN's own `View`
 * percentage `left`/`width`/`top`/`bottom` styles port directly. No `Canvas`.
 */
export const BulletChart = ({
  value,
  target,
  min = 0,
  max = 100,
  ranges,
  color,
  height = 32,
  label,
  showValue = true,
  valueFormatter,
  'aria-label': ariaLabel,
}: BulletChartProps) => {
  const theme = useGnomeTheme();
  const formatNumber = useNumberFormatter().format;
  const format = valueFormatter ?? formatNumber;
  const barColor = color ?? theme.accentColor;
  const defaultRangeColors = [theme.light2, theme.light3, theme.light4];

  const domain = max - min || 1;
  const toPercent = (v: number): `${number}%` =>
    `${(Math.min(max, Math.max(min, v)) - min) * (100 / domain)}%`;

  const bands: Band[] = ranges?.length
    ? [...ranges]
        .sort((a, b) => a.value - b.value)
        .map((range, i, sorted) => ({
          start: i === 0 ? min : sorted[i - 1].value,
          end: range.value,
          color: range.color ?? defaultRangeColors[i % defaultRangeColors.length],
        }))
    : [{ start: min, end: max, color: defaultRangeColors[1] }];

  const chartLabel =
    ariaLabel ??
    `Bullet chart: ${label ? `${label} ` : ''}${format(value)}${
      target !== undefined ? ` (target ${format(target)})` : ''
    }`;

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={chartLabel}
      style={styles.container}
    >
      {label && (
        <Text
          numberOfLines={1}
          style={[styles.label, { color: theme.windowFgColor, fontFamily: theme.fontFamily }]}
        >
          {label}
        </Text>
      )}
      <View style={[styles.track, { height, borderRadius: theme.radiusSm }]}>
        {bands.map((band, i) => (
          <View
            key={`band-${i}`}
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: toPercent(band.start),
              width: `${(Math.min(max, band.end) - Math.max(min, band.start)) * (100 / domain)}%`,
              backgroundColor: band.color,
            }}
          />
        ))}
        <View
          key="bar"
          style={{
            position: 'absolute',
            top: '30%',
            bottom: '30%',
            left: 0,
            width: toPercent(value),
            borderRadius: theme.radiusSm,
            backgroundColor: barColor,
          }}
        />
        {target !== undefined && (
          <View
            key="target"
            style={{
              position: 'absolute',
              top: '12%',
              bottom: '12%',
              left: toPercent(target),
              width: 2,
              marginLeft: -1,
              backgroundColor: theme.windowFgColor,
            }}
          />
        )}
      </View>
      {showValue && (
        <Text style={[styles.value, { color: theme.windowFgColor, fontFamily: theme.fontFamily }]}>
          {format(value)}
          {target !== undefined && (
            <Text style={[styles.targetValue, { color: theme.windowFgColor }]}>
              {' '}
              / {format(target)}
            </Text>
          )}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  label: {
    minWidth: 80,
    fontSize: 13,
  },
  track: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  value: {
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  // No RN theme token for the web's `--gnome-dim-label-color` — same gap
  // `GaugeChart` already documented — approximated with reduced opacity
  // instead of inventing a token for one component's secondary text.
  targetValue: {
    fontWeight: '400',
    opacity: 0.55,
  },
});
