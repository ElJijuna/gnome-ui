Floating-bar chart built on Recharts for the cumulative effect of a sequence of increases and decreases — revenue bridges, budget breakdowns, cohort attrition. Each bar starts where the previous one ended; mark `isTotal` on start/end/subtotal bars to anchor them to zero instead.

```tsx
import { WaterfallChart } from '@gnome-ui/charts';

<WaterfallChart
  data={[
    { label: 'Starting revenue', value: 42000, isTotal: true },
    { label: 'New sales', value: 12000 },
    { label: 'Upsells', value: 4000 },
    { label: 'Churn', value: -6000 },
    { label: 'Refunds', value: -1500 },
    { label: 'Ending revenue', value: 50500, isTotal: true },
  ]}
/>
```

### Colors and value labels

```tsx
<WaterfallChart
  data={data}
  increaseColor="var(--gnome-green-4, #2ec27e)"
  decreaseColor="var(--gnome-red-3, #e01b24)"
  totalColor="var(--gnome-purple-3, #9141ac)"
  showValues
  valueFormatter={(v) => `$${v.toLocaleString()}`}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `WaterfallChartDataItem[]` | — | `{ label: string; value: number; isTotal?: boolean }[]`. Non-total bars float from the running cumulative total; `isTotal` bars are anchored to zero |
| `height` | `number` | `300` | Chart height in px |
| `increaseColor` | `string` | green | Color for positive delta bars |
| `decreaseColor` | `string` | red | Color for negative delta bars |
| `totalColor` | `string` | accent color | Color for `isTotal` bars |
| `showGrid` | `boolean` | `true` | Show the horizontal grid |
| `showValues` | `boolean` | `false` | Show the signed delta (or absolute value for totals) above each bar |
| `valueFormatter` | `(value: number) => string` | locale-aware | Custom formatter for values and axis ticks |
| `aria-label` | `string` | auto | Accessible label for the chart |
| `className` | `string` | — | Extra CSS class on the wrapper |

### Guidelines

- Put `isTotal: true` on the first and last bars (and any subtotal checkpoints) so they read as absolute values instead of floating deltas.
- The running total resets to a bar's own value whenever `isTotal` is set — the next non-total bar floats from that new baseline.
- There is no spark/compact variant: condensing multiple labeled steps into a card-sized sparkline loses the per-step readability that makes a waterfall useful in the first place. For a single value-vs-target summary at that scale, use `SparkBulletChart` or `SparkGaugeChart` instead.
