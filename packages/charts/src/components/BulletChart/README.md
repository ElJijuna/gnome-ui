Bullet graph (Stephen Few) built with plain SVG-free HTML — no Recharts. Shows a performance measure against a target and qualitative ranges in a single compact horizontal track, for KPI rows in tables and dashboards where `GaugeChart` takes too much vertical space.

```tsx
import { BulletChart } from '@gnome-ui/charts';

<BulletChart value={72} target={90} label="Revenue" />
```

### Qualitative ranges

Pass ascending `{ value, color? }` upper bounds to render background bands (e.g. poor/satisfactory/good). Colors default to a neutral grayscale ramp when omitted.

```tsx
<BulletChart
  value={72}
  target={90}
  label="CPU"
  ranges={[{ value: 50 }, { value: 80 }, { value: 100 }]}
/>
```

### Custom range and formatting

```tsx
<BulletChart
  value={4200}
  target={5000}
  min={0}
  max={6000}
  label="Revenue"
  valueFormatter={(v) => `$${v.toLocaleString()}`}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | — | Performance measure — the current value |
| `target` | `number` | — | Comparative measure, rendered as a perpendicular tick |
| `min` | `number` | `0` | Minimum of the track range |
| `max` | `number` | `100` | Maximum of the track range |
| `ranges` | `{ value, color? }[]` | — | Ascending upper bounds for qualitative bands; falls back to a neutral grayscale ramp |
| `color` | `string` | accent color | Performance bar color |
| `height` | `number` | `32` | Track height in px |
| `label` | `string` | — | Caption rendered to the left of the track |
| `showValue` | `boolean` | `true` | Show the formatted value (and target, if set) to the right |
| `valueFormatter` | `(value: number) => string` | locale-aware | Custom formatter for the displayed value/target |
| `aria-label` | `string` | auto | Accessible label for the chart |
| `className` | `string` | — | Extra CSS class on the wrapper |

### Guidelines

- Use `ranges` for status-style rows (capacity, SLA compliance) instead of a single flat track, so the bar communicates severity at a glance without needing a legend.
- Prefer `BulletChart` over `GaugeChart` when a target value matters and vertical space is tight — a table row, a list of KPIs stacked in a sidebar.
- Values are not required to be percentages — set `min`/`max` to match the metric's real range.
