Bridge/waterfall chart for visualizing how a sequence of increases and decreases moves a value
from a starting point to an ending point (e.g. a revenue or budget bridge). Each bar floats from
the running total left by the previous bar; `isTotal` bars anchor to zero instead, for
start/end/subtotal columns.

```tsx
import { WaterfallChart } from '@gnome-ui/react-native-charts';

<WaterfallChart
  data={[
    { label: 'Starting revenue', value: 42000, isTotal: true },
    { label: 'New sales', value: 12000 },
    { label: 'Upsells', value: 4000 },
    { label: 'Churn', value: -6000 },
    { label: 'Refunds', value: -1500 },
    { label: 'Ending revenue', value: 50500, isTotal: true },
  ]}
  showValues
/>
```

Custom colors and value formatting:

```tsx
<WaterfallChart
  data={data}
  increaseColor="#3584e4"
  decreaseColor="#ff7800"
  totalColor="#9141ac"
  showValues
  valueFormatter={(v) => `$${v.toLocaleString()}`}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `WaterfallChartDataItem[]` | — | `{ label, value, isTotal? }[]` — see below |
| `height` | `number` | `300` | Chart height in dp |
| `increaseColor` | `string` | Theme green (`green4`) | Color for positive (increase) bars |
| `decreaseColor` | `string` | Theme red (`red3`) | Color for negative (decrease) bars |
| `totalColor` | `string` | Theme accent color | Color for `isTotal` bars |
| `showGrid` | `boolean` | `true` | Show horizontal grid lines |
| `showValues` | `boolean` | `false` | Draw the signed delta (or absolute value for totals) above each bar |
| `valueFormatter` | `(value: number) => string` | Locale-aware number formatting | Custom formatting for axis ticks and displayed values |
| `aria-label` | `string` | Auto-generated from `data` | Accessibility label for the chart |

`WaterfallChartDataItem`:

| Field | Type | Description |
|-------|------|-------------|
| `label` | `string` | Category label shown on the x-axis |
| `value` | `number` | Signed delta from the running total, or the absolute value when `isTotal` |
| `isTotal` | `boolean` | Anchor this bar to zero instead of floating from the running total, and reset the running total to `value` |

### Guidelines

- Use for bridging a starting value to an ending value through a series of named increases/
  decreases (revenue bridges, budget breakdowns, headcount changes) — for a plain category
  comparison with no running total, use `BarChart` instead.
- Mark the first and last bars (and any subtotal) `isTotal: true` — everything in between should
  be a plain signed delta.
- There's no legend — bar color alone (increase/decrease/total) carries the meaning, matching the
  web version.
