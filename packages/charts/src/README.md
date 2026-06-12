# Spark Charts

Inline sparkline charts for embedding compact trend visualizations inside
cards, tables, and dashboards — no axes, no labels, minimal chrome.

Three variants are available: `SparkAreaChart`, `SparkLineChart`, and
`SparkBarChart`. All accept either a plain number array or an object array
with a `dataKey`.

```tsx
import { SparkAreaChart, SparkBarChart, SparkLineChart } from '@gnome-ui/charts';

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

## Shared props

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
