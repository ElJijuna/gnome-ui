Mixed chart combining bars, lines, and areas on shared axes.

Each series declares its `type` — `"bar"`, `"line"`, or `"area"` — and all share the same x axis and y scale.

```tsx
import { ComposedChart } from '@gnome-ui/charts';

const data = [
  { month: 'Jan', revenue: 4200, expenses: 2400, profit: 1800 },
  { month: 'Feb', revenue: 3800, expenses: 2200, profit: 1600 },
  { month: 'Mar', revenue: 5100, expenses: 2600, profit: 2500 },
];

<ComposedChart
  data={data}
  xAxisKey="month"
  showLegend
  series={[
    { dataKey: 'revenue', type: 'bar', name: 'Revenue' },
    { dataKey: 'expenses', type: 'area', name: 'Expenses' },
    { dataKey: 'profit', type: 'line', name: 'Profit' },
  ]}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `Record<string, unknown>[]` | — | Data rows |
| `series` | `ComposedChartSeries[]` | — | Series definitions |
| `xAxisKey` | `string` | `"name"` | Key used for the x axis |
| `height` | `number` | `300` | Container height in px |
| `showGrid` | `boolean` | `true` | Show background grid |
| `showLegend` | `boolean` | `false` | Show series legend |
| `className` | `string` | — | Extra CSS class |

### `ComposedChartSeries`

| Field | Type | Description |
|-------|------|-------------|
| `dataKey` | `string` | Key in each data row |
| `type` | `"bar" \| "line" \| "area"` | Visual encoding |
| `name` | `string` | Legend / tooltip label |
| `color` | `string` | Override series color |

### Guidelines

- Use `bar` for discrete categorical volumes, `line` for trends, `area` to show range/fill.
- Mixing too many series types adds visual noise — prefer 2–3 series maximum.
