/**
 * Configuration for a single series in a multi-series spark chart. Shared
 * across the whole spark-chart family (`SparkLineChart`, `SparkAreaChart`,
 * ...) — moved here once a second consumer needed the exact same shape.
 */
export interface SparkSeries {
  /** Data key to read from each data object. */
  key: string;
  /** Override color for this series. Falls back to the GNOME chart palette by index when omitted. */
  color?: string;
}

export type SparkData = number[] | Record<string, string | number>[];

/** Assigns each series its resolved color, falling back to the palette by index. */
export function resolveSparkSeries(
  series: SparkSeries[] | undefined,
  dataKey: string,
  color: string | undefined,
  defaultColor: string,
  palette: string[],
): { key: string; color: string }[] {
  return series
    ? series.map((s, i) => ({ key: s.key, color: s.color ?? palette[i % palette.length] }))
    : [{ key: dataKey, color: color ?? defaultColor }];
}

/** Normalizes `number[]` or `Record<string, number>[]` into rows Victory Native can plot, adding a synthetic `__x` index key standing in for the web version's implicit array-index x-position. */
export function normalizeSparkData(data: SparkData, key: string): Record<string, number>[] {
  if (data.length === 0) {
    return [];
  }

  return typeof data[0] === 'number'
    ? (data as number[]).map((v, i) => ({ __x: i, [key]: v }))
    : (data as Record<string, number>[]).map((d, i) => ({ ...d, __x: i }));
}

/**
 * Ports the web spark charts' own conditional accessibility pattern: a real
 * `role="img"`/label only when `aria-label` is actually given, otherwise
 * `aria-hidden` — an unlabeled decorative sparkline shouldn't be a
 * screen-reader stop at all.
 */
export function sparkAccessibilityProps(ariaLabel: string | undefined) {
  return ariaLabel
    ? {
        accessible: true as const,
        accessibilityRole: 'image' as const,
        accessibilityLabel: ariaLabel,
      }
    : {
        accessibilityElementsHidden: true as const,
        importantForAccessibility: 'no-hide-descendants' as const,
      };
}
