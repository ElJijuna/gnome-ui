Minimal inline bullet-chart track for a single measure against qualitative bands and an optional
target — the "spark" (small, no label, no value text) member of the bullet-chart family, for
embedding in a table cell, list row, or card where `BulletChart`'s label/value would be too much.

```tsx
import { SparkBulletChart } from '@gnome-ui/react-native-charts';

<SparkBulletChart value={72} target={90} aria-label="Revenue" />
```

With qualitative range bands:

```tsx
<SparkBulletChart
  value={82}
  max={100}
  color="#e01b24"
  ranges={[
    { value: 60, color: '#2ec27e' },
    { value: 85, color: '#f6d32d' },
    { value: 100, color: '#e01b24' },
  ]}
  aria-label="CPU usage"
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | — | Performance measure — the current value |
| `target` | `number` | — | Comparative measure, rendered as a perpendicular tick |
| `min` | `number` | `0` | Range minimum |
| `max` | `number` | `100` | Range maximum |
| `ranges` | `SparkBulletChartRange[]` | Neutral grayscale ramp | Ascending upper bounds for qualitative bands (`value`, `color?`) |
| `color` | `string` | Theme accent color | Performance bar color |
| `height` | `number` | `16` | Track height in dp |
| `aria-label` | `string` | — | Accessibility label; the track is hidden from the accessibility tree entirely when omitted |

### Guidelines

- Use for a single at-a-glance KPI embedded inline (a table cell, list row, dashboard tile) — for
  a standalone measure with a visible label/value, use `BulletChart` instead.
- `ranges` upper bounds should be ascending — the first band runs from `min` to the first range's
  `value`, each subsequent band from the previous range's `value` to its own.
- Always pass `aria-label` when the track conveys information a screen reader user needs — an
  unlabeled track is treated as purely decorative and skipped entirely.
