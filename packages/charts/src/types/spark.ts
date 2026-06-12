/**
 * Configuration for a single series in a multi-series spark chart.
 * Pass an array of these as the `series` prop to render multiple lines or areas.
 */
export interface SparkSeries {
  /** Data key to read from each data object. */
  key: string;
  /**
   * Override colour for this series.
   * Falls back to `GNOME_CHART_PALETTE[index]` when omitted.
   */
  color?: string;
}
