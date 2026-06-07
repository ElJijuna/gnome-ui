Pie and donut chart built on Recharts for part-to-whole comparisons.

Each data item maps to a slice. Enable `donut` to render a ring with a hollow center, `showLabels` to add percentage labels outside each slice, and `showLegend` for a color key.

```tsx
import { PieChart } from '@gnome-ui/charts';

<PieChart
  data={[
    { label: 'Chrome', value: 62 },
    { label: 'Firefox', value: 18 },
    { label: 'Safari', value: 11 },
  ]}
  donut
  showLegend
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `PieChartDataItem[]` | — | `{ label: string; value: number; color?: string }[]` |
| `height` | `number` | `300` | Chart height in px |
| `donut` | `boolean` | `false` | Render as donut (hollow center) |
| `showLabels` | `boolean` | `false` | Show percentage labels outside slices |
| `showLegend` | `boolean` | `false` | Show color legend |

### Guidelines

- Use donut mode when you want to add a central summary value via a custom overlay.
- Slices smaller than 4 % suppress their label automatically to avoid clutter.
- Pass `color` per item to use brand or semantic colors (success, error, warning).
