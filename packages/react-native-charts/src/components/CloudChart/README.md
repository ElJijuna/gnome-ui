Word/tag cloud with linear font-size scaling and per-word color support. Unlike every other chart
in this package, this one needs no Skia canvas at all — it's a plain flex-wrapped row of `Text`.

```tsx
import { CloudChart } from '@gnome-ui/react-native-charts';

<CloudChart
  data={[
    { text: 'React', value: 90 },
    { text: 'TypeScript', value: 75 },
    { text: 'GNOME', value: 40 },
  ]}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `CloudChartDataItem[]` | — | Words (`text`, `value`, `color?`) |
| `height` | `number` | `300` | Minimum chart height in dp — grows if the wrapped words need more room |
| `minFontSize` | `number` | `12` | Font size for the lowest `value` |
| `maxFontSize` | `number` | `48` | Font size for the highest `value` |
| `aria-label` | `string` | auto | Accessibility label for the chart (`accessibilityLabel`) |

### Guidelines

- Use for showing relative importance/frequency across a set of terms (tags, keywords, topics).
- Word order in `data` is the render order — there's no packing algorithm, so put your most
  important words first if you want them to land in the visually prominent top rows.
- Pass `color` per item to override the default GNOME palette.
