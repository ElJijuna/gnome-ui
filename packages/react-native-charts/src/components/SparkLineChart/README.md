Minimal inline line chart — no axes, no grid, no legend, no tooltip. Designed to be embedded
inside Cards, table cells, list items, or any layout component.

Accepts `data: number[]` directly, or `Record<string, number>[]` with a `dataKey`.

```tsx
import { SparkLineChart } from '@gnome-ui/react-native-charts';

<SparkLineChart data={[42, 58, 35, 72, 88, 93]} height={40} aria-label="Weekly trend" />
```

Multiple series on the same chart:

```tsx
<SparkLineChart
  data={[
    { sent: 42, received: 18 },
    { sent: 58, received: 24 },
  ]}
  series={[{ key: 'sent' }, { key: 'received', color: '#e01b24' }]}
  aria-label="Sent vs received"
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `number[] \| Record<string, number>[]` | — | Plain values, or objects keyed by `dataKey`/`series[].key` |
| `dataKey` | `string` | `"value"` | Key to plot when `data` is an array of objects. Ignored when `series` is provided |
| `color` | `string` | active accent color | Stroke color. Ignored when `series` is provided |
| `series` | `SparkSeries[]` | — | Multiple series (`key`, `color?`) to render on the same chart. `data` must be an array of objects containing every series key |
| `height` | `number` | `40` | Chart height in dp |
| `strokeWidth` | `number` | `1.5` | Line stroke width |
| `aria-label` | `string` | — | Accessibility label. When omitted, the chart is hidden from the accessibility tree entirely (it's decorative) |

### Guidelines

- Give the wrapping element an explicit width — this component fills whatever space it's given,
  the same way the chart primitives it's built on do.
- For a value-vs-target readout instead of a trend line, prefer `SparkBulletChart`; for a compact
  progress ring, `SparkGaugeChart`.
