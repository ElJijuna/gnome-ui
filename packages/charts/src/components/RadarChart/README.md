Radar (spider) chart built on Recharts for comparing multiple attributes across one or more subjects.

Each axis corresponds to a dimension in the data; each series traces a polygon across those axes. Enable `filled` to shade the polygon interior.

```tsx
import { RadarChart } from '@gnome-ui/charts';

<RadarChart
  data={[
    { skill: 'TypeScript', alice: 90, bob: 70 },
    { skill: 'React', alice: 85, bob: 80 },
    { skill: 'CSS', alice: 60, bob: 75 },
  ]}
  series={[
    { dataKey: 'alice', name: 'Alice' },
    { dataKey: 'bob', name: 'Bob' },
  ]}
  angleKey="skill"
  filled
  showLegend
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `Record<string, unknown>[]` | — | Array of data points |
| `series` | `RadarChartSeries[]` | — | Series definitions (`dataKey`, `name?`, `color?`) |
| `angleKey` | `string` | `"name"` | Key for the angular dimension labels |
| `height` | `number` | `400` | Chart height in px |
| `filled` | `boolean` | `false` | Fill the polygon with a semi-transparent color |
| `showLegend` | `boolean` | `false` | Show series legend |

### Guidelines

- Best with 3–8 axes. Too many axes make labels unreadable.
- Use `filled` for single-subject charts; unfilled for multi-subject comparisons to avoid overlap.
