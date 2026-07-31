Dual-thumb slider for selecting a min/max range, following the Adwaita `GtkScale` pattern used by `Slider`.

```tsx
import { useState } from 'react';
import { RangeSlider } from '@gnome-ui/react';

const [range, setRange] = useState<[number, number]>([20, 80]);

<RangeSlider value={range} onChange={setRange} minLabel="Minimum price" maxLabel="Maximum price" />
```

Distinct from `Slider`, which only supports a single value — use `RangeSlider` for range filters (price, date range, etc.) where both bounds are adjustable.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `[number, number]` | — | Current `[lower, upper]` values |
| `onChange` | `(value: [number, number]) => void` | — | Called when either thumb moves |
| `min` | `number` | `0` | Minimum value |
| `max` | `number` | `100` | Maximum value |
| `step` | `number` | `1` | Granularity — arrow keys move by one step, Page Up/Down by 10 steps |
| `minDistance` | `number` | `0` | Minimum gap enforced between the two thumbs |
| `disabled` | `boolean` | `false` | Disables the control |
| `marks` | `Array<{ value: number; label?: string }>` | — | Tick marks along the track, with optional labels |
| `minLabel` | `string` | `'Minimum value'` | Accessible label for the lower-bound thumb |
| `maxLabel` | `string` | `'Maximum value'` | Accessible label for the upper-bound thumb |

### Guidelines

- Always pass descriptive `minLabel`/`maxLabel` (e.g. `"Minimum price"`/`"Maximum price"`) when more than one range slider appears on the same page — the defaults are generic and won't disambiguate them for screen reader users.
- Clicking the track jumps the **nearest** thumb to that position; dragging a thumb directly always moves that specific thumb, even if the pointer crosses over the other one.
- Use `minDistance` to keep the two thumbs from meeting — e.g. a date range that must span at least one day.
