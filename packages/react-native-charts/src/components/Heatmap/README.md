Grid of colored cells for visualizing a value across two categorical dimensions (e.g. activity by
day and time, correlation between two sets of categories). Cell color intensity encodes the value;
missing row/column combinations render as a neutral placeholder instead of a colored cell.

```tsx
import { Heatmap } from '@gnome-ui/react-native-charts';

<Heatmap
  data={[
    { row: 'Mon', column: 'Morning', value: 12 },
    { row: 'Mon', column: 'Afternoon', value: 34 },
    { row: 'Tue', column: 'Morning', value: 5 },
    { row: 'Tue', column: 'Afternoon', value: 20 },
  ]}
  showValues
/>
```

With a legend and a custom color:

```tsx
<Heatmap data={data} color="#9141ac" showLegend />
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `HeatmapDataItem[]` | — | `{ row, column, value }[]` |
| `rows` | `string[]` | First-seen order in `data` | Explicit row order, top to bottom |
| `columns` | `string[]` | First-seen order in `data` | Explicit column order, left to right |
| `color` | `string` | Theme accent color | Base color for the intensity scale |
| `min` | `number` | Lowest value in `data` | Explicit domain min |
| `max` | `number` | Highest value in `data` | Explicit domain max |
| `cellSize` | `number` | `40` | Cell side length in dp |
| `showValues` | `boolean` | `false` | Show the numeric value inside each cell |
| `valueFormatter` | `(value: number) => string` | Locale-aware number formatting | Custom formatting for displayed values |
| `showLegend` | `boolean` | `false` | Show a min→max color scale legend below the grid |
| `aria-label` | `string` | Auto-generated from row/column counts | Accessibility label for the chart |

### Guidelines

- Use for a value spread across two categorical dimensions (day × time, feature × cohort) — for a
  single dimension over time or category, use `BarChart`/`LineChart` instead.
- A row/column combination absent from `data` renders as a neutral placeholder, distinct from a
  real (even zero) value — don't omit a cell to represent "zero", pass `value: 0` for that.
- `min`/`max` are useful for keeping the color scale consistent across multiple heatmaps shown
  side by side (e.g. one per week) — otherwise each chart's own data range sets its own scale.
