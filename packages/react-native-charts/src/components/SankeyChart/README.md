Flow diagram for multi-stage funnels or allocations — nodes as vertical bars, links as
value-proportional tapered curves between them. Laid out with a full d3-sankey-style algorithm
(column assignment by longest-path depth, node height proportional to throughput, then several
passes of iterative relaxation to straighten links and reduce crossings), since neither Victory
Native nor Skia ship a Sankey primitive.

```tsx
import { SankeyChart } from '@gnome-ui/react-native-charts';

<SankeyChart
  nodes={[
    { name: 'Organic', color: '#2ec27e' },
    { name: 'Paid', color: '#ff7800' },
    { name: 'Referral', color: '#9141ac' },
    { name: 'Trial' },
    { name: 'Converted' },
    { name: 'Churned' },
  ]}
  links={[
    { source: 'Organic', target: 'Trial', value: 420 },
    { source: 'Paid', target: 'Trial', value: 260 },
    { source: 'Referral', target: 'Trial', value: 140 },
    { source: 'Trial', target: 'Converted', value: 480 },
    { source: 'Trial', target: 'Churned', value: 340 },
  ]}
  showValues
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `nodes` | `SankeyChartNode[]` | — | One entry per node (`name`, `color?`) |
| `links` | `SankeyChartLink[]` | — | Flows between nodes (`source`/`target` node names, `value`) |
| `height` | `number` | `400` | Chart height in dp |
| `nodeWidth` | `number` | `12` | Width of each node's bar in dp |
| `nodePadding` | `number` | `24` | Minimum vertical gap between nodes in the same column |
| `showValues` | `boolean` | `false` | Append each node's formatted throughput to its label |
| `valueFormatter` | `(value: number) => string` | `Intl.NumberFormat` | Custom value formatting |
| `aria-label` | `string` | `"Sankey chart with N nodes and M flows"` | Accessibility label |

### Guidelines

- A node's own color, given via `color`, tints every link flowing *out* of it — matching the web
  version's convention that a flow is colored by where it came from, not where it's going.
- Nodes are colored by the GNOME palette in `nodes` array order when no `color` is given.
- `nodes`/`links` must describe a DAG (no flow cycles) — same assumption the web version's
  underlying Recharts `Sankey` (and d3-sankey, which it wraps) makes. A `links` entry naming a
  `source`/`target` not present in `nodes` is silently skipped rather than throwing.
- A node's label draws to its *right* if it has any outgoing links, or to its *left* if it's a
  terminal/sink node (no outgoing links) — this can visually overlap a dense diagram's own links,
  the same tradeoff the web version makes.
