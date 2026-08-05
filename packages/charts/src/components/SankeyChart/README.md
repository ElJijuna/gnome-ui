Flow diagram built on Recharts. Renders named nodes as columns of rectangles connected by curved, proportionally-sized links — for multi-stage funnels, user journeys, or any flow between categories.

```tsx
import { SankeyChart } from '@gnome-ui/charts';

<SankeyChart
  nodes={[
    { name: 'Visitors' },
    { name: 'Signups' },
    { name: 'Customers' },
    { name: 'Churn' },
  ]}
  links={[
    { source: 'Visitors', target: 'Signups', value: 1000 },
    { source: 'Signups', target: 'Customers', value: 600 },
    { source: 'Signups', target: 'Churn', value: 400 },
  ]}
/>
```

Node labels are placed to the right of each node, except for terminal nodes (those with no outgoing links), whose labels are placed to the left — so the last column reads inward rather than off the edge of the chart.

### Node colors and values

Each node cycles through `GNOME_CHART_PALETTE` unless given an explicit `color`. Links inherit their source node's color at reduced opacity. Enable `showValues` to append the formatted value to each node's label.

```tsx
<SankeyChart
  nodes={[
    { name: 'Organic', color: 'var(--gnome-green-4, #2ec27e)' },
    { name: 'Paid', color: 'var(--gnome-orange-3, #ff7800)' },
    { name: 'Converted' },
  ]}
  links={[
    { source: 'Organic', target: 'Converted', value: 320 },
    { source: 'Paid', target: 'Converted', value: 180 },
  ]}
  showValues
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `nodes` | `SankeyChartNode[]` | — | `{ name: string; color?: string }[]` |
| `links` | `SankeyChartLink[]` | — | `{ source: string; target: string; value: number }[]`, referencing node names |
| `height` | `number` | `400` | Chart height in px |
| `nodeWidth` | `number` | `12` | Node rectangle thickness in px |
| `nodePadding` | `number` | `24` | Vertical gap between stacked nodes in the same column |
| `showValues` | `boolean` | `false` | Append the formatted value to each node label |
| `valueFormatter` | `(value: number) => string` | locale-aware | Custom formatter for labels and the tooltip |
| `aria-label` | `string` | auto | Accessible label for the chart |
| `className` | `string` | — | Extra CSS class on the wrapper |

### Guidelines

- Keep node names short — long labels can overlap the next column when a diagram has many stages.
- `source`/`target` reference node `name`s directly; there's no need to track array indices.
