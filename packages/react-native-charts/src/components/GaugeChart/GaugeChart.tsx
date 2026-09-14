import { useGnomeTheme, useNumberFormatter } from '@gnome-ui/react-native';
import { Canvas, Path, Skia, Text } from '@shopify/react-native-skia';
import { useCallback, useMemo, useState } from 'react';
import { type LayoutChangeEvent, View } from 'react-native';

import { ChartContainer } from '@/internal/ChartContainer';
import { useChartFont } from '@/internal/useChartFont';

export interface GaugeChartThreshold {
  value: number;
  color: string;
}

export interface GaugeChartProps {
  value: number;
  min?: number;
  max?: number;
  height?: number;
  /** Explicit arc color, overrides `thresholds`. Defaults to the theme accent color. */
  color?: string;
  /** Ascending value/color bands (e.g. green/yellow/red status zones). Ignored when `color` is set. */
  thresholds?: GaugeChartThreshold[];
  showValue?: boolean;
  valueFormatter?: (value: number) => string;
  /** Caption rendered under the value. */
  label?: string;
  'aria-label'?: string;
}

const START_ANGLE = 180;
// Same top-half-gauge convention as RadialBarChart: 0deg=east, positive sweep
// is clockwise in Skia's y-down space, so a 180deg sweep from 180deg (west)
// traces west -> north -> east, the top half.
const SWEEP_ANGLE = 180;
const OUTER_PADDING = 24;
const VALUE_FONT_SIZE = 28;
const LABEL_FONT_SIZE = 13;

const resolveColor = (
  value: number,
  color: string | undefined,
  thresholds: GaugeChartThreshold[] | undefined,
  fallback: string,
) => {
  if (color) {
    return color;
  }

  if (thresholds && thresholds.length > 0) {
    const sorted = [...thresholds].sort((a, b) => a.value - b.value);
    let resolved = sorted[0].color;

    for (const threshold of sorted) {
      if (value >= threshold.value) {
        resolved = threshold.color;
      }
    }

    return resolved;
  }

  return fallback;
};

/**
 * Same "no Victory Native primitive" situation as RadarChart/RadialBarChart/
 * FunnelChart — hand-built on `SkPathBuilder.addArc`, reusing the exact
 * semicircle-gauge geometry RadialBarChart already validated on-device
 * (sweep direction, strokeCap), just for a single ring instead of several.
 */
export const GaugeChart = ({
  value,
  min = 0,
  max = 100,
  height = 220,
  color,
  thresholds,
  showValue = true,
  valueFormatter,
  label,
  'aria-label': ariaLabel,
}: GaugeChartProps) => {
  const theme = useGnomeTheme();
  const formatNumber = useNumberFormatter().format;
  const format = valueFormatter ?? formatNumber;
  const font = useChartFont(LABEL_FONT_SIZE);
  const valueFont = useChartFont(VALUE_FONT_SIZE);
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number } | null>(null);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height: h } = e.nativeEvent.layout;
    setCanvasSize({ width, height: h });
  }, []);

  const clampedValue = Math.min(max, Math.max(min, value));
  const arcColor = resolveColor(value, color, thresholds, theme.accentColor);

  const chartLabel = ariaLabel ?? `Gauge: ${label ? `${label} ` : ''}${format(value)}`;

  const geometry = useMemo(() => {
    if (!canvasSize) {
      return null;
    }

    const outerRadius = Math.max(
      0,
      Math.min(canvasSize.width / 2, canvasSize.height) - OUTER_PADDING,
    );
    const centerX = canvasSize.width / 2;
    const centerY = canvasSize.height - OUTER_PADDING;
    const strokeWidth = outerRadius * 0.3;
    const radius = outerRadius - strokeWidth / 2;
    const oval = Skia.XYWHRect(centerX - radius, centerY - radius, radius * 2, radius * 2);
    const valueSweep = SWEEP_ANGLE * ((clampedValue - min) / (max - min || 1));

    const trackPath = Skia.PathBuilder.Make().addArc(oval, START_ANGLE, SWEEP_ANGLE).build();
    const valuePath = Skia.PathBuilder.Make().addArc(oval, START_ANGLE, valueSweep).build();

    const valueText = format(value);
    const valueTextWidth = valueFont?.measureText(valueText).width ?? 0;
    const labelTextWidth = label ? (font?.measureText(label).width ?? 0) : 0;

    return {
      trackPath,
      valuePath,
      strokeWidth,
      valueTextPoint: { x: centerX - valueTextWidth / 2, y: centerY - strokeWidth - 8 },
      labelTextPoint: { x: centerX - labelTextWidth / 2, y: centerY - strokeWidth + 16 },
      valueText,
    };
  }, [canvasSize, clampedValue, min, max, format, value, valueFont, font, label]);

  return (
    <ChartContainer
      accessibilityLabel={chartLabel}
      legendPosition="bottom"
      height={height}
      legend={null}
    >
      <View style={{ flex: 1 }} onLayout={onLayout}>
        {canvasSize && geometry && (
          <Canvas style={{ width: canvasSize.width, height: canvasSize.height }}>
            <Path
              path={geometry.trackPath}
              style="stroke"
              strokeWidth={geometry.strokeWidth}
              strokeCap="round"
              color={theme.dividerColor}
            />
            <Path
              path={geometry.valuePath}
              style="stroke"
              strokeWidth={geometry.strokeWidth}
              strokeCap="round"
              color={arcColor}
            />
            {showValue && valueFont && (
              <Text
                x={geometry.valueTextPoint.x}
                y={geometry.valueTextPoint.y}
                text={geometry.valueText}
                font={valueFont}
                color={theme.windowFgColor}
              />
            )}
            {showValue && label && font && (
              <Text
                x={geometry.labelTextPoint.x}
                y={geometry.labelTextPoint.y}
                text={label}
                font={font}
                color={theme.windowFgColor}
                opacity={0.55}
              />
            )}
          </Canvas>
        )}
      </View>
    </ChartContainer>
  );
};
