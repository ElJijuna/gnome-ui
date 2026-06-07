Scatter and bubble chart for visualizing correlation between two numeric variables.

Each series has its own `data` array with `x` and `y` keys. Add a `zKey` to encode a third dimension as bubble size.

```tsx
import { ScatterChart } from '@gnome-ui/charts';

<ScatterChart
  series={[
    {
      name: 'Product A',
      data: [
        { x: 10, y: 30 },
        { x: 40, y: 80 },
        { x: 70, y: 50 },
      ],
    },
  ]}
/>
```

### Bubble chart

Pass `zKey` on the series and a `bubbleRange` to scale bubble area:

```tsx
<ScatterChart
  series={[
    {
      name: 'Sales',
      data: [
        { x: 10, y: 30, z: 200 },
        { x: 40, y: 80, z: 800 },
      ],
      zKey: 'z',
    },
  ]}
  bubbleRange={[40, 600]}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `series` | `ScatterChartSeries[]` | — | One entry per scatter group |
| `xLabel` | `string` | `"x"` | Tooltip label for the x axis |
| `yLabel` | `string` | `"y"` | Tooltip label for the y axis |
| `height` | `number` | `300` | Container height in px |
| `showGrid` | `boolean` | `true` | Show background grid |
| `showLegend` | `boolean` | `false` | Show series legend |
| `bubbleRange` | `[number, number]` | `[40, 400]` | Min/max bubble area (px²) |
| `className` | `string` | — | Extra CSS class |

### `ScatterChartSeries`

| Field | Type | Description |
|-------|------|-------------|
| `data` | `Record<string, unknown>[]` | Points with at least `x` and `y` |
| `name` | `string` | Series label |
| `color` | `string` | Dot fill color |
| `zKey` | `string` | Key to use for bubble size (`ZAxis`) |
