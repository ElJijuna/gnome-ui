Bar chart built on Recharts with GNOME design tokens for grouped comparisons across categories.

Renders vertical bars with optional grid lines and a legend for multi-series data.

```tsx
import { BarChart } from '@gnome-ui/charts';

<BarChart
  data={[
    { month: 'Jan', users: 420, sessions: 680 },
    { month: 'Feb', users: 380, sessions: 590 },
  ]}
  series={[
    { dataKey: 'users', name: 'Users' },
    { dataKey: 'sessions', name: 'Sessions' },
  ]}
  xAxisKey="month"
  showLegend
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `Record<string, unknown>[]` | — | Array of data points |
| `series` | `BarChartSeries[]` | — | Series definitions (`dataKey`, `name?`, `color?`) |
| `xAxisKey` | `string` | `"name"` | Key used for the x-axis labels |
| `height` | `number` | `300` | Chart height in px |
| `showGrid` | `boolean` | `true` | Show horizontal grid lines |
| `showLegend` | `boolean` | `false` | Show series legend |

### Guidelines

- Use for comparing discrete categories (months, items, groups).
- For compact inline use, prefer `SparkBarChart`.
- Pass `color` in each series to override the default GNOME palette.
