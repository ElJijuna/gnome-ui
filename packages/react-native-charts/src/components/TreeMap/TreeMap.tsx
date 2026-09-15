import { useGnomeTheme, useNumberFormatter } from '@gnome-ui/react-native';
import { Canvas, RoundedRect, Text } from '@shopify/react-native-skia';
import { useCallback, useMemo, useState } from 'react';
import { type LayoutChangeEvent, View } from 'react-native';

import { getChartPalette } from '@/colors';
import { ChartContainer } from '@/internal/ChartContainer';
import { useChartFont } from '@/internal/useChartFont';

export interface TreeMapDataItem {
  label: string;
  value: number;
  group?: string;
}

export interface TreeMapProps {
  data: TreeMapDataItem[];
  height?: number;
  showLabels?: boolean;
  'aria-label'?: string;
}

const FONT_SIZE = 12;
const VALUE_FONT_SIZE = 11;
const TILE_GAP = 2;
const TILE_RADIUS = 4;
const TEXT_PADDING = 8;

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function worstRatio(row: number[], length: number): number {
  const sum = row.reduce((a, b) => a + b, 0);
  const max = Math.max(...row);
  const min = Math.min(...row);
  const lengthSq = length * length;
  const sumSq = sum * sum;

  return Math.max((lengthSq * max) / sumSq, sumSq / (lengthSq * min));
}

function layoutRow(row: number[], rect: Rect, horizontal: boolean): { tiles: Rect[]; rest: Rect } {
  const rowSum = row.reduce((a, b) => a + b, 0);
  const tiles: Rect[] = [];

  if (horizontal) {
    const rowHeight = rect.width > 0 ? rowSum / rect.width : 0;
    let { x } = rect;

    for (const value of row) {
      const width = rowHeight > 0 ? value / rowHeight : 0;
      tiles.push({ x, y: rect.y, width, height: rowHeight });
      x += width;
    }

    return {
      tiles,
      rest: {
        x: rect.x,
        y: rect.y + rowHeight,
        width: rect.width,
        height: Math.max(0, rect.height - rowHeight),
      },
    };
  }

  const rowWidth = rect.height > 0 ? rowSum / rect.height : 0;
  let { y } = rect;

  for (const value of row) {
    const rowHeight = rowWidth > 0 ? value / rowWidth : 0;
    tiles.push({ x: rect.x, y, width: rowWidth, height: rowHeight });
    y += rowHeight;
  }

  return {
    tiles,
    rest: {
      x: rect.x + rowWidth,
      y: rect.y,
      width: Math.max(0, rect.width - rowWidth),
      height: rect.height,
    },
  };
}

/**
 * Bruls/Huizing/van Wijk "squarified treemap" — the same algorithm
 * Recharts' own `Treemap` uses internally. Recursively packs a list of
 * areas (already scaled to sum to `rect.width * rect.height`) into rows
 * laid out along the *shorter* side of whatever rect remains, adding items
 * to the current row only while doing so doesn't worsen its worst
 * width/height aspect ratio — keeps tiles close to square instead of
 * degenerating into thin slivers. No Victory Native or Skia primitive for
 * this exists, so it's hand-rolled directly on plain numbers; `TreeMap`
 * below turns the resulting rects into `RoundedRect` nodes.
 */
function squarify(values: number[], rect: Rect): Rect[] {
  const tiles: Rect[] = new Array(values.length);
  let remaining = rect;
  let index = 0;
  let row: number[] = [];

  const flushRow = () => {
    const horizontal = remaining.width <= remaining.height;
    const { tiles: rowTiles, rest } = layoutRow(row, remaining, horizontal);

    for (let i = 0; i < rowTiles.length; i += 1) {
      tiles[index - row.length + i] = rowTiles[i];
    }

    remaining = rest;
    row = [];
  };

  while (index < values.length) {
    const length = Math.min(remaining.width, remaining.height);
    const candidate = [...row, values[index]];

    if (row.length === 0 || worstRatio(candidate, length) <= worstRatio(row, length)) {
      row = candidate;
      index += 1;
      continue;
    }

    flushRow();
  }

  if (row.length > 0) {
    flushRow();
  }

  return tiles;
}

function buildColorMap(data: TreeMapDataItem[], palette: string[]): Map<string, string> {
  const keys: string[] = [];

  for (const item of data) {
    const key = item.group ?? item.label;

    if (!keys.includes(key)) {
      keys.push(key);
    }
  }

  return new Map(keys.map((key, i) => [key, palette[i % palette.length]]));
}

