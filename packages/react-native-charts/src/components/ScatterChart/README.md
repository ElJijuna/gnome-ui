Scatter/bubble chart for correlation between two numeric variables. Unlike every other chart in
this package, each series here owns its own independent list of points — its own `xKey`/`yKey`/
`zKey` field names — rather than reading from a shared `data` array.

```tsx
import { ScatterChart } from '@gnome-ui/react-native-charts';

<ScatterChart
  series={[
    { data: [{ hours: 1, score: 40 }, { hours: 2, score: 55 }], xKey: 'hours', yKey: 'score' },
  ]}
/>
```

A third dimension as bubble size, via `zKey`:

```tsx
<ScatterChart
  series={[
    {
      data: [{ revenue: 20, growth: 30, employees: 50 }],
      xKey: 'revenue',
      yKey: 'growth',
      zKey: 'employees',
    },
  ]}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `series` | `ScatterChartSeries[]` | — | One entry per series (`data`, `name?`, `color?`, `xKey?`, `yKey?`, `zKey?`) |
| `height` | `number` | `300` | Chart height in dp |
| `showGrid` | `boolean` | `true` | Show grid lines |
| `showLegend` | `boolean` | `false` | Show series legend |
| `legendPosition` | `"top" \| "bottom" \| "left" \| "right"` | `"bottom"` | Position of the legend when `showLegend` is true |
| `bubbleRange` | `[number, number]` | `[40, 400]` | Bubble area range in px² (low to high) for series using `zKey` |
| `aria-label` | `string` | `"Scatter chart"` | Accessibility label for the chart |

`ScatterChartSeries.xKey`/`yKey` default to `"x"`/`"y"` when omitted. `zKey` has no default — a
series without it renders fixed-size dots.

### Guidelines

- Use for showing correlation between two (or three, with `zKey`) numeric variables across
  individual data points — not for categorical or time-series data.
- Pass `color` per series to override the default GNOME palette.
- `bubbleRange` is shared across every series using `zKey` in the same chart, so bubble sizes stay
  comparable to each other.
