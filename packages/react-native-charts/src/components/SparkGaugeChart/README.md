Minimal inline circular progress ring for a single value against a min/max range — the "spark"
(small, no text, no legend) member of the gauge family, for embedding in a table cell, list row,
or card where `GaugeChart`'s full size/caption would be too much.

```tsx
import { SparkGaugeChart } from '@gnome-ui/react-native-charts';

<SparkGaugeChart value={62} aria-label="CPU usage" />
```

Ascending value/color status bands (ignored when `color` is set):

```tsx
<SparkGaugeChart
  value={82}
  aria-label="Disk usage"
  thresholds={[
    { value: 0, color: '#2ec27e' },
    { value: 50, color: '#f6d32d' },
    { value: 80, color: '#e01b24' },
  ]}
/>
```

Custom size and range:

```tsx
<SparkGaugeChart value={620} min={0} max={1000} size={28} strokeWidth={3} aria-label="Requests/min" />
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | — | Current value, clamped to `[min, max]` for the ring's sweep |
| `min` | `number` | `0` | Range minimum |
| `max` | `number` | `100` | Range maximum |
| `color` | `string` | Theme accent color | Explicit ring color, overrides `thresholds` |
| `thresholds` | `SparkGaugeChartThreshold[]` | — | Ascending value/color status bands (`value`, `color`) |
| `size` | `number` | `40` | Ring diameter in dp |
| `strokeWidth` | `number` | `4` | Ring stroke width in dp |
| `aria-label` | `string` | — | Accessibility label; the ring is hidden from the accessibility tree entirely when omitted |

### Guidelines

- Use for a single at-a-glance metric embedded inline (a table cell, list row, dashboard tile) —
  for a standalone metric with a visible value/caption, use `GaugeChart` instead.
- `thresholds` picks the color of the *last* band whose `value` is `<=` the current value — sort
  ascending (`{ value: 0, color }` as the lowest band) for the conventional status-color look.
- Always pass `aria-label` when the ring conveys information a screen reader user needs — an
  unlabeled ring is treated as purely decorative and skipped entirely.
