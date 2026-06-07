Area chart built on Recharts with GNOME design tokens, supporting stacked areas and gradient fills.

Each series renders as a filled area beneath a line. Enable `gradient` for a top-to-bottom opacity fade, and `stacked` to accumulate series vertically.

```tsx
import { AreaChart } from '@gnome-ui/charts';

<AreaChart
  data={[
    { week: 'W1', downloads: 320, installs: 210 },
    { week: 'W2', downloads: 480, installs: 310 },
  ]}
  series={[
    { dataKey: 'downloads', name: 'Downloads' },
    { dataKey: 'installs', name: 'Installs' },
  ]}
  xAxisKey="week"
  showLegend
  gradient
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `Record<string, unknown>[]` | — | Array of data points |
| `series` | `AreaChartSeries[]` | — | Series definitions (`dataKey`, `name?`, `color?`) |
| `xAxisKey` | `string` | `"name"` | Key used for the x-axis labels |
| `height` | `number` | `300` | Chart height in px |
| `showGrid` | `boolean` | `true` | Show horizontal grid lines |
| `showLegend` | `boolean` | `false` | Show series legend |
| `stacked` | `boolean` | `false` | Stack areas on top of each other |
| `gradient` | `boolean` | `false` | Apply top-to-bottom gradient fill |

### Guidelines

- Use when the area beneath the line carries meaning (volume, cumulative counts).
- `stacked + gradient` works well for dashboards showing part-to-whole relationships.
- For compact inline use, prefer `SparkAreaChart`.
