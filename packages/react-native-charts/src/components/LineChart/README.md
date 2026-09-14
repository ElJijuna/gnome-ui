Line chart built on Victory Native (Skia) with GNOME design tokens for axes, grid, dots, and legend.

Supports multiple series rendered as colored lines with point markers, an optional grid, and a
legend on any of the four sides.

```tsx
import { LineChart } from '@gnome-ui/react-native-charts';

<LineChart
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
/>
```

### Props

`LineChart` is generic over the shape of `data` (`RawData`) — TypeScript infers it from the `data`
array you pass, and constrains `series[].dataKey`/`xAxisKey` to that shape's own keys.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `RawData[]` | — | Array of data points |
| `series` | `LineChartSeries[]` | — | Series definitions (`dataKey`, `name?`, `color?`) |
| `xAxisKey` | `keyof RawData` | `"name"` | Key used for the x-axis labels |
| `height` | `number` | `300` | Chart height in dp |
| `showGrid` | `boolean` | `true` | Show grid lines |
| `showLegend` | `boolean` | `false` | Show series legend |
| `legendPosition` | `"top" \| "bottom" \| "left" \| "right"` | `"bottom"` | Position of the legend when `showLegend` is true |
| `aria-label` | `string` | auto | Accessibility label for the chart (`accessibilityLabel`) |

### Guidelines

- Use for continuous data over time (metrics, trends, telemetry).
- Pass `color` in each series to override the default GNOME palette.
- No interactive tap tooltip yet — see the package [README](../../../README.md#design-notes) for why.
