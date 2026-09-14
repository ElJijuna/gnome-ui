/**
 * Local structural replicas of victory-native's own (unexported) `InputFields`/
 * `NumericalFields` mapped types — required so a chart component's `xAxisKey`/
 * `series[].dataKey` generics line up with what `CartesianChart` itself infers
 * for `xKey`/`yKeys`, since TS compares these mapped types structurally, not by
 * import identity (a plain `Extract<keyof RawData, string>` does NOT satisfy
 * `keyof NumericalFields<RawData>` even though it's obviously narrower).
 */
export type InputKeys<RawData> = {
  [K in keyof RawData as RawData[K] extends number | string ? K : never]: RawData[K];
};
export type NumericalKeys<RawData> = {
  [K in keyof RawData as RawData[K] extends number | null | undefined ? K : never]: RawData[K];
};
