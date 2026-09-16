import { useGnomeTheme, useNumberFormatter } from '@gnome-ui/react-native';
import { Canvas, LinearGradient, RoundedRect } from '@shopify/react-native-skia';
import { StyleSheet, Text, View } from 'react-native';

import { withAlpha } from '@/internal/colorAlpha';
import { useChartFont } from '@/internal/useChartFont';

export interface HeatmapDataItem {
  row: string;
  column: string;
  value: number;
}

export interface HeatmapProps {
  data: HeatmapDataItem[];
  /** Explicit row order (top to bottom). Defaults to first-seen order in `data`. */
  rows?: string[];
  /** Explicit column order (left to right). Defaults to first-seen order in `data`. */
  columns?: string[];
  /** Base color for the intensity scale. Defaults to the theme accent color. */
  color?: string;
  /** Explicit domain min. Defaults to the lowest value in `data`. */
  min?: number;
  /** Explicit domain max. Defaults to the highest value in `data`. */
  max?: number;
  /** Cell side length in dp. Defaults to `40`. */
  cellSize?: number;
  /** Show the numeric value inside each cell. */
  showValues?: boolean;
  valueFormatter?: (value: number) => string;
  /** Show a min→max color scale legend below the grid. */
  showLegend?: boolean;
  'aria-label'?: string;
}

const uniqueInOrder = (values: string[]): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    if (!seen.has(value)) {
      seen.add(value);
      result.push(value);
    }
  }

  return result;
};

const GRID_GAP = 3;
const LABEL_FONT_SIZE = 11;
const ROW_LABEL_PADDING = 8;
const LEGEND_RAMP_WIDTH = 96;
const LEGEND_RAMP_HEIGHT = 8;
// Same floor Recharts' `color-mix` version uses (`Math.max(6, intensity)`,
// on its 0-100 scale) so the lowest-value cell is still visibly tinted
// rather than fully transparent against the page background.
const MIN_INTENSITY = 0.06;

/**
 * No Victory Native/Skia primitive needed for the grid itself — same
 * situation `CloudChart`/`BulletChart` found reading their web sources: this
 * is plain absolutely-unrelated `<div>`s (a CSS grid) with no chart-drawing
 * involved, which RN's own `View`/`Text` port directly with a row-of-rows
 * layout instead of `display: grid` (RN has no grid layout mode). The only
 * Skia usage is a tiny `Canvas` for the optional legend ramp's gradient
 * fill — RN's `View` styles have no `linear-gradient` equivalent, and this
 * package already depends on Skia for exactly this (`AreaChart`/
 * `SparkAreaChart`'s gradient fills), so no new dependency was needed.
 */
