Box-and-whisker plot for comparing the distribution of several groups — median, interquartile
range (the box), the non-outlier min/max (the whiskers), and outliers beyond 1.5×IQR as individual
points. Pass either raw `values` (stats are computed automatically) or precomputed stats per item.

```tsx
import { BoxPlot } from '@gnome-ui/react-native-charts';

<BoxPlot
  data={[
    { label: 'Team A', values: [12, 15, 14, 18, 22, 9, 31, 16] },
    { label: 'Team B', values: [8, 11, 10, 9, 14, 7, 12] },
  ]}
/>
```

With precomputed stats (skips the automatic quartile/outlier computation):

```tsx
<BoxPlot
  data={[
    { label: 'Team A', min: 9, q1: 13, median: 15.5, q3: 19, max: 22, outliers: [31] },
    { label: 'Team B', min: 7, q1: 8.5, median: 10, q3: 11.5, max: 14 },
  ]}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `BoxPlotDataItem[]` | — | Either `{ label, color?, values: number[] }` or `{ label, color? } & BoxPlotStats` per item |
| `height` | `number` | `320` | Chart height in dp |
| `showOutliers` | `boolean` | `true` | Render individual points beyond the whiskers (values outside 1.5×IQR) |
| `valueFormatter` | `(value: number) => string` | Locale-aware number formatting | Custom formatting for axis ticks |
| `aria-label` | `string` | Auto-generated from each item's label and median | Accessibility label for the chart |

`BoxPlotStats`:

| Field | Type | Description |
|-------|------|-------------|
| `min` | `number` | Lower whisker end (excludes outliers) |
| `q1` | `number` | First quartile — bottom of the box |
| `median` | `number` | Second quartile — the line inside the box |
| `q3` | `number` | Third quartile — top of the box |
| `max` | `number` | Upper whisker end (excludes outliers) |
| `outliers` | `number[]` | Values beyond the whiskers, rendered as individual points |

### Guidelines

- Use for comparing distributions across groups (test scores, response times, measurements per
  cohort) — for a single series' trend over time, use `LineChart`/`AreaChart` instead.
- Pass raw `values` when you have the underlying dataset; pass precomputed `BoxPlotStats` when
  quartiles/outliers are already computed server-side (e.g. from a database aggregate).
- With `values`, outliers are computed via the standard 1.5×IQR rule; the whiskers then run to the
  min/max of the remaining (non-outlier) values, not the raw min/max.
