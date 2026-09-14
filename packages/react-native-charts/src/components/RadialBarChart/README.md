Concentric arc bars — a half-circle "gauge" of stacked progress rings, one per data item — hand-built
directly on `@shopify/react-native-skia`'s arc support; Victory Native has no radial-bar primitive
to compose.

Each item renders as its own ring, sweeping proportionally to its value against the largest value
in `data`.

```tsx
import { RadialBarChart } from '@gnome-ui/react-native-charts';

<RadialBarChart
  data={[
    { label: 'CPU', value: 62 },
    { label: 'Memory', value: 80 },
    { label: 'Disk', value: 35 },
  ]}
  showLabels
  showLegend
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `RadialBarChartDataItem[]` | — | Rings (`label`, `value`, `color?`) |
| `height` | `number` | `300` | Chart height in dp |
| `innerRadius` | `number \| string` | `0.2` | Radius of the innermost ring, as a fraction (`0`-`1`) or percent string (`"20%"`) of the outer radius |
| `showLabels` | `boolean` | `false` | Draw each ring's label centered within its band |
| `showLegend` | `boolean` | `false` | Show a legend entry per ring |
| `legendPosition` | `"top" \| "bottom" \| "left" \| "right"` | `"bottom"` | Position of the legend when `showLegend` is true |
| `aria-label` | `string` | auto | Accessibility label for the chart (`accessibilityLabel`) |

### Guidelines

- Use for a small number (2-5) of independent progress-style metrics compared at a glance — beyond
  that, the rings get too thin to read.
- All rings share one 0-to-max scale computed from `data`, not a fixed 0-100% — if your values are
  already percentages, that's the same thing, but for other units check the largest value is a
  sensible visual ceiling.
- Pass `color` per item to override the default GNOME palette.
