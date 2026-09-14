Mixes `bar`/`line`/`area` series that share one `data` array and x-axis — for example, revenue
bars with a target line overlaid on top.

```tsx
import { ComposedChart } from '@gnome-ui/react-native-charts';

<ComposedChart
  data={[
    { month: 'Jan', revenue: 4000, target: 3800 },
    { month: 'Feb', revenue: 4500, target: 4000 },
  ]}
  series={[
    { dataKey: 'revenue', type: 'bar', name: 'Revenue' },
    { dataKey: 'target', type: 'line', name: 'Target' },
  ]}
  xAxisKey="month"
/>
```

All three types combined:

```tsx
<ComposedChart
  data={data}
  series={[
    { dataKey: 'revenue', type: 'bar', name: 'Revenue' },
    { dataKey: 'expenses', type: 'area', name: 'Expenses' },
    { dataKey: 'target', type: 'line', name: 'Target' },
  ]}
  xAxisKey="month"
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `RawData[]` | — | Rows shared across every series |
| `series` | `ComposedChartSeries[]` | — | One entry per series (`dataKey`, `type`, `name?`, `color?`) |
| `xAxisKey` | `string` | `"name"` | Field in `data` used for the x-axis |
| `height` | `number` | `300` | Chart height in dp |
| `showGrid` | `boolean` | `true` | Show grid lines |
| `showLegend` | `boolean` | `false` | Show series legend |
| `legendPosition` | `"top" \| "bottom" \| "left" \| "right"` | `"bottom"` | Position of the legend when `showLegend` is true |
| `aria-label` | `string` | Auto-generated from series names | Accessibility label for the chart |

`ComposedChartSeries.type` is one of `"bar"`, `"line"`, or `"area"`.

### Guidelines

- All series share one y-axis — keep every series' values within roughly the same order of
  magnitude, or a series with a much smaller range (e.g. a percentage next to raw revenue) will
  render as a barely-visible sliver near the axis. There's no per-series secondary axis, matching
  the web version's own single `YAxis`.
- Bar-type series always render first (as a single clustered group), then area-type, then
  line-type — this is fixed regardless of each series' position in the `series` array, since
  grouping bars together is required to compute their width/offset correctly.
- Pass `color` per series to override the default GNOME palette.
