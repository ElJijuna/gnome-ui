Funnel visualization for conversion rates and sales pipelines.

Each item in `data` represents one stage. Values are rendered as trapezoid segments from largest to smallest.

```tsx
import { FunnelChart } from '@gnome-ui/charts';

<FunnelChart
  data={[
    { name: 'Visits', value: 5000 },
    { name: 'Leads', value: 2400 },
    { name: 'Prospects', value: 1398 },
    { name: 'Customers', value: 980 },
  ]}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `FunnelChartDataItem[]` | — | Funnel stages, top to bottom |
| `height` | `number` | `300` | Container height in px |
| `showLabels` | `boolean` | `true` | Show stage name labels inside segments |
| `className` | `string` | — | Extra CSS class |

### `FunnelChartDataItem`

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | Stage label |
| `value` | `number` | Stage count / amount |
| `color` | `string` | Override segment color |

### Guidelines

- Order stages from largest (top) to smallest (bottom).
- Use `showLabels={false}` and rely on the tooltip when segment names are long.
