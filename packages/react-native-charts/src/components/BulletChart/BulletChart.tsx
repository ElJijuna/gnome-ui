import { useGnomeTheme, useNumberFormatter } from '@gnome-ui/react-native';
import { StyleSheet, Text, View } from 'react-native';

import { BulletTrack, type BulletTrackRange } from '@/internal/BulletTrack';

export type BulletChartRange = BulletTrackRange;

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

/**
 * No layout algorithm and no Victory Native/Skia primitive needed — same
 * situation `CloudChart` found: the web version is just absolutely-positioned
 * percentage-width `<div>`s inside a flex row, which RN's own `View`
 * percentage `left`/`width`/`top`/`bottom` styles port directly. No `Canvas`.
 * The track itself (bands/bar/target tick) lives in `src/internal/BulletTrack`,
 * shared with `SparkBulletChart`.
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
      <BulletTrack
        value={value}
        target={target}
        min={min}
        max={max}
        ranges={ranges}
        color={color}
        height={height}
        style={styles.track}
      />
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
