Tree map built on Recharts. Displays hierarchical data as nested rectangles; area is proportional to each item's value.

Items with the same `group` share a color. Items without a `group` are colored individually.

```tsx
import { TreeMap } from '@gnome-ui/charts';

// Flat (no grouping)
<TreeMap
  data={[
    { label: 'React', value: 4200 },
    { label: 'Vue', value: 2100 },
    { label: 'Angular', value: 1800 },
  ]}
  height={400}
/>

// Grouped
<TreeMap
  data={[
    { label: 'React', value: 4200, group: 'Frontend' },
    { label: 'Node.js', value: 3800, group: 'Backend' },
    { label: 'Python', value: 5100, group: 'Backend' },
  ]}
  height={400}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `TreeMapDataItem[]` | — | `{ label: string; value: number; group?: string }[]` |
| `height` | `number` | — | Chart height in px |
| `showLabels` | `boolean` | `true` | Show label + value inside each tile |

### Guidelines

- Labels are suppressed automatically on tiles narrower than 40 px or shorter than 24 px.
- Use grouping to cluster related items under a shared color.
- Best for showing relative proportions in a space-efficient way (file sizes, budget breakdowns).
