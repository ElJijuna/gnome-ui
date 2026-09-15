Proportional-area rectangles for hierarchical/part-of-whole data — bigger value, bigger tile. Laid
out with a hand-rolled squarified treemap algorithm (Bruls/Huizing/van Wijk, the same one Recharts'
own `Treemap` uses internally), since neither Victory Native nor Skia ship a treemap primitive.

```tsx
import { TreeMap } from '@gnome-ui/react-native-charts';

<TreeMap
  data={[
    { label: 'Chrome', value: 6500, group: 'Desktop' },
    { label: 'Safari', value: 2100, group: 'Desktop' },
    { label: 'Firefox', value: 900, group: 'Desktop' },
    { label: 'Chrome Mobile', value: 4800, group: 'Mobile' },
    { label: 'Safari Mobile', value: 3200, group: 'Mobile' },
  ]}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `TreeMapDataItem[]` | — | One entry per tile (`label`, `value`, `group?`) |
| `height` | `number` | `400` | Chart height in dp |
| `showLabels` | `boolean` | `true` | Draw each tile's name (and value, on taller tiles) centered within it |
| `aria-label` | `string` | `"Treemap"` | Accessibility label for the chart |

### Guidelines

- Tiles are colored by `group` when given, falling back to `label` — items sharing a `group` share
  a color, matching the web version's `buildColorMap`.
- Tiles are laid out sorted by `value` descending regardless of `data`'s own order — squarified
  treemaps produce noticeably worse (thin-sliver) aspect ratios on unsorted input, so this port
  always sorts first rather than exposing a `sort` toggle.
- A tile only draws its name once it's at least 40×24dp, and only adds a second line for its
  formatted value once it's taller than 44dp — same size thresholds as the web version, so very
  small tiles stay unlabeled rather than overflowing.
