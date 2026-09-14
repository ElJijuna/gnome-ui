Spider/radar chart for multi-attribute comparisons across subjects, hand-built directly on
`@shopify/react-native-skia` — Victory Native has no radar/spider chart primitive to compose.

Each row in `data` is one axis (e.g. a stat/category); each entry in `series` is one subject being
compared, plotted as a closed polygon across all axes.

```tsx
import { RadarChart } from '@gnome-ui/react-native-charts';

<RadarChart
  data={[
    { stat: 'Speed', car1: 80, car2: 60 },
    { stat: 'Power', car1: 90, car2: 95 },
    { stat: 'Handling', car1: 70, car2: 85 },
  ]}
  series={[
    { dataKey: 'car1', name: 'Car 1' },
    { dataKey: 'car2', name: 'Car 2' },
  ]}
  angleKey="stat"
  filled
  showLegend
/>
```

### Props

`RadarChart` is generic over the shape of `data` (`RawData`) — TypeScript infers it from the `data`
array you pass, and constrains `series[].dataKey`/`angleKey` to that shape's own keys.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `RawData[]` | — | One row per axis |
| `series` | `RadarChartSeries[]` | — | Series definitions (`dataKey`, `name?`, `color?`) |
| `angleKey` | `keyof RawData` | `"name"` | Key used for each axis's label |
| `height` | `number` | `300` | Chart height in dp |
| `filled` | `boolean` | `false` | Fill each series' polygon at 35% opacity instead of outline-only |
| `showLegend` | `boolean` | `false` | Show series legend |
| `legendPosition` | `"top" \| "bottom" \| "left" \| "right"` | `"bottom"` | Position of the legend when `showLegend` is true |
| `aria-label` | `string` | auto | Accessibility label for the chart (`accessibilityLabel`) |

### Guidelines

- Needs at least 3 axes (3 rows of `data`) to form a polygon — with fewer, the chart renders empty.
- All series share one 0-to-max radial scale, computed from the largest value across every series
  and axis — keep series on comparable scales (e.g. all 0-100 percentages).
- Pass `color` in each series to override the default GNOME palette.
