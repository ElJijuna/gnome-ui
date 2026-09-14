Minimal inline bar chart — no axes, no grid, no legend, no tooltip. Designed to be embedded
inside Cards, table cells, list items, or any layout component.

Accepts `data: number[]` directly, or `Record<string, number>[]` with a `dataKey`. Unlike
`SparkLineChart`/`SparkAreaChart`, there's no multi-series mode — one bar per data point only.

```tsx
import { SparkBarChart } from '@gnome-ui/react-native-charts';

<SparkBarChart data={[42, 58, 35, 72, 88, 93]} height={40} aria-label="Weekly trend" />
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `number[] \| Record<string, number>[]` | — | Plain values, or objects keyed by `dataKey` |
| `dataKey` | `string` | `"value"` | Key to plot when `data` is an array of objects |
| `color` | `string` | active accent color | Bar fill color |
| `height` | `number` | `40` | Chart height in dp |
| `barSize` | `number` | auto | Bar width in dp. Auto-sized to fit when omitted |
| `fillOpacity` | `number` | `0.85` | Fill opacity |
| `aria-label` | `string` | — | Accessibility label. When omitted, the chart is hidden from the accessibility tree entirely (it's decorative) |

### Guidelines

- Give the wrapping element an explicit width — this component fills whatever space it's given,
  the same way the chart primitives it's built on do.
- For a continuous trend rather than discrete values, prefer `SparkLineChart` or `SparkAreaChart`.
