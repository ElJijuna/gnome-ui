# @gnome-ui/charts

Chart components for [@gnome-ui/react](../react/README.md), styled with GNOME Adwaita design tokens.

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

All components use the Adwaita color palette (`GNOME_CHART_PALETTE`) and CSS custom properties for theming, and adapt automatically to light/dark mode.

## Quick example

```tsx
import { AreaChart, BarChart, LineChart } from "@gnome-ui/charts";

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
```

## Props

All three components share a common set of props:

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

`BarChart` also accepts:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `stacked` | `boolean` | `false` | Stack series on top of each other |
| `layout` | `"vertical" \| "horizontal"` | `"vertical"` | Bar orientation — `"horizontal"` for a horizontal bar chart |
| `yAxisFormatter` | `(value: number) => string` | — | Custom formatter for Y-axis tick labels |

## Utilities

| Export | Description |
|--------|-------------|
| `GNOME_CHART_PALETTE` | Array of GNOME Adwaita accent colors used as the default series palette |

## License

[MIT](../../LICENSE)
