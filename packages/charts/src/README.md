Inline sparkline charts for embedding compact trend visualizations inside cards, tables, and dashboards — no axes, no labels, minimal chrome.

Three variants are available: `SparkAreaChart`, `SparkLineChart`, and `SparkBarChart`. All accept either a plain number array or an object array with a `dataKey`.

```tsx
import { SparkAreaChart, SparkBarChart, SparkLineChart } from '@gnome-ui/charts';

// Plain numbers
<SparkAreaChart data={[42, 58, 35, 72, 61]} height={48} aria-label="Weekly trend" />

// Object array
<SparkLineChart
  data={[{ day: 'Mon', value: 42 }, { day: 'Tue', value: 58 }]}
  dataKey="value"
  height={48}
  aria-label="Daily sessions"
/>

// Custom color
<SparkBarChart data={[88, 72, 95, 60, 48]} color="var(--gnome-red-3, #e01b24)" height={48} aria-label="Error rate" />
```

### Shared props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `number[] \| Record<string, unknown>[]` | — | Data points |
| `dataKey` | `string` | `"value"` | Key when data is an object array |
| `color` | `string` | accent color | Fill / stroke color |
| `height` | `number` | `40` | Chart height in px |
| `aria-label` | `string` | — | Accessible label (recommended) |

### SparkAreaChart extra props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `gradient` | `boolean` | `true` | Gradient fill from top to bottom |
| `fillOpacity` | `number` | `0.2` | Fill opacity when `gradient` is false |
| `strokeWidth` | `number` | `1.5` | Stroke width |

### SparkBarChart extra props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `barSize` | `number` | auto | Bar width in px |
| `fillOpacity` | `number` | `0.85` | Bar fill opacity |

### Guidelines

- Always pass `aria-label` — sparklines have no visible axis text.
- Set `aria-hidden` on the wrapper when a sibling element already describes the trend.
- Embed inside a `Card` or `StatCard` with a metric value and trend indicator for full context.
