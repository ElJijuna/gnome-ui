Radial (semicircle) gauge for a single value against a min/max range. Draws a gray background
track for the full range and a colored arc for the current value, with the value and an optional
caption centered underneath.

```tsx
import { GaugeChart } from '@gnome-ui/react-native-charts';

<GaugeChart value={62} label="CPU" />
```

Ascending value/color status bands (ignored when `color` is set):

```tsx
<GaugeChart
  value={82}
  label="Disk"
  thresholds={[
    { value: 0, color: '#2ec27e' },
    { value: 50, color: '#f6d32d' },
    { value: 80, color: '#e01b24' },
  ]}
/>
```

Custom range and value formatting:

```tsx
<GaugeChart
  value={620}
  min={0}
  max={1000}
  label="Requests/min"
  valueFormatter={(v) => `${v}`}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | — | Current value, clamped to `[min, max]` for the arc's sweep |
| `min` | `number` | `0` | Range minimum |
| `max` | `number` | `100` | Range maximum |
| `height` | `number` | `220` | Chart height in dp |
| `color` | `string` | Theme accent color | Explicit arc color, overrides `thresholds` |
| `thresholds` | `GaugeChartThreshold[]` | — | Ascending value/color status bands (`value`, `color`) |
| `showValue` | `boolean` | `true` | Draw the value (and `label`, if given) centered under the arc |
| `valueFormatter` | `(value: number) => string` | Locale-aware number formatting | Custom formatting for the displayed value |
| `label` | `string` | — | Caption rendered under the value |
| `aria-label` | `string` | Auto-generated from `label`/`value` | Accessibility label for the chart |

### Guidelines

- Use for a single at-a-glance metric against a known range (CPU/disk usage, a score, progress
  toward a target) — for multiple values or a time series, use `LineChart`/`BarChart` instead.
- `thresholds` picks the color of the *last* band whose `value` is `<=` the current value — sort
  ascending (`{ value: 0, color }` as the lowest band) for the conventional status-color look.
- There's no legend — a single-value gauge has nothing to key against.
