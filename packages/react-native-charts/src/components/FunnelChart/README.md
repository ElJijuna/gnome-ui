Funnel visualization for conversion rates and sales pipelines. Each segment is a trapezoid whose
top width matches its own value's share of the largest value and whose bottom width tapers into
the next segment's share, giving a continuous-taper funnel silhouette (not a stepped "wedding
cake").

```tsx
import { FunnelChart } from '@gnome-ui/react-native-charts';

<FunnelChart
  data={[
    { name: 'Visitors', value: 1000 },
    { name: 'Signups', value: 400 },
    { name: 'Trials', value: 220 },
    { name: 'Purchases', value: 90 },
  ]}
/>
```

Custom per-segment color:

```tsx
<FunnelChart
  data={[
    { name: 'Leads', value: 500, color: '#3584e4' },
    { name: 'Qualified', value: 260, color: '#9141ac' },
    { name: 'Won', value: 80, color: '#2ec27e' },
  ]}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `FunnelChartDataItem[]` | — | One entry per segment (`name`, `value`, `color?`) |
| `height` | `number` | `300` | Chart height in dp |
| `showLabels` | `boolean` | `true` | Draw each segment's name centered within it |
| `aria-label` | `string` | `"Funnel chart"` | Accessibility label for the chart |

There is no `showLegend`/`legendPosition` prop — the web source renders no legend for this chart,
so this port doesn't either.

### Guidelines

- Use for showing progressive drop-off across ordered stages (visitors → signups → purchases,
  leads → qualified → won).
- Pass `color` per item to override the default GNOME palette.
- Segments are drawn in `data` array order, top to bottom — sort your data descending by `value`
  for the conventional funnel look; the component doesn't re-sort it for you.
