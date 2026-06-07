Word/tag cloud that scales each term's font size proportionally to its numeric value.

Font size is linearly interpolated between `minFontSize` and `maxFontSize`. Items with equal values render at the midpoint. Colors cycle through the GNOME chart palette unless overridden per item.

```tsx
import { CloudChart } from '@gnome-ui/charts';

<CloudChart
  data={[
    { text: 'TypeScript', value: 95 },
    { text: 'React', value: 88 },
    { text: 'Node.js', value: 76 },
    { text: 'CSS', value: 70 },
  ]}
/>
```

### Custom colors

```tsx
<CloudChart
  data={[
    { text: 'Accessibility', value: 90, color: 'var(--gnome-blue-3, #3584e4)' },
    { text: 'Performance', value: 75, color: 'var(--gnome-green-4, #2ec27e)' },
  ]}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `CloudChartDataItem[]` | — | `{ text: string; value: number; color?: string }[]` |
| `height` | `number` | `300` | Minimum container height in px |
| `minFontSize` | `number` | `12` | Font size for the lowest-value term |
| `maxFontSize` | `number` | `48` | Font size for the highest-value term |

### Guidelines

- Use for keyword frequency, tag weights, or skill matrices.
- Narrow the font range (`minFontSize=14, maxFontSize=28`) for more uniform visual weight.
- The cloud wraps naturally — the container grows vertically if terms overflow.
