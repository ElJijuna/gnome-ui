import { useGnomeTheme } from '@gnome-ui/react-native';
import { Canvas, Path, Skia, Text } from '@shopify/react-native-skia';
import { useCallback, useMemo, useState } from 'react';
import { type LayoutChangeEvent, View } from 'react-native';

import { getChartPalette } from '@/colors';
import { ChartContainer } from '@/internal/ChartContainer';
import { useChartFont } from '@/internal/useChartFont';

export interface FunnelChartDataItem {
  name: string;
  value: number;
  color?: string;
}

export interface FunnelChartProps {
  data: FunnelChartDataItem[];
  height?: number;
  /** Draw each segment's name centered within it. Defaults to `true`. */
  showLabels?: boolean;
  'aria-label'?: string;
}

const FONT_SIZE = 12;

/**
 * No Victory Native primitive for a funnel chart exists (confirmed by
 * reading its source — no equivalent to Recharts' `Funnel`/`LabelList`
 * anywhere in its exports). Hand-built on `@shopify/react-native-skia`
 * directly, same approach as `RadarChart`/`RadialBarChart`: each segment is
 * a trapezoid whose top width matches its own value's share of the largest
 * value and whose bottom width tapers into the *next* segment's share (the
 * last segment has a flat bottom, matching Recharts' own continuous-taper
 * funnel silhouette rather than a "wedding cake" of discrete steps).
 */
export const FunnelChart = ({
  data,
  height = 300,
  showLabels = true,
  'aria-label': ariaLabel,
}: FunnelChartProps) => {
  const theme = useGnomeTheme();
  const palette = getChartPalette(theme);
  const font = useChartFont(FONT_SIZE);
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number } | null>(null);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height: h } = e.nativeEvent.layout;
    setCanvasSize({ width, height: h });
  }, []);

  const coloredData = data.map((item, i) => ({
    ...item,
    resolvedColor: item.color ?? palette[i % palette.length],
  }));

  const label = ariaLabel ?? 'Funnel chart';

  const maxValue = Math.max(1, ...data.map((d) => d.value));

  const geometry = useMemo(() => {
    if (!canvasSize || coloredData.length === 0) {
      return null;
    }

    const segmentHeight = canvasSize.height / coloredData.length;
    const widthFor = (value: number) => (value / maxValue) * canvasSize.width;

    const segments = coloredData.map((item, i) => {
      const topWidth = widthFor(item.value);
      const nextValue = coloredData[i + 1]?.value ?? item.value;
      const bottomWidth = widthFor(nextValue);
      const top = i * segmentHeight;
      const bottom = top + segmentHeight;
      const topLeft = (canvasSize.width - topWidth) / 2;
      const bottomLeft = (canvasSize.width - bottomWidth) / 2;

      const path = Skia.PathBuilder.Make()
        .moveTo(topLeft, top)
        .lineTo(topLeft + topWidth, top)
        .lineTo(bottomLeft + bottomWidth, bottom)
        .lineTo(bottomLeft, bottom)
        .close()
        .build();

      const labelText = item.name;
      const textWidth = font?.measureText(labelText).width ?? 0;
      const labelPoint = {
        x: canvasSize.width / 2 - textWidth / 2,
        y: top + segmentHeight / 2 + FONT_SIZE / 3,
      };

      return { key: `${item.name}-${i}`, path, color: item.resolvedColor, labelText, labelPoint };
    });

    return { segments };
  }, [canvasSize, coloredData, maxValue, font]);

  return (
    <ChartContainer
      accessibilityLabel={label}
      legendPosition="bottom"
      height={height}
      legend={null}
    >
      <View style={{ flex: 1 }} onLayout={onLayout}>
        {canvasSize && geometry && (
          <Canvas style={{ width: canvasSize.width, height: canvasSize.height }}>
            {geometry.segments.map((s) => (
              <Path key={s.key} path={s.path} style="fill" color={s.color} />
            ))}
            {font &&
              showLabels &&
              geometry.segments.map((s) => (
                <Text
                  key={`label-${s.key}`}
                  x={s.labelPoint.x}
                  y={s.labelPoint.y}
                  text={s.labelText}
                  font={font}
                  color={theme.windowFgColor}
                />
              ))}
          </Canvas>
        )}
      </View>
    </ChartContainer>
  );
};
