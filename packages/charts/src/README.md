# Spark Charts

Inline sparkline charts for embedding compact trend visualizations inside
cards, tables, and dashboards — no axes, no labels, minimal chrome.

Six variants are available: `SparkAreaChart`, `SparkLineChart`,
`SparkBarChart`, `SparkGaugeChart`, `SparkPieChart`, and `SparkBulletChart`.
The first three accept either a plain number array or an object array with
a `dataKey`. The last three are different — they mirror `GaugeChart`'s,
`PieChart`'s, and `BulletChart`'s APIs instead of plotting a trend; see
[SparkGaugeChart](#sparkgaugechart), [SparkPieChart](#sparkpiechart), and
[SparkBulletChart](#sparkbulletchart) below for details.

```tsx
import { SparkAreaChart, SparkBarChart, SparkGaugeChart, SparkLineChart } from '@gnome-ui/charts';

// Plain numbers
<SparkAreaChart data={[42, 58, 35, 72, 61]} height={48} aria-label="Weekly trend" />

// Object array
<SparkLineChart
  data={[{ day: 'Mon', value: 42 }, { day: 'Tue', value: 58 }]}
  dataKey="value"
  height={48}
  aria-label="Daily sessions"
/>

// Custom color
<SparkBarChart data={[88, 72, 95, 60, 48]} color="var(--gnome-red-3, #e01b24)" height={48} aria-label="Error rate" />
```

## Shared props (SparkAreaChart, SparkLineChart, SparkBarChart)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `number[] \| Record<string, unknown>[]` | — | Data points |
| `dataKey` | `string` | `"value"` | Key when data is an object array. Ignored when `series` is provided |
| `color` | `string` | accent color | Fill / stroke color. Ignored when `series` is provided |
| `height` | `number` | `40` | Chart height in px |
| `highlighted` | `boolean` | `false` | Enable hover-based emphasis (see below) |
| `aria-label` | `string` | — | Accessible label (recommended) |

## SparkAreaChart extra props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `gradient` | `boolean` | `true` | Gradient fill from top to bottom |
| `fillOpacity` | `number` | `0.2` | Fill opacity when `gradient` is false |
| `strokeWidth` | `number` | `1.5` | Stroke width |
| `series` | `SparkSeries[]` | — | Render multiple overlaid areas (see Multi-series) |

## SparkLineChart extra props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `strokeWidth` | `number` | `1.5` | Stroke width |
| `series` | `SparkSeries[]` | — | Render multiple overlaid lines (see Multi-series) |

## SparkBarChart extra props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `barSize` | `number` | auto | Bar width in px |
| `fillOpacity` | `number` | `0.85` | Bar fill opacity |

---

## SparkGaugeChart

A compact progress ring for a single value — not a trend. Mirrors
`GaugeChart`'s API instead of the shared `data`/`dataKey` props above.

```tsx
import { SparkGaugeChart } from '@gnome-ui/charts';

<SparkGaugeChart value={72} size={40} aria-label="CPU usage 72%" />

<SparkGaugeChart
  value={93}
  thresholds={[
    { value: 0, color: 'var(--gnome-green-4, #2ec27e)' },
    { value: 60, color: 'var(--gnome-yellow-5, #e5a50a)' },
    { value: 85, color: 'var(--gnome-red-3, #e01b24)' },
  ]}
  aria-label="Disk usage 93%"
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | — | Current value; the ring is clamped to `min`/`max` |
| `min` | `number` | `0` | Minimum of the gauge range |
| `max` | `number` | `100` | Maximum of the gauge range |
| `color` | `string` | accent color | Ring color; overrides `thresholds` |
| `thresholds` | `{ value, color }[]` | — | Ascending value/color bands for status-style rings |
| `size` | `number` | `40` | Ring diameter in px |
| `strokeWidth` | `number` | `4` | Ring stroke width in px |
| `aria-label` | `string` | — | Accessible label (recommended) |
| `className` | `string` | — | Extra CSS class on the `<svg>` |

Renders as plain SVG — no Recharts dependency, no built-in tooltip. Pair it
with a numeric label in the surrounding layout (e.g. inside a `StatCard`)
since the ring itself shows no text.

---

## SparkPieChart

A compact pie or donut for part-to-whole composition — not a trend. Mirrors
`PieChart`'s API instead of the shared `data`/`dataKey` props above.

```tsx
import { SparkPieChart } from '@gnome-ui/charts';

<SparkPieChart
  data={[{ value: 62 }, { value: 18 }, { value: 11 }, { value: 9 }]}
  size={40}
  aria-label="Browser share"
/>

<SparkPieChart
  data={[
    { value: 45, color: 'var(--gnome-blue-3, #3584e4)' },
    { value: 30, color: 'var(--gnome-green-4, #2ec27e)' },
    { value: 25, color: 'var(--gnome-orange-3, #ff7800)' },
  ]}
  donut
  aria-label="Storage by category"
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `{ value: number; color?: string }[]` | — | One entry per slice |
| `size` | `number` | `40` | Chart diameter in px |
| `donut` | `boolean` | `false` | Render as a donut (hollow center) |
| `paddingAngle` | `number` | `2` | Gap in degrees between adjacent slices |
| `aria-label` | `string` | — | Accessible label (recommended) |
| `className` | `string` | — | Extra CSS class on the wrapper `<div>` |

Colors fall back to `GNOME_CHART_PALETTE` by index when not set per item.
Unlike the other spark charts it has no `highlighted` prop — hover emphasis
doesn't map cleanly onto a multi-slice composition chart at this scale.

---

## SparkBulletChart

A compact bullet graph — value vs. target in a single row. Mirrors
`BulletChart`'s API instead of the shared `data`/`dataKey` props above,
minus the `label`/`showValue` text (pair it with a label in the
surrounding layout, e.g. a table row or list item).

```tsx
import { SparkBulletChart } from '@gnome-ui/charts';

<SparkBulletChart value={72} target={90} aria-label="Revenue vs target" />

<SparkBulletChart
  value={72}
  target={90}
  ranges={[{ value: 50 }, { value: 80 }, { value: 100 }]}
  aria-label="CPU vs target"
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | — | Performance measure — the current value |
| `target` | `number` | — | Comparative measure, rendered as a perpendicular tick |
| `min` | `number` | `0` | Minimum of the track range |
| `max` | `number` | `100` | Maximum of the track range |
| `ranges` | `{ value, color? }[]` | — | Ascending upper bounds for qualitative bands; falls back to a neutral grayscale ramp |
| `color` | `string` | accent color | Performance bar color |
| `height` | `number` | `16` | Track height in px |
| `aria-label` | `string` | — | Accessible label (recommended) |
| `className` | `string` | — | Extra CSS class on the wrapper `<div>` |

Renders as plain HTML/CSS — no Recharts dependency, no built-in tooltip.

---

## Hover emphasis (`highlighted`)

Pass `highlighted` to activate pointer-driven emphasis on any spark chart.

**SparkAreaChart** — on hover the gradient intensifies (stops 70 % → 10 %)
and the stroke width increases by 0.5 px. With multiple series only the
hovered area highlights; the others stay at rest.

**SparkLineChart** — at rest, no fill is shown beneath the line. On hover,
a gradient area fill fades in (stops 40 % → 0 %). With multiple series each
line gets its own fill on hover.

**SparkBarChart** — bars render at `fillOpacity` at rest and jump to full
opacity (1.0) on hover.

```tsx
<SparkAreaChart data={data} highlighted aria-label="Downloads" />
<SparkLineChart data={data} highlighted aria-label="Sessions" />
<SparkBarChart  data={data} highlighted aria-label="Errors" />
```

---

## Multi-series (`series`)

`SparkAreaChart` and `SparkLineChart` accept a `series` prop to overlay
multiple data keys on one chart. When `series` is provided, `dataKey` and
`color` are ignored. Colors fall back to `GNOME_CHART_PALETTE` when not
specified per series.

```tsx
import type { SparkSeries } from '@gnome-ui/charts';

const series: SparkSeries[] = [
  { key: 'sent' },
  { key: 'received', color: '#e01b24' },
];

const data = [
  { sent: 42, received: 18 },
  { sent: 58, received: 30 },
  // …
];

<SparkAreaChart data={data} series={series} highlighted aria-label="Sent vs received" />
<SparkLineChart data={data} series={series} highlighted aria-label="Sent vs received" />
```

### `SparkSeries` type

```ts
interface SparkSeries {
  key: string;    // data object key to plot
  color?: string; // stroke/fill color; defaults to GNOME_CHART_PALETTE[index]
}
```

---

## Guidelines

- Always pass `aria-label` — sparklines have no visible axis text.
- Set `aria-hidden` on the wrapper when a sibling element already describes
  the trend.
- Embed inside a `Card` or `StatCard` with a metric value and trend indicator
  for full context.
- Each chart instance uses a stable unique ID (via `useId`) for its SVG
  gradient definitions, preventing color bleed when multiple instances are
  rendered on the same page.
