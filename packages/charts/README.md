# @gnome-ui/charts

Chart components for [@gnome-ui/react](../react/README.md), styled with GNOME Adwaita
design tokens.

[![npm](https://img.shields.io/npm/v/@gnome-ui/charts)](https://www.npmjs.com/package/@gnome-ui/charts)
[![CI](https://github.com/eljijuna/gnome-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/eljijuna/gnome-ui/actions/workflows/ci.yml)
[![Storybook](https://img.shields.io/badge/Storybook-live-ff4785?logo=storybook&logoColor=white)](https://eljijuna.github.io/gnome-ui/charts/)
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
import "@gnome-ui/core/tokens";
import "@gnome-ui/charts/styles";
```

## Components

| Component | Description |
|-----------|-------------|
| `AreaChart` | Filled area chart with optional stacking, grid, and legend |
| `BarChart` | Vertical or horizontal bar chart with rounded bars, optional stacking, grid, and legend |
| `LineChart` | Line chart with dots, grid, and legend |
| `RadialBarChart` | Concentric arc chart with optional labels, legend, and inner radius control |
| `PieChart` | Pie or donut chart with optional slice labels and legend |
| `RadarChart` | Spider/radar chart with single or multiple series and optional fill |
| `TreeMap` | Proportional tile chart with optional group coloring and labels |

All components use the Adwaita color palette (`GNOME_CHART_PALETTE`) and CSS custom
properties for theming, and adapt automatically to light/dark mode.

## Imports

### Standard import (barrel)

Import any component from the package root. Works with every bundler and is
the simplest option. Modern bundlers that respect the `sideEffects` field in
`package.json` will still tree-shake unused components automatically.

```tsx
import { AreaChart, BarChart, LineChart, PieChart, RadarChart, RadialBarChart, TreeMap } from "@gnome-ui/charts";
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
import { RadarChart } from "@gnome-ui/charts/components/RadarChart";
import { RadialBarChart } from "@gnome-ui/charts/components/RadialBarChart";
import { TreeMap } from "@gnome-ui/charts/components/TreeMap";
```

Both forms are fully typed and produce identical runtime behavior.

## Quick example

```tsx
import { AreaChart, BarChart, LineChart, PieChart, RadarChart, RadialBarChart, TreeMap } from "@gnome-ui/charts";

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

`TreeMap` accepts:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `TreeMapDataItem[]` | — | Array of `{ label, value, group? }` |
| `height` | `number` | `400` | Chart height in px |
| `showLabels` | `boolean` | `true` | Show name and value inside each tile |
| `className` | `string` | — | Extra CSS class on the wrapper |

## Utilities

| Export | Description |
|--------|-------------|
| `GNOME_CHART_PALETTE` | Array of GNOME Adwaita accent colors used as the default series palette |

## License

[MIT](../../LICENSE)
