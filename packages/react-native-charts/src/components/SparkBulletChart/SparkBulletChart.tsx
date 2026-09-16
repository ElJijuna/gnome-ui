import { View } from 'react-native';

import { BulletTrack, type BulletTrackRange } from '@/internal/BulletTrack';
import { sparkAccessibilityProps } from '@/internal/sparkTypes';

export type SparkBulletChartRange = BulletTrackRange;

export interface SparkBulletChartProps {
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
  ranges?: SparkBulletChartRange[];
  /** Performance bar color. Defaults to the theme accent color. */
  color?: string;
  /** Track height in dp. Defaults to `16`. */
  height?: number;
  'aria-label'?: string;
}

/**
 * The "spark" (compact, no label, no value text) member of the bullet-chart
 * family — same `src/internal/BulletTrack` (bands/bar/target tick) as
 * `BulletChart`, just without the label/value `Text`s around it, and the
 * conditional `sparkAccessibilityProps` every other spark chart uses instead
 * of an always-on `role="image"` label.
 */
export const SparkBulletChart = ({
  value,
  target,
  min = 0,
  max = 100,
  ranges,
  color,
  height = 16,
  'aria-label': ariaLabel,
}: SparkBulletChartProps) => {
  return (
    <View {...sparkAccessibilityProps(ariaLabel)}>
      <BulletTrack
        value={value}
        target={target}
        min={min}
        max={max}
        ranges={ranges}
        color={color}
        height={height}
        style={{ width: '100%' }}
      />
    </View>
  );
};
