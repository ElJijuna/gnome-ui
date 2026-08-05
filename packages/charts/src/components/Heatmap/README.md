Generic matrix heatmap built in pure CSS/SVG (no Recharts dependency) — for correlation matrices, density grids, or any row × column value grid. For a calendar-shaped activity heatmap, use `ContributionGraph` from `@gnome-ui/react` instead.

```tsx
import { Heatmap } from '@gnome-ui/charts';

<Heatmap
  data={[
    { row: 'Mon', column: 'AM', value: 12 },
    { row: 'Mon', column: 'PM', value: 48 },
    { row: 'Tue', column: 'AM', value: 70 },
    { row: 'Tue', column: 'PM', value: 22 },
  ]}
  showValues
/>
```

### Explicit row/column order

By default, rows and columns appear in first-seen order in `data`. Pass `rows`/`columns` to control ordering — useful for sparse matrices where some combinations are missing (those cells render as empty).

```tsx
<Heatmap
  data={data}
  rows={['Mon', 'Tue', 'Wed', 'Thu', 'Fri']}
  columns={['AM', 'PM']}
/>
```

### Legend

```tsx
<Heatmap data={data} showLegend />
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `HeatmapDataItem[]` | — | `{ row: string; column: string; value: number }[]` |
| `rows` | `string[]` | first-seen order | Explicit row order, top to bottom |
| `columns` | `string[]` | first-seen order | Explicit column order, left to right |
| `color` | `string` | accent blue | Base color for the intensity scale |
| `min` | `number` | lowest value in `data` | Explicit domain minimum |
| `max` | `number` | highest value in `data` | Explicit domain maximum |
| `cellSize` | `number` | `40` | Cell side length in px |
| `showValues` | `boolean` | `false` | Show the formatted value inside each cell |
| `valueFormatter` | `(value: number) => string` | locale-aware | Custom formatter for cell values and the legend |
| `showLegend` | `boolean` | `false` | Show a min→max color scale below the grid |
| `aria-label` | `string` | auto | Accessible label for the chart |
| `className` | `string` | — | Extra CSS class on the wrapper |

### Guidelines

- Pass `min`/`max` explicitly to keep the color scale comparable across multiple `Heatmap` instances (e.g. one per dashboard tab).
- Each cell exposes its row, column, and value via `title` and `aria-label` — hover or use a screen reader for exact values even when `showValues` is off.
