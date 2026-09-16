Minimal inline pie or donut chart for a small breakdown of values — the "spark" (small, no labels,
no legend) member of the pie family, for embedding in a table cell, list row, or card where
`PieChart`'s full size/labels/legend would be too much.

```tsx
import { SparkPieChart } from '@gnome-ui/react-native-charts';

<SparkPieChart data={[{ value: 40 }, { value: 30 }, { value: 20 }, { value: 10 }]} />
```

As a donut, with explicit slice colors:

```tsx
<SparkPieChart
  data={[
    { value: 60, color: '#e01b24' },
    { value: 40, color: '#2ec27e' },
  ]}
  donut
  aria-label="Pass/fail rate"
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `SparkPieChartDataItem[]` | — | `{ value, color? }[]` — color falls back to the GNOME chart palette by index |
| `size` | `number` | `40` | Chart diameter in dp |
| `donut` | `boolean` | `false` | Render as a donut (hollow center) instead of a solid pie |
| `paddingAngle` | `number` | `2` | Gap in degrees between adjacent slices; ignored for single-item data |
| `aria-label` | `string` | — | Accessibility label; the chart is hidden from the accessibility tree entirely when omitted |

### Guidelines

- Use for a small, at-a-glance proportional breakdown embedded inline (a table cell, list row,
  dashboard tile) — for a labeled, legend-bearing breakdown, use `PieChart` instead.
- Always pass `aria-label` when the chart conveys information a screen reader user needs — an
  unlabeled chart is treated as purely decorative and skipped entirely.
