import { useGnomeTheme } from '@gnome-ui/react-native';
import { Canvas, Path, Skia, Text } from '@shopify/react-native-skia';
import { useCallback, useMemo, useState } from 'react';
import { type LayoutChangeEvent, View } from 'react-native';

import { getChartPalette } from '@/colors';
import { ChartContainer } from '@/internal/ChartContainer';
import { ChartLegend } from '@/internal/ChartLegend';
import { useChartFont } from '@/internal/useChartFont';
import { type ChartLegendPosition } from '@/types/legend';

export interface RadialBarChartDataItem {
  label: string;
  value: number;
  color?: string;
}

export interface RadialBarChartProps {
  data: RadialBarChartDataItem[];
  height?: number;
  /** Radius of the innermost ring, as a fraction (0-1) or percent string of the outer radius. Defaults to `0.2`. */
  innerRadius?: number | string;
  /** Draw each ring's label centered within its band. Defaults to `false`. */
  showLabels?: boolean;
  showLegend?: boolean;
  /** Position of the legend when `showLegend` is true. Defaults to `"bottom"`. */
  legendPosition?: ChartLegendPosition;
  'aria-label'?: string;
}

const START_ANGLE = 180;
// Top-half gauge: west -> north -> east. Skia's `addArc` measures 0deg at positive-x (east) with
// POSITIVE sweep going clockwise (y-down screen space, so clockwise visually means east->south->
// west->north) — confirmed on-device: a negative sweep here drew the *bottom* half instead,
// mostly clipped out of view since the center sits at the canvas's bottom edge.
const SWEEP_ANGLE = 180;
const OUTER_PADDING = 24;
const RING_GAP_FRACTION = 0.25;
const FONT_SIZE = 11;

const resolveInnerRadius = (innerRadius: number | string, outerRadius: number) => {
  if (typeof innerRadius === 'number') {
    return outerRadius * innerRadius;
  }
  const pct = parseFloat(innerRadius) / 100;
  return outerRadius * (Number.isFinite(pct) ? pct : 0.2);
};

/**
 * Same situation as `RadarChart` — no Victory Native primitive for concentric
 * radial/gauge bars exists (confirmed by reading its source). Hand-built on
 * `@shopify/react-native-skia`'s arc support (`SkPathBuilder.addArc`) instead.
 */
export const RadialBarChart = ({
  data,
  height = 300,
  innerRadius = 0.2,
  showLabels = false,
  showLegend = false,
  legendPosition = 'bottom',
  'aria-label': ariaLabel,
}: RadialBarChartProps) => {
  const theme = useGnomeTheme();
  const palette = getChartPalette(theme);
  const font = useChartFont(FONT_SIZE);
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number } | null>(null);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height: h } = e.nativeEvent.layout;
    setCanvasSize({ width, height: h });
  }, []);

  const chartData = data.map((item, i) => ({
    ...item,
    resolvedColor: item.color ?? palette[i % palette.length],
  }));

  const label =
    ariaLabel ?? `Radial bar chart: ${data.map((d) => `${d.label} ${d.value}`).join(', ')}`;

  const maxValue = Math.max(1, ...data.map((d) => d.value));

  const geometry = useMemo(() => {
    if (!canvasSize || chartData.length === 0) {
      return null;
    }

    const outerRadius = Math.max(
      0,
      Math.min(canvasSize.width / 2, canvasSize.height) - OUTER_PADDING,
    );
    const centerX = canvasSize.width / 2;
    const centerY = canvasSize.height - OUTER_PADDING;
    const actualInnerRadius = resolveInnerRadius(innerRadius, outerRadius);
    const bandHeight = (outerRadius - actualInnerRadius) / chartData.length;
    const strokeWidth = bandHeight * (1 - RING_GAP_FRACTION);
    const oval = (radius: number) =>
      Skia.XYWHRect(centerX - radius, centerY - radius, radius * 2, radius * 2);
    const pointAtDeg = (deg: number, radius: number) => {
      const rad = (deg * Math.PI) / 180;
      return { x: centerX + radius * Math.cos(rad), y: centerY + radius * Math.sin(rad) };
    };

    const rings = chartData.map((item, i) => {
      const radius = actualInnerRadius + (i + 0.5) * bandHeight;
      const valueSweep = SWEEP_ANGLE * (item.value / maxValue);
      const trackPath = Skia.PathBuilder.Make()
        .addArc(oval(radius), START_ANGLE, SWEEP_ANGLE)
        .build();
      const valuePath = Skia.PathBuilder.Make()
        .addArc(oval(radius), START_ANGLE, valueSweep)
        .build();

      let labelPoint = null;
      if (showLabels) {
        const midDeg = START_ANGLE + valueSweep / 2;
        const anchor = pointAtDeg(midDeg, radius);
        const textWidth = font?.measureText(item.label).width ?? 0;
        labelPoint = { x: anchor.x - textWidth / 2, y: anchor.y + FONT_SIZE / 3 };
      }

      return {
        key: `${item.label}-${i}`,
        radius,
        trackPath,
        valuePath,
        color: item.resolvedColor,
        label: labelPoint ? { ...labelPoint, text: item.label } : null,
      };
    });

    return { rings, strokeWidth };
  }, [canvasSize, chartData, maxValue, innerRadius, showLabels, font]);

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
      <View style={{ flex: 1 }} onLayout={onLayout}>
        {canvasSize && geometry && (
          <Canvas style={{ width: canvasSize.width, height: canvasSize.height }}>
            {geometry.rings.map((ring) => (
              <Path
                key={`track-${ring.key}`}
                path={ring.trackPath}
                style="stroke"
                strokeWidth={geometry.strokeWidth}
                strokeCap="round"
                color={theme.dividerColor}
              />
            ))}
            {geometry.rings.map((ring) => (
              <Path
                key={`value-${ring.key}`}
                path={ring.valuePath}
                style="stroke"
                strokeWidth={geometry.strokeWidth}
                strokeCap="round"
                color={ring.color}
              />
            ))}
            {font &&
              geometry.rings.map(
                (ring) =>
                  ring.label && (
                    <Text
                      key={`label-${ring.key}`}
                      x={ring.label.x}
                      y={ring.label.y}
                      text={ring.label.text}
                      font={font}
                      color={theme.windowFgColor}
                    />
                  ),
              )}
          </Canvas>
        )}
      </View>
    </ChartContainer>
  );
};
