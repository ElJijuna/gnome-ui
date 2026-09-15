Compact single-measure KPI indicator (Stephen Few's bullet graph): a qualitative background
ramp (poor/satisfactory/good), a performance bar, and an optional target tick — all in one thin
horizontal track.

```tsx
import { BulletChart } from '@gnome-ui/react-native-charts';

<BulletChart
  label="Revenue"
  value={72}
  target={90}
  ranges={[{ value: 50 }, { value: 75 }, { value: 100 }]}
/>
```

Custom colors:

```tsx
<BulletChart
  label="CPU"
  value={82}
  max={100}
  color="#e01b24"
  ranges={[
    { value: 60, color: '#2ec27e' },
    { value: 85, color: '#f6d32d' },
    { value: 100, color: '#e01b24' },
  ]}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | — | Performance measure — the current value |
| `target` | `number` | — | Comparative measure, rendered as a perpendicular tick |
| `min` | `number` | `0` | Minimum of the scale |
| `max` | `number` | `100` | Maximum of the scale |
| `ranges` | `BulletChartRange[]` | a single neutral band | Ascending upper bounds for qualitative bands (`value`, `color?`) |
| `color` | `string` | theme accent color | Performance bar color |
| `height` | `number` | `32` | Track height in dp |
| `label` | `string` | — | Caption rendered to the left of the track |
| `showValue` | `boolean` | `true` | Show the formatted value (and target) to the right |
| `valueFormatter` | `(value: number) => string` | `Intl.NumberFormat` | Custom value formatting |
| `aria-label` | `string` | built from `label`/`value`/`target` | Accessibility label |

### Guidelines

- Use for a single KPI against qualitative context and an optional target — not for a series over
  time (use `LineChart`/`AreaChart`) or a proportional breakdown (use `BarChart`).
- `ranges` are sorted ascending by `value` regardless of the order given; each band's own lower
  bound is the previous band's `value` (or `min` for the first).
- Falls back to a neutral grayscale ramp (`theme.light2`/`light3`/`light4`) when `ranges` omit
  `color`, matching the web version's default.
