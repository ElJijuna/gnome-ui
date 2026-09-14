Area chart built on Victory Native (Skia) with GNOME design tokens for axes, grid, and legend.

Supports multiple series (overlapping or stacked), a flat tint or a gradient-to-transparent fill,
and a legend on any of the four sides. Each non-stacked series draws its own stroke line on top of
the fill, matching the web version's look.

```tsx
import { AreaChart } from '@gnome-ui/react-native-charts';

<AreaChart
  data={[
    { day: 'Mon', cpu: 42, memory: 68 },
    { day: 'Tue', cpu: 58, memory: 72 },
  ]}
  series={[
    { dataKey: 'cpu', name: 'CPU %' },
    { dataKey: 'memory', name: 'Memory %' },
  ]}
  xAxisKey="day"
  showLegend
  gradient
/>
```

### Props

`AreaChart` is generic over the shape of `data` (`RawData`) — TypeScript infers it from the `data`
array you pass, and constrains `series[].dataKey`/`xAxisKey` to that shape's own keys.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `RawData[]` | — | Array of data points |
| `series` | `AreaChartSeries[]` | — | Series definitions (`dataKey`, `name?`, `color?`) |
| `xAxisKey` | `keyof RawData` | `"name"` | Key used for the x-axis labels |
| `height` | `number` | `300` | Chart height in dp |
| `showGrid` | `boolean` | `true` | Show grid lines |
| `showLegend` | `boolean` | `false` | Show series legend |
| `legendPosition` | `"top" \| "bottom" \| "left" \| "right"` | `"bottom"` | Position of the legend when `showLegend` is true |
| `stacked` | `boolean` | `false` | Stack series cumulatively instead of overlapping |
| `gradient` | `boolean` | `false` | Fade the fill from the series color to transparent instead of a flat 15%-opacity tint |
| `aria-label` | `string` | auto | Accessibility label for the chart (`accessibilityLabel`) |

### Guidelines

- Use for continuous data over time where the filled area itself carries meaning (volume,
  cumulative totals) — for a plain trend line, prefer `LineChart`.
- `stacked` is meant for series that sum to a meaningful whole (e.g. traffic by channel); don't
  combine it with unrelated series scales.
- Pass `color` in each series to override the default GNOME palette.
