Minimal inline area chart — no axes, no grid, no legend, no tooltip. Designed to be embedded
inside Cards, table cells, list items, or any layout component.

Accepts `data: number[]` directly, or `Record<string, number>[]` with a `dataKey`.

```tsx
import { SparkAreaChart } from '@gnome-ui/react-native-charts';

<SparkAreaChart data={[42, 58, 35, 72, 88, 93]} height={40} aria-label="Weekly trend" />
```

Multiple series on the same chart:

```tsx
<SparkAreaChart
  data={[
    { up: 42, down: 18 },
    { up: 58, down: 24 },
  ]}
  series={[{ key: 'up' }, { key: 'down', color: '#e01b24' }]}
  aria-label="Up vs down"
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `number[] \| Record<string, number>[]` | — | Plain values, or objects keyed by `dataKey`/`series[].key` |
| `dataKey` | `string` | `"value"` | Key to plot when `data` is an array of objects. Ignored when `series` is provided |
| `color` | `string` | active accent color | Stroke and fill color. Ignored when `series` is provided |
| `series` | `SparkSeries[]` | — | Multiple series (`key`, `color?`) to render on the same chart. `data` must be an array of objects containing every series key |
| `height` | `number` | `40` | Chart height in dp |
| `strokeWidth` | `number` | `1.5` | Line stroke width |
| `gradient` | `boolean` | `true` | Fade the fill from the series color to transparent instead of a flat tint |
| `fillOpacity` | `number` | `0.2` | Fill opacity when `gradient` is `false` |
| `aria-label` | `string` | — | Accessibility label. When omitted, the chart is hidden from the accessibility tree entirely (it's decorative) |

### Guidelines

- Give the wrapping element an explicit width — this component fills whatever space it's given,
  the same way the chart primitives it's built on do.
- For a plain trend line with no fill, prefer `SparkLineChart`.
