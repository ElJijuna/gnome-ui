# @gnome-ui/charts

<p align="center">
  <img src="https://raw.githubusercontent.com/ElJijuna/gnome-ui/main/public/assets/gnome-ui.png" alt="gnome-ui" width="120" />
</p>

Chart components for [@gnome-ui/react](../react/README.md), styled with GNOME Adwaita
design tokens.

[![npm](https://img.shields.io/npm/v/@gnome-ui/charts)](https://www.npmjs.com/package/@gnome-ui/charts)
[![CI](https://github.com/eljijuna/gnome-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/eljijuna/gnome-ui/actions/workflows/ci.yml)
[![Storybook](https://img.shields.io/badge/Storybook-live-ff4785?logo=storybook&logoColor=white)](https://gnome-ui.org/charts/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)

## Installation

```bash
npm install @gnome-ui/charts
```

Requires `@gnome-ui/core` for design tokens and `react` ≥ 19 as peer dependencies.

## Setup

Import the stylesheet once at the root of your app:

```tsx
// main.tsx or App.tsx
import "@gnome-ui/core/styles";
import "@gnome-ui/charts/styles";
```

## Components

| Component | Description |
|-----------|-------------|
| `AreaChart` | Filled area chart with optional stacking, grid, and legend |
| `BarChart` | Vertical or horizontal bar chart with rounded bars, optional stacking, grid, and legend |
| `LineChart` | Line chart with dots, grid, and legend |
| `RadialBarChart` | Concentric arc chart with optional labels, legend, and inner radius control |
| `CloudChart` | Word/tag cloud with linear font-size scaling and per-word color support |
| `PieChart` | Pie or donut chart with optional slice labels and legend |
| `RadarChart` | Spider/radar chart with single or multiple series and optional fill |
| `TreeMap` | Proportional tile chart with optional group coloring and labels |
| `GaugeChart` | Single-value speedometer gauge with optional status color thresholds |
| `BulletChart` | Compact bullet graph: performance value vs. target with qualitative range bands |
| `Heatmap` | Row × column matrix heatmap for correlation and density data |
| `SankeyChart` | Flow diagram for multi-stage funnels and user journeys |
| `WaterfallChart` | Floating-bar chart for cumulative increases/decreases — revenue bridges, budget breakdowns |

### Spark charts

Minimal inline charts — no axes, no grid, no legend, no tooltip. Designed to be embedded inside Cards, table cells, list items, or any layout component.

| Component | Description |
|-----------|-------------|
| `SparkAreaChart` | Compact area chart with optional gradient fill |
| `SparkLineChart` | Compact line chart, no fill |
| `SparkBarChart` | Compact bar chart with rounded bars |
| `SparkGaugeChart` | Compact single-value progress ring |
| `SparkPieChart` | Compact pie or donut for part-to-whole composition |
| `SparkBulletChart` | Compact bullet graph: value vs. target in a single row |

`SparkAreaChart`, `SparkLineChart`, and `SparkBarChart` accept `data: number[]`
directly or `Record<string, unknown>[]` with a `dataKey`. The default color is
`var(--gnome-accent-color)` so it inherits the active accent automatically.

`SparkGaugeChart` is the exception — it takes a single `value` (plus `min`,
`max`, and optional `thresholds`) instead of a data array, mirroring
`GaugeChart`'s API.

`SparkPieChart` takes `data: { value: number; color?: string }[]` — one entry
per slice — plus `size` (diameter, default 40) and `donut` (hollow center,
default `false`), mirroring `PieChart`'s API. Colors fall back to
`GNOME_CHART_PALETTE` by index.

`SparkBulletChart` takes `value` (plus optional `target`, `min`, `max`, and
`ranges`) instead of a data array, mirroring `BulletChart`'s API at a compact
scale (`height`, default 16, instead of `BulletChart`'s `label`/`showValue`).

See [`src/README.md`](src/README.md) for full spark chart docs.

```tsx
import { SparkAreaChart, SparkLineChart, SparkBarChart } from "@gnome-ui/charts";
import { Card, Text } from "@gnome-ui/react";

// Simplest form — plain number array
<SparkAreaChart data={[42, 58, 35, 72, 88, 93]} height={48} />

// Embedded in a Card
<Card>
  <Text variant="caption" color="dim">Downloads</Text>
  <Text variant="title-2">12,430</Text>
  <SparkAreaChart
    data={[42, 58, 35, 72, 88, 93]}
    height={48}
    aria-label="Downloads trend"
  />
</Card>

// Object array with explicit dataKey
<SparkLineChart
  data={weeklyData}
  dataKey="sessions"
  color="var(--gnome-green-3)"
  height={32}
/>
```

All components use the Adwaita color palette (`GNOME_CHART_PALETTE`) and CSS custom
properties for theming, and adapt automatically to light/dark mode.

## Formatting

Charts inherit locale and default number formatting from `GnomeProvider` in
`@gnome-ui/react`. This affects axis ticks, tooltips, and generated accessible
labels.

```tsx
import { GnomeProvider } from "@gnome-ui/react";
import { BarChart } from "@gnome-ui/charts";

<GnomeProvider
  locale="en-US"
  numberFormat={{ notation: "compact", compactDisplay: "short" }}
>
  <BarChart
    data={[{ month: "Jan", downloads: 12500 }]}
    series={[{ dataKey: "downloads", name: "Downloads" }]}
  />
</GnomeProvider>
```

Use compact notation for values like `13K`; omit `numberFormat` or use
`notation: "standard"` for full values like `12,500`.

## Imports

### Standard import (barrel)

Import any component from the package root. Works with every bundler and is
the simplest option. Modern bundlers that respect the `sideEffects` field in
`package.json` will still tree-shake unused components automatically.

```tsx
import { AreaChart, BarChart, CloudChart, LineChart, PieChart, RadarChart, RadialBarChart, TreeMap } from "@gnome-ui/charts";
```

### Per-component import (explicit tree-shaking)

Each component is also exposed as its own sub-path export. Use this form if
your bundler does not perform tree-shaking, or when you want to be explicit
about what you pull in.

```tsx
import { BarChart } from "@gnome-ui/charts/components/BarChart";
import { LineChart } from "@gnome-ui/charts/components/LineChart";
import { AreaChart } from "@gnome-ui/charts/components/AreaChart";
import { PieChart } from "@gnome-ui/charts/components/PieChart";
import { CloudChart } from "@gnome-ui/charts/components/CloudChart";
import { RadarChart } from "@gnome-ui/charts/components/RadarChart";
import { RadialBarChart } from "@gnome-ui/charts/components/RadialBarChart";
import { TreeMap } from "@gnome-ui/charts/components/TreeMap";
```

Both forms are fully typed and produce identical runtime behavior.

## Quick example

```tsx
import { AreaChart, BarChart, CloudChart, LineChart, PieChart, RadarChart, RadialBarChart, TreeMap } from "@gnome-ui/charts";

const data = [
  { month: "Jan", sales: 400, returns: 80 },
  { month: "Feb", sales: 600, returns: 120 },
  { month: "Mar", sales: 500, returns: 90 },
];

// Area chart
<AreaChart
  data={data}
  xAxisKey="month"
  series={[
    { dataKey: "sales", name: "Sales" },
    { dataKey: "returns", name: "Returns" },
  ]}
  showLegend
/>

// Bar chart
<BarChart
  data={data}
  xAxisKey="month"
  series={[{ dataKey: "sales", name: "Sales" }]}
/>

// Line chart
<LineChart
  data={data}
  xAxisKey="month"
  series={[
    { dataKey: "sales", name: "Sales" },
    { dataKey: "returns", name: "Returns" },
  ]}
  showGrid
  showLegend
/>

// Word cloud
<CloudChart
  data={[
    { text: "TypeScript", value: 95 },
    { text: "React", value: 80 },
    { text: "CSS", value: 60 },
    { text: "Docker", value: 40 },
  ]}
/>

// Pie / donut chart
<PieChart
  data={[
    { label: "Chrome", value: 62 },
    { label: "Firefox", value: 18 },
    { label: "Safari", value: 11 },
    { label: "Other", value: 9 },
  ]}
  donut
  showLegend
/>

// Radar chart
<RadarChart
  data={[
    { skill: "TypeScript", alice: 90, bob: 70 },
    { skill: "React", alice: 85, bob: 80 },
    { skill: "CSS", alice: 60, bob: 75 },
  ]}
  angleKey="skill"
  series={[
    { dataKey: "alice", name: "Alice" },
    { dataKey: "bob", name: "Bob" },
  ]}
  filled
  showLegend
/>

// Radial bar chart
<RadialBarChart
  data={[
    { label: "CPU", value: 72 },
    { label: "Memory", value: 58 },
    { label: "Disk", value: 41 },
  ]}
  showLegend
/>

// TreeMap
<TreeMap
  data={[
    { label: "React", value: 4200, group: "Frontend" },
    { label: "Vue", value: 2100, group: "Frontend" },
    { label: "Node.js", value: 3800, group: "Backend" },
  ]}
  height={400}
/>
```

## Props

`AreaChart`, `BarChart`, and `LineChart` share a common set of props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `Record<string, unknown>[]` | — | Array of data objects |
| `series` | `{ dataKey, name?, color? }[]` | — | Series definitions |
| `xAxisKey` | `string` | `"name"` | Key to use for the X axis |
| `height` | `number` | `300` | Chart height in px |
| `showGrid` | `boolean` | `true` | Show horizontal grid lines |
| `showLegend` | `boolean` | `false` | Show legend below chart |
| `className` | `string` | — | Extra CSS class on the wrapper |

`AreaChart` also accepts:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `stacked` | `boolean` | `false` | Stack all series on top of each other |
| `gradient` | `boolean` | `false` | Fill areas with a top-to-transparent gradient |

`BarChart` also accepts:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `stacked` | `boolean` | `false` | Stack series on top of each other |
| `layout` | `"vertical" \| "horizontal"` | `"vertical"` | Bar orientation |
| `yAxisFormatter` | `(value: number) => string` | — | Custom Y-axis tick formatter |

`CloudChart` accepts:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `CloudChartDataItem[]` | — | Array of `{ text, value, color? }` |
| `height` | `number` | `300` | Minimum height of the cloud container in px |
| `minFontSize` | `number` | `12` | Font size in px for the lowest-value word |
| `maxFontSize` | `number` | `48` | Font size in px for the highest-value word |
| `aria-label` | `string` | auto | Accessible label for the chart |
| `className` | `string` | — | Extra CSS class on the wrapper |

`PieChart` accepts:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `PieChartDataItem[]` | — | Array of `{ label, value, color? }` |
| `height` | `number` | `400` | Chart height in px |
| `donut` | `boolean` | `false` | Render as a donut chart with a center hole |
| `showLabels` | `boolean` | `false` | Show slice labels outside the chart |
| `showLegend` | `boolean` | `false` | Show legend below chart |
| `aria-label` | `string` | auto | Accessible label for the chart |
| `className` | `string` | — | Extra CSS class on the wrapper |

`RadarChart` accepts:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `Record<string, unknown>[]` | — | Array of data objects |
| `series` | `{ dataKey, name?, color? }[]` | — | Series definitions |
| `angleKey` | `string` | `"name"` | Key used for the angle axis labels |
| `height` | `number` | `400` | Chart height in px |
| `filled` | `boolean` | `false` | Fill radar polygons with a semi-transparent color |
| `showLegend` | `boolean` | `false` | Show legend below chart |
| `aria-label` | `string` | auto | Accessible label for the chart |
| `className` | `string` | — | Extra CSS class on the wrapper |

`RadialBarChart` accepts:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `RadialBarChartDataItem[]` | — | Array of `{ label, value, color? }` |
| `height` | `number` | `400` | Chart height in px |
| `innerRadius` | `number \| string` | `"20%"` | Inner radius of the donut gap |
| `showLabels` | `boolean` | `false` | Show category name inside each arc |
| `showLegend` | `boolean` | `false` | Show legend below chart |
| `aria-label` | `string` | auto | Accessible label for the chart |
| `className` | `string` | — | Extra CSS class on the wrapper |

`GaugeChart` accepts:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | — | Current value; shown as-is even outside `min`/`max`, the arc is clamped |
| `min` | `number` | `0` | Minimum of the gauge range |
| `max` | `number` | `100` | Maximum of the gauge range |
| `height` | `number` | `220` | Chart height in px |
| `color` | `string` | — | Explicit arc color; overrides `thresholds` |
| `thresholds` | `{ value, color }[]` | — | Ascending value/color bands for status-style gauges |
| `showValue` | `boolean` | `true` | Show the numeric value and `label` centered on the gauge |
| `valueFormatter` | `(value: number) => string` | locale-aware | Custom formatter for the displayed value |
| `label` | `string` | — | Caption rendered under the value |
| `aria-label` | `string` | auto | Accessible label for the chart |
| `className` | `string` | — | Extra CSS class on the wrapper |

`Heatmap` accepts:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `HeatmapDataItem[]` | — | `{ row: string; column: string; value: number }[]` |
| `rows` | `string[]` | first-seen order | Explicit row order, top to bottom |
| `columns` | `string[]` | first-seen order | Explicit column order, left to right |
| `color` | `string` | accent blue | Base color for the intensity scale |
| `min` | `number` | lowest value in `data` | Explicit domain minimum |
| `max` | `number` | highest value in `data` | Explicit domain maximum |
| `cellSize` | `number` | `40` | Cell side length in px |
| `showValues` | `boolean` | `false` | Show the formatted value inside each cell |
| `valueFormatter` | `(value: number) => string` | locale-aware | Custom formatter for cell values and the legend |
| `showLegend` | `boolean` | `false` | Show a min→max color scale below the grid |
| `aria-label` | `string` | auto | Accessible label for the chart |
| `className` | `string` | — | Extra CSS class on the wrapper |

`SankeyChart` accepts:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `nodes` | `SankeyChartNode[]` | — | `{ name: string; color?: string }[]` |
| `links` | `SankeyChartLink[]` | — | `{ source: string; target: string; value: number }[]`, referencing node names |
| `height` | `number` | `400` | Chart height in px |
| `nodeWidth` | `number` | `12` | Node rectangle thickness in px |
| `nodePadding` | `number` | `24` | Vertical gap between stacked nodes in the same column |
| `showValues` | `boolean` | `false` | Append the formatted value to each node label |
| `valueFormatter` | `(value: number) => string` | locale-aware | Custom formatter for labels and the tooltip |
| `aria-label` | `string` | auto | Accessible label for the chart |
| `className` | `string` | — | Extra CSS class on the wrapper |

`TreeMap` accepts:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `TreeMapDataItem[]` | — | Array of `{ label, value, group? }` |
| `height` | `number` | `400` | Chart height in px |
| `showLabels` | `boolean` | `true` | Show name and value inside each tile |
| `className` | `string` | — | Extra CSS class on the wrapper |

`SparkAreaChart`, `SparkLineChart`, and `SparkBarChart` share these props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `number[] \| Record<string, unknown>[]` | — | Values to plot |
| `dataKey` | `string` | `"value"` | Key to read when data is an object array |
| `color` | `string` | `var(--gnome-accent-color)` | Stroke / fill color |
| `height` | `number` | `40` | Chart height in px |
| `strokeWidth` | `number` | `1.5` | Stroke width |
| `className` | `string` | — | Extra CSS class on the wrapper |
| `aria-label` | `string` | — | Sets `role="img"` and an accessible label |

`SparkAreaChart` also accepts:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `gradient` | `boolean` | `true` | Gradient fill from color to transparent |
| `fillOpacity` | `number` | `0.2` | Fill opacity when `gradient` is false |

`SparkBarChart` also accepts:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `barSize` | `number` | auto | Bar width in px |
| `fillOpacity` | `number` | `0.85` | Bar fill opacity |

## Utilities

| Export | Description |
|--------|-------------|
| `GNOME_CHART_PALETTE` | Array of GNOME Adwaita accent colors used as the default series palette |

## License

[MIT](../../LICENSE)
