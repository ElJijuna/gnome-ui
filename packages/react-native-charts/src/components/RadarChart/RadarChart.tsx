import { useGnomeTheme } from '@gnome-ui/react-native';
import { Canvas, Line, Path, Skia, Text } from '@shopify/react-native-skia';
import { useCallback, useMemo, useState } from 'react';
import { type LayoutChangeEvent, View } from 'react-native';

import { getChartPalette } from '@/colors';
import { ChartContainer } from '@/internal/ChartContainer';
import { ChartLegend } from '@/internal/ChartLegend';
import { type InputKeys, type NumericalKeys } from '@/internal/chartKeys';
import { useChartFont } from '@/internal/useChartFont';
import { type ChartLegendPosition } from '@/types/legend';

export interface RadarChartSeries<YK extends string = string> {
  dataKey: YK;
  name?: string;
  color?: string;
}

export interface RadarChartProps<
  RawData extends Record<string, string | number>,
  YK extends keyof NumericalKeys<RawData> & string,
> {
  data: RawData[];
  series: RadarChartSeries<YK>[];
  angleKey?: keyof InputKeys<RawData> & string;
  height?: number;
  filled?: boolean;
  showLegend?: boolean;
  /** Position of the legend when `showLegend` is true. Defaults to `"bottom"`. */
  legendPosition?: ChartLegendPosition;
  'aria-label'?: string;
}

const GRID_LEVELS = 4;
// Room around the plotted polygon for the axis labels, which extend past the outer ring.
const OUTER_PADDING = 36;
const FONT_SIZE = 11;

/**
 * No Victory Native primitive for a radar/spider chart exists at all (confirmed:
 * neither `CartesianChart` nor `PolarChart` support an arbitrary-axis-count
 * polar plot — `PolarChart` is hardwired to pie-slice generation from a single
 * value per row). Hand-built directly on `@shopify/react-native-skia` instead,
 * the same primitives Victory Native itself composes internally.
 */
export const RadarChart = <
  RawData extends Record<string, string | number>,
  YK extends keyof NumericalKeys<RawData> & string,
>({
  data,
  series,
  angleKey = 'name' as keyof InputKeys<RawData> & string,
  height = 300,
  filled = false,
  showLegend = false,
  legendPosition = 'bottom',
  'aria-label': ariaLabel,
}: RadarChartProps<RawData, YK>) => {
  const theme = useGnomeTheme();
  const palette = getChartPalette(theme);
  const font = useChartFont(FONT_SIZE);
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number } | null>(null);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height: h } = e.nativeEvent.layout;
    setCanvasSize({ width, height: h });
  }, []);

  const seriesColor = (s: RadarChartSeries<YK>, i: number) =>
    s.color ?? palette[i % palette.length];

  const label =
    ariaLabel ?? `Radar chart with ${series.map((s) => s.name ?? s.dataKey).join(', ')}`;

  const axisCount = data.length;
  const maxValue = Math.max(
    1,
    ...series.flatMap((s) => data.map((d) => Number(d[s.dataKey]) || 0)),
  );

  const geometry = useMemo(() => {
    if (!canvasSize || axisCount < 3) {
      return null;
    }

    const center = { x: canvasSize.width / 2, y: canvasSize.height / 2 };
    const outerRadius = Math.max(
      0,
      Math.min(canvasSize.width, canvasSize.height) / 2 - OUTER_PADDING,
    );
    const angleAt = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / axisCount;
    const pointAt = (i: number, radius: number) => {
      const angle = angleAt(i);
      return { x: center.x + radius * Math.cos(angle), y: center.y + radius * Math.sin(angle) };
    };
    const polygonPath = (radius: number) => {
      const builder = Skia.PathBuilder.Make();
      for (let i = 0; i < axisCount; i++) {
        const p = pointAt(i, radius);
        if (i === 0) {
          builder.moveTo(p.x, p.y);
        } else {
          builder.lineTo(p.x, p.y);
        }
      }
      return builder.close().build();
    };

    const gridRings = Array.from({ length: GRID_LEVELS }, (_, level) =>
      polygonPath(outerRadius * ((level + 1) / GRID_LEVELS)),
    );

    const spokes = Array.from({ length: axisCount }, (_, i) => ({
      key: i,
      p1: center,
      p2: pointAt(i, outerRadius),
    }));

    const axisLabels = data.map((d, i) => {
      const anchor = pointAt(i, outerRadius + 14);
      const text = String(d[angleKey]);
      const textWidth = font?.measureText(text).width ?? 0;
      const cosA = Math.cos(angleAt(i));
      const sinA = Math.sin(angleAt(i));
      const x =
        Math.abs(cosA) < 0.3
          ? anchor.x - textWidth / 2
          : cosA < 0
            ? anchor.x - textWidth
            : anchor.x;
      const y =
        sinA < -0.3 ? anchor.y : sinA > 0.3 ? anchor.y + FONT_SIZE : anchor.y + FONT_SIZE / 3;
      return { key: i, text, x, y };
    });

    const seriesPaths = series.map((s, i) => {
      const builder = Skia.PathBuilder.Make();
      for (let axisIndex = 0; axisIndex < axisCount; axisIndex++) {
        const value = Number(data[axisIndex]?.[s.dataKey]) || 0;
        const p = pointAt(axisIndex, outerRadius * (value / maxValue));
        if (axisIndex === 0) {
          builder.moveTo(p.x, p.y);
        } else {
          builder.lineTo(p.x, p.y);
        }
      }
      return { key: s.dataKey, path: builder.close().build(), color: seriesColor(s, i) };
    });

    return { gridRings, spokes, axisLabels, seriesPaths };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasSize, axisCount, data, series, angleKey, maxValue, font]);

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
            entries={series.map((s, i) => ({
              key: s.dataKey,
              label: s.name ?? s.dataKey,
              color: seriesColor(s, i),
            }))}
          />
        ) : null
      }
    >
      <View style={{ flex: 1 }} onLayout={onLayout}>
        {canvasSize && geometry && (
          <Canvas style={{ width: canvasSize.width, height: canvasSize.height }}>
            {geometry.gridRings.map((ring, i) => (
              <Path
                key={`grid-${i}`}
                path={ring}
                style="stroke"
                strokeWidth={1}
                color={theme.dividerColor}
              />
            ))}
            {geometry.spokes.map((spoke) => (
              <Line
                key={`spoke-${spoke.key}`}
                p1={spoke.p1}
                p2={spoke.p2}
                color={theme.dividerColor}
                strokeWidth={1}
              />
            ))}
            {geometry.seriesPaths.map((s) => (
              <Path
                key={`fill-${s.key}`}
                path={s.path}
                style="fill"
                color={s.color}
                opacity={filled ? 0.35 : 0}
              />
            ))}
            {geometry.seriesPaths.map((s) => (
              <Path
                key={`stroke-${s.key}`}
                path={s.path}
                style="stroke"
                strokeWidth={2}
                strokeJoin="round"
                color={s.color}
              />
            ))}
            {font &&
              geometry.axisLabels.map((l) => (
                <Text
                  key={`label-${l.key}`}
                  x={l.x}
                  y={l.y}
                  text={l.text}
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
