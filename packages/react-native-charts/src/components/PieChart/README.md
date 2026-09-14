Pie/donut chart built on Victory Native (Skia) with GNOME design tokens for slice colors, labels,
and legend.

Unlike the other charts in this package, `PieChart` is polar — it takes a flat list of
`{ label, value, color? }` items instead of `data` + `series`, and has no axes or grid.

```tsx
import { PieChart } from '@gnome-ui/react-native-charts';

<PieChart
  data={[
    { label: 'Chrome', value: 62 },
    { label: 'Safari', value: 20 },
    { label: 'Firefox', value: 10 },
    { label: 'Other', value: 8 },
  ]}
  donut
  showLegend
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `PieChartDataItem[]` | — | Slices (`label`, `value`, `color?`) |
| `height` | `number` | `300` | Chart height in dp |
| `donut` | `boolean` | `false` | Hollow center |
| `showLabels` | `boolean` | `false` | Draw each slice's label inside it. Slices under 4% of the total skip their label |
| `showLegend` | `boolean` | `false` | Show a legend entry per slice |
| `legendPosition` | `"top" \| "bottom" \| "left" \| "right"` | `"bottom"` | Position of the legend when `showLegend` is true |
| `aria-label` | `string` | auto | Accessibility label for the chart (`accessibilityLabel`) |

### Guidelines

- Use for part-to-whole composition of a small number of categories — beyond ~6 slices, prefer a
  `BarChart` instead.
- Pass `color` per item to override the default GNOME palette.
- `showLabels` draws text centered inside each slice, not the web version's external leader-line
  labels — for long labels or many slices, `showLegend` reads better than `showLabels`.
