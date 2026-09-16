export interface ColorThreshold {
  value: number;
  color: string;
}

/**
 * Ascending value/color status-band resolution shared by `GaugeChart` and
 * `SparkGaugeChart` (its second real consumer, extracted here on the same
 * "second occurrence" call as `src/internal/`'s other shared helpers) — picks
 * the color of the *last* sorted threshold whose `value` is `<=` the given
 * value, so `[{ value: 0, color }, ...]` reads as ascending status bands.
 */
export function resolveThresholdColor(
  value: number,
  color: string | undefined,
  thresholds: ColorThreshold[] | undefined,
  fallback: string,
): string {
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
}
