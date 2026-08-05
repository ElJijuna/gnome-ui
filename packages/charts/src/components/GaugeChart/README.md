Single-value speedometer gauge built on Recharts. Renders a semicircular arc between `min` and `max`, with the current value shown as a label at its center — for KPI dashboards, alongside `StatCard` from `@gnome-ui/layout`.

```tsx
import { GaugeChart } from '@gnome-ui/charts';

<GaugeChart value={72} label="CPU" />
```

### Status thresholds

Pass ascending `{ value, color }` bands to color the arc based on where the current value falls (e.g. green/yellow/red). Ignored when `color` is set explicitly.

```tsx
<GaugeChart
  value={90}
  label="Disk usage"
  thresholds={[
    { value: 0, color: 'var(--gnome-green-4, #2ec27e)' },
    { value: 60, color: 'var(--gnome-yellow-5, #e5a50a)' },
    { value: 85, color: 'var(--gnome-red-3, #e01b24)' },
  ]}
/>
```

### Custom range and formatting

```tsx
<GaugeChart
  value={4200}
  min={0}
  max={5000}
  label="Revenue"
  valueFormatter={(v) => `$${v.toLocaleString()}`}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | — | Current value. Shown as-is even when it exceeds `min`/`max`; the arc itself is clamped to the range |
| `min` | `number` | `0` | Minimum of the gauge range |
| `max` | `number` | `100` | Maximum of the gauge range |
| `height` | `number` | `220` | Chart height in px |
| `color` | `string` | — | Explicit arc color; overrides `thresholds` |
| `thresholds` | `{ value, color }[]` | — | Ascending value/color bands; the arc uses the color of the highest band `<= value` |
| `showValue` | `boolean` | `true` | Show the numeric value and `label` centered on the gauge |
| `valueFormatter` | `(value: number) => string` | locale-aware | Custom formatter for the displayed value |
| `label` | `string` | — | Caption rendered under the value |
| `aria-label` | `string` | auto | Accessible label for the chart |
| `className` | `string` | — | Extra CSS class on the wrapper |

### Guidelines

- Use `thresholds` for status-style gauges (capacity, health scores) instead of a single `color`, so the arc communicates severity at a glance.
- Values are not required to be percentages — set `min`/`max` to match the metric's real range.
