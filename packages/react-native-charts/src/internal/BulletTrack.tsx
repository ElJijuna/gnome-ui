import { useGnomeTheme } from '@gnome-ui/react-native';
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';

export interface BulletTrackRange {
  /** Upper bound of this qualitative band. */
  value: number;
  color?: string;
}

export interface BulletTrackProps {
  /** Performance measure — the current value. */
  value: number;
  /** Comparative measure — rendered as a perpendicular tick. */
  target?: number;
  min: number;
  max: number;
  /**
   * Ascending upper bounds for qualitative bands (e.g. poor/satisfactory/good).
   * Defaults to a neutral grayscale ramp when colors are omitted.
   */
  ranges?: BulletTrackRange[];
  /** Performance bar color. Defaults to the theme accent color. */
  color?: string;
  height: number;
  /** Sizing (`flex: 1` alongside a label, `width: '100%'` alone) — deliberately left to the caller rather than assumed here. */
  style?: StyleProp<ViewStyle>;
}

interface Band {
  start: number;
  end: number;
  color: string;
}

/**
 * The bands/bar/target-tick track shared by `BulletChart` and
 * `SparkBulletChart` (its second real consumer, extracted here on the same
 * "second occurrence" call as this package's other `src/internal/` helpers)
 * — no layout algorithm and no Victory Native/Skia primitive needed, since
 * the web version is already just absolutely-positioned percentage-width
 * `<div>`s, which RN's own `View` percentage `left`/`width`/`top`/`bottom`
 * styles port directly.
 */
export const BulletTrack = ({
  value,
  target,
  min,
  max,
  ranges,
  color,
  height,
  style,
}: BulletTrackProps) => {
  const theme = useGnomeTheme();
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

  return (
    <View style={[styles.track, { height, borderRadius: theme.radiusSm }, style]}>
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
  );
};

const styles = StyleSheet.create({
  track: {
    position: 'relative',
    overflow: 'hidden',
  },
});
