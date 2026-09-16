import { useGnomeTheme } from '@gnome-ui/react-native';
import { Canvas, Circle, Path, Skia } from '@shopify/react-native-skia';
import { View } from 'react-native';

import { type ColorThreshold, resolveThresholdColor } from '@/internal/resolveThresholdColor';
import { sparkAccessibilityProps } from '@/internal/sparkTypes';

export type SparkGaugeChartThreshold = ColorThreshold;

export interface SparkGaugeChartProps {
  value: number;
  min?: number;
  max?: number;
  /** Defaults to the theme accent color. */
  color?: string;
  /** Ascending value/color bands (e.g. green/yellow/red status zones). Ignored when `color` is set. */
  thresholds?: SparkGaugeChartThreshold[];
  /** Ring diameter in dp. Defaults to `40`. */
  size?: number;
  /** Ring stroke width in dp. Defaults to `4`. */
  strokeWidth?: number;
  'aria-label'?: string;
}

// Same "0deg=east, positive sweep is visually clockwise in Skia's y-down
// space" convention `GaugeChart`/`RadialBarChart` already validated on-device
// — starting at 270deg (12 o'clock, since 0/90/180/270 map to 3/6/9/12
// o'clock under that convention) and sweeping clockwise reproduces the usual
// circular-progress-ring look, same direction the web version's
// `rotate(-90)` + `stroke-dashoffset` trick produces.
const START_ANGLE = 270;

/**
 * A full-circle progress ring, unlike `GaugeChart`'s half-circle gauge — this
 * is the "spark" (minimal, inline, no text) member of the gauge family, sized
 * as a small fixed square rather than filling a container, so — unlike
 * `GaugeChart` — it needs no `onLayout`/canvas-size state at all: `size`
 * fully determines both the `Canvas` and the arc geometry up front. Shares
 * `GaugeChart`'s threshold-color-resolution algorithm via
 * `resolveThresholdColor` (extracted here on this, its second consumer).
 */
export const SparkGaugeChart = ({
  value,
  min = 0,
  max = 100,
  color,
  thresholds,
  size = 40,
  strokeWidth = 4,
  'aria-label': ariaLabel,
}: SparkGaugeChartProps) => {
  const theme = useGnomeTheme();

  const clampedValue = Math.min(max, Math.max(min, value));
  const ratio = (clampedValue - min) / (max - min || 1);
  const radius = Math.max(0, (size - strokeWidth) / 2);
  const center = size / 2;
  const resolvedColor = resolveThresholdColor(value, color, thresholds, theme.accentColor);

  const oval = Skia.XYWHRect(center - radius, center - radius, radius * 2, radius * 2);
  const valuePath = Skia.PathBuilder.Make()
    .addArc(oval, START_ANGLE, 360 * ratio)
    .build();

  return (
    <View {...sparkAccessibilityProps(ariaLabel)} style={{ width: size, height: size }}>
      <Canvas style={{ width: size, height: size }}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          style="stroke"
          strokeWidth={strokeWidth}
          color={theme.light3}
        />
        <Path
          path={valuePath}
          style="stroke"
          strokeWidth={strokeWidth}
          strokeCap="round"
          color={resolvedColor}
        />
      </Canvas>
    </View>
  );
};
