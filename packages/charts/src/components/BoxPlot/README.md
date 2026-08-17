Box-and-whisker plot built with plain HTML/CSS — no Recharts (it has no native box-plot primitive). Shows the distribution of one or more groups: median, interquartile range (Q1–Q3), whiskers extending to the most extreme non-outlier value, and outliers beyond 1.5×IQR.

Each item accepts either a raw `values` array (the component computes quartiles and outliers for you) or precomputed statistics — pick whichever fits how your data already arrives.

```tsx
import { BoxPlot } from '@gnome-ui/charts';

// Raw values — quartiles and outliers computed automatically (1.5×IQR rule)
<BoxPlot
  data={[
    { label: 'Team A', values: [12, 15, 14, 18, 22, 9, 31, 16] },
    { label: 'Team B', values: [8, 11, 10, 9, 14, 7, 12] },
  ]}
/>

// Precomputed statistics — e.g. aggregated server-side, or a non-IQR outlier rule
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
| `data` | `BoxPlotDataItem[]` | — | `{ label, color? }` plus either `values: number[]` or `{ min, q1, median, q3, max, outliers? }` |
| `height` | `number` | `320` | Chart height in px |
| `showOutliers` | `boolean` | `true` | Render individual points beyond the whiskers |
| `valueFormatter` | `(value: number) => string` | locale-aware | Custom formatter for axis ticks and the tooltip title |
| `aria-label` | `string` | auto | Accessible label for the chart |
| `className` | `string` | — | Extra CSS class on the wrapper |

### Quartile computation

When an item provides `values`, quartiles use linear interpolation (the common "R-7" method). Outliers are values outside `[Q1 − 1.5×IQR, Q3 + 1.5×IQR]`; the whiskers then extend only to the most extreme *non-outlier* value, not the raw min/max — the standard Tukey box plot convention.

### Guidelines

- Prefer the `values` form unless your data is already aggregated — it keeps the outlier rule consistent across every chart in the app.
- Each box shows a title tooltip with the full five-number summary on hover; individual outlier points are separately titled with their value.
- There is no spark/compact variant: a box-and-whisker glyph needs room for the whiskers, box, and outlier dots to read as a distribution at all — compressing it into a card-sized sparkline loses that entirely. For a compact distribution hint at that scale, `SparkAreaChart`/`SparkBarChart` over a sorted or binned series is a closer fit.