export const Heatmap = ({
  data,
  rows,
  columns,
  color,
  min,
  max,
  cellSize = 40,
  showValues = false,
  valueFormatter,
  showLegend = false,
  'aria-label': ariaLabel,
}: HeatmapProps) => {
  const theme = useGnomeTheme();
  const formatNumber = useNumberFormatter().format;
  const format = valueFormatter ?? formatNumber;
  const font = useChartFont(LABEL_FONT_SIZE);
  const resolvedColor = color ?? theme.accentColor;

  const rowLabels = rows ?? uniqueInOrder(data.map((d) => d.row));
  const columnLabels = columns ?? uniqueInOrder(data.map((d) => d.column));

  const valueByCell = new Map<string, Map<string, number>>();
  for (const d of data) {
    if (!valueByCell.has(d.row)) {
      valueByCell.set(d.row, new Map());
    }
    valueByCell.get(d.row)!.set(d.column, d.value);
  }

  const values = data.map((d) => d.value);
  const domainMin = min ?? Math.min(...values);
  const domainMax = max ?? Math.max(...values);
  const range = domainMax - domainMin || 1;

  // RN has no CSS Grid `auto` column sizing, so the row-label column's width
  // (the "widest row label" the web version gets for free) is measured up
  // front with Skia's synchronous `font.measureText` — the same technique
  // `TreeMap`/`GaugeChart` already use for layout decisions in this package
  // — rather than a two-pass `onLayout` measure-then-reflow. `ROW_LABEL_PADDING`
  // is added on top (not just applied as the box's `paddingRight`) because RN's
  // `width` is border-box: applying `paddingRight` alone on a box already
  // pinned to the measured text width silently ate into the text's own
  // available space, ellipsizing capital-letter-heavy labels first — confirmed
  // on-device (`Mon`/`Tue`/`Wed`/`Thu` truncated to `M…`/`T…`, "Fri" only
  // surviving by coincidence, not because of any actual font/measurement
  // mismatch).
  const widestRowLabel = rowLabels.reduce(
    (widest, label) => Math.max(widest, font?.measureText(label).width ?? 0),
    0,
  );
  const rowLabelWidth = widestRowLabel + (rowLabels.length > 0 ? ROW_LABEL_PADDING : 0);

  const dimLabelStyle = {
    fontSize: LABEL_FONT_SIZE,
    color: theme.windowFgColor,
    // No RN theme token for the web's `--gnome-dim-label-color` — same gap
    // `GaugeChart`/`BulletChart` already documented — approximated with
    // reduced opacity instead of inventing a token for secondary text.
    opacity: 0.55,
    fontFamily: theme.fontFamily,
  } as const;

  const label = ariaLabel ?? `Heatmap: ${rowLabels.length} rows by ${columnLabels.length} columns`;

  return (
    <View accessible accessibilityRole="image" accessibilityLabel={label} style={styles.container}>
      <View style={styles.row}>
        <View style={{ width: rowLabelWidth }} />
        {columnLabels.map((column) => (
          <View
            key={column}
            style={[
              styles.columnLabel,
              { width: cellSize, height: cellSize, marginLeft: GRID_GAP },
            ]}
          >
            <Text numberOfLines={1} style={dimLabelStyle}>
              {column}
            </Text>
          </View>
        ))}
      </View>
      {rowLabels.map((row) => (
        <View key={row} style={[styles.row, { marginTop: GRID_GAP }]}>
          <View
            style={[
              styles.rowLabel,
              { width: rowLabelWidth, height: cellSize, paddingRight: ROW_LABEL_PADDING },
            ]}
          >
            <Text numberOfLines={1} style={dimLabelStyle}>
              {row}
            </Text>
          </View>
          {columnLabels.map((column) => {
            const value = valueByCell.get(row)?.get(column);
            const intensity = value === undefined ? 0 : (value - domainMin) / range;
            const background =
              value === undefined
                ? theme.cardShadeColor
                : withAlpha(resolvedColor, Math.max(MIN_INTENSITY, intensity));
            const textColor = intensity > 0.55 ? 'rgba(255, 255, 255, 0.95)' : theme.windowFgColor;

            return (
              <View
                key={column}
                style={[
                  styles.cell,
                  {
                    width: cellSize,
                    height: cellSize,
                    marginLeft: GRID_GAP,
                    borderRadius: theme.radiusSm,
                    backgroundColor: background,
                  },
                ]}
              >
                {showValues && value !== undefined && (
                  <Text style={[styles.cellValue, { color: textColor }]}>{format(value)}</Text>
                )}
              </View>
            );
          })}
        </View>
      ))}
      {showLegend && (
        <View style={styles.legend}>
          <Text style={dimLabelStyle}>{format(domainMin)}</Text>
          <View style={styles.legendRampWrapper}>
            <Canvas style={styles.legendRampCanvas}>
              <RoundedRect
                x={0}
                y={0}
                width={LEGEND_RAMP_WIDTH}
                height={LEGEND_RAMP_HEIGHT}
                r={theme.radiusSm}
              >
                <LinearGradient
                  start={{ x: 0, y: 0 }}
                  end={{ x: LEGEND_RAMP_WIDTH, y: 0 }}
                  colors={[withAlpha(resolvedColor, MIN_INTENSITY), resolvedColor]}
                />
              </RoundedRect>
            </Canvas>
          </View>
          <Text style={dimLabelStyle}>{format(domainMax)}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
  },
  columnLabel: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 4,
  },
  rowLabel: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellValue: {
    fontSize: LABEL_FONT_SIZE,
    fontWeight: '500',
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendRampWrapper: {
    width: LEGEND_RAMP_WIDTH,
    height: LEGEND_RAMP_HEIGHT,
  },
  legendRampCanvas: {
    width: LEGEND_RAMP_WIDTH,
    height: LEGEND_RAMP_HEIGHT,
  },
});
