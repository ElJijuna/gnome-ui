Line chart built on Recharts with GNOME design tokens for axes, grid, and tooltips.

Supports multiple series rendered as colored lines, an optional horizontal grid, and a legend.

```tsx
import { LineChart } from '@gnome-ui/charts';

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

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `Record<string, unknown>[]` | — | Array of data points |
| `series` | `LineChartSeries[]` | — | Series definitions (`dataKey`, `name?`, `color?`) |
| `xAxisKey` | `string` | `"name"` | Key used for the x-axis labels |
| `height` | `number` | `300` | Chart height in px |
| `showGrid` | `boolean` | `true` | Show horizontal grid lines |
| `showLegend` | `boolean` | `false` | Show series legend |

### Guidelines

- Use for continuous data over time (metrics, trends, telemetry).
- Pass `color` in each series to override the default GNOME palette.
- For compact inline use, prefer `SparkLineChart`.