/**
 * No Victory Native or Skia primitive for a treemap exists — hand-built
 * directly on `RoundedRect`/`Text`, laid out by `squarify` above. Items are
 * sorted descending by value before layout (the input order Recharts'
 * `Treemap` itself expects for a well-formed squarified result — an
 * unsorted list still lays out validly, just with worse aspect ratios), so
 * tile rendering order intentionally differs from `data`'s own order.
 */
export const TreeMap = ({
  data,
  height = 400,
  showLabels = true,
  'aria-label': ariaLabel,
}: TreeMapProps) => {
  const theme = useGnomeTheme();
  const palette = getChartPalette(theme);
  const formatNumber = useNumberFormatter().format;
  const font = useChartFont(FONT_SIZE);
  const valueFont = useChartFont(VALUE_FONT_SIZE);
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number } | null>(null);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height: h } = e.nativeEvent.layout;
    setCanvasSize({ width, height: h });
  }, []);

  const colorMap = buildColorMap(data, palette);
  const label = ariaLabel ?? 'Treemap';

  const geometry = useMemo(() => {
    if (!canvasSize || data.length === 0) {
      return null;
    }

    const sorted = [...data].sort((a, b) => b.value - a.value);
    const total = sorted.reduce((sum, item) => sum + Math.max(item.value, 0), 0) || 1;
    const canvasArea = canvasSize.width * canvasSize.height;
    const areas = sorted.map((item) => (Math.max(item.value, 0) / total) * canvasArea);
    const rects = squarify(areas, {
      x: 0,
      y: 0,
      width: canvasSize.width,
      height: canvasSize.height,
    });

    const tiles = sorted.map((item, i) => {
      const rect = rects[i];
      const colorKey = item.group ?? item.label;
      const fill = colorMap.get(colorKey) ?? palette[0];
      const tileWidth = Math.max(0, rect.width - TILE_GAP);
      const tileHeight = Math.max(0, rect.height - TILE_GAP);
      const formattedValue = formatNumber(item.value);
      const nameWidth = font?.measureText(item.label).width ?? 0;
      const valueWidth = valueFont?.measureText(formattedValue).width ?? 0;
      const centerX = rect.x + tileWidth / 2;
      const centerY = rect.y + tileHeight / 2;
      // Neither dimension alone guarantees the label actually fits: a tall,
      // narrow tile can clear the width>40/height>24 size gate yet still be
      // too narrow for its own text, which then overflows into the
      // neighboring tile — confirmed on-device (`Samsung Internet` bleeding
      // into `Edge`'s tile) before this measured-width guard was added.
      const showText =
        showLabels && tileWidth > 40 && tileHeight > 24 && nameWidth <= tileWidth - TEXT_PADDING;
      const showValue = showText && tileHeight > 44 && valueWidth <= tileWidth - TEXT_PADDING;

      return {
        key: `${item.label}-${i}`,
        x: rect.x,
        y: rect.y,
        width: tileWidth,
        height: tileHeight,
        fill,
        showText,
        name: item.label,
        namePoint: { x: centerX - nameWidth / 2, y: centerY - (showValue ? 8 : 0) },
        formattedValue,
        valuePoint: { x: centerX - valueWidth / 2, y: centerY + 10 },
        showValue,
      };
    });

    return { tiles };
  }, [canvasSize, data, colorMap, palette, showLabels, formatNumber, font, valueFont]);

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
            {geometry.tiles.map((tile) => (
              <RoundedRect
                key={tile.key}
                x={tile.x}
                y={tile.y}
                width={tile.width}
                height={tile.height}
                r={TILE_RADIUS}
                color={tile.fill}
              />
            ))}
            {font &&
              geometry.tiles.map(
                (tile) =>
                  tile.showText && (
                    <Text
                      key={`name-${tile.key}`}
                      x={tile.namePoint.x}
                      y={tile.namePoint.y}
                      text={tile.name}
                      font={font}
                      color={theme.windowFgColor}
                    />
                  ),
              )}
            {valueFont &&
              geometry.tiles.map(
                (tile) =>
                  tile.showValue && (
                    <Text
                      key={`value-${tile.key}`}
                      x={tile.valuePoint.x}
                      y={tile.valuePoint.y}
                      text={tile.formattedValue}
                      font={valueFont}
                      color={theme.windowFgColor}
                      opacity={0.7}
                    />
                  ),
              )}
          </Canvas>
        )}
      </View>
    </ChartContainer>
  );
};
