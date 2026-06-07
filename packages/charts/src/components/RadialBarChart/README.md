Radial bar chart built on Recharts. Each data item renders as a circular arc, useful for showing multiple metrics as circular progress rings.

Enable `showLabels` to overlay category names on each arc, and `showLegend` for a color key. Increase `innerRadius` to create a donut-like gap at the center.

```tsx
import { RadialBarChart } from '@gnome-ui/charts';

<RadialBarChart
  data={[
    { label: 'CPU', value: 72 },
    { label: 'Memory', value: 58 },
    { label: 'Disk', value: 41 },
  ]}
  showLegend
/>
```

### Custom colors

```tsx
<RadialBarChart
  data={[
    { label: 'Completed', value: 90, color: 'var(--gnome-green-4, #2ec27e)' },
    { label: 'In Progress', value: 60, color: 'var(--gnome-blue-3, #3584e4)' },
    { label: 'Blocked', value: 25, color: 'var(--gnome-red-3, #e01b24)' },
  ]}
  showLabels
  showLegend
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `RadialBarChartDataItem[]` | — | `{ label: string; value: number; color?: string }[]` |
| `height` | `number` | `300` | Chart height in px |
| `innerRadius` | `number \| string` | — | Inner radius of arcs (e.g. `"40%"`) |
| `showLabels` | `boolean` | `false` | Overlay category labels on arcs |
| `showLegend` | `boolean` | `false` | Show color legend |

### Guidelines

- Values are treated as percentages (0–100) — pass normalized numbers.
- Use semantic colors per item for status dashboards (green/red/yellow).
