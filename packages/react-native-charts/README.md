# @gnome-ui/react-native-charts

<p align="center">
  <img src="https://raw.githubusercontent.com/ElJijuna/gnome-ui/main/public/assets/gnome-ui.png" alt="gnome-ui" width="120" />
</p>

Data visualisation components for [@gnome-ui/react-native](../react-native/README.md), styled with
GNOME Adwaita design tokens and rendered on [Skia](https://shopify.github.io/react-native-skia/) via
[Victory Native](https://commerce.nearform.com/open-source/victory-native/).

[![npm](https://img.shields.io/npm/v/@gnome-ui/react-native-charts)](https://www.npmjs.com/package/@gnome-ui/react-native-charts)
[![CI](https://github.com/eljijuna/gnome-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/eljijuna/gnome-ui/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)

> **Status:** `LineChart`, `BarChart`, `AreaChart`, `PieChart`, `RadarChart`, `RadialBarChart`,
> `CloudChart`, `SparkLineChart`, `SparkAreaChart`, `SparkBarChart`, `ScatterChart`,
> `FunnelChart`, `ComposedChart`, `GaugeChart`, `TreeMap`, and `SankeyChart` shipped. This package
> mirrors
> [`@gnome-ui/charts`](../charts/README.md)'s 23-component roadmap for React
> Native, one chart at a time, on top of Victory Native (Skia + Reanimated)
> rather than Recharts (SVG-over-DOM), since RN has no DOM/SVG renderer to
> reuse directly. See [`ROADMAP.md`](ROADMAP.md) for per-component status.

## Installation

```bash
npm install @gnome-ui/react-native-charts victory-native @shopify/react-native-skia react-native-reanimated react-native-gesture-handler react-native-worklets
```

Or, in an Expo app, let `expo install` resolve SDK-compatible versions of the native peers:

```bash
npx expo install victory-native @shopify/react-native-skia react-native-reanimated react-native-gesture-handler react-native-worklets
npm install @gnome-ui/react-native-charts
```

Requires `@gnome-ui/react-native` (for theme tokens and `useNumberFormatter`) and `react` ≥ 19 as peer
dependencies.

## Setup

1. Wrap your app's root in `GestureHandlerRootView` — Victory Native's `CartesianChart` uses
   `react-native-gesture-handler` internally, even for a chart with no pan/zoom interaction:

   ```tsx
   import { GestureHandlerRootView } from 'react-native-gesture-handler';

   export default function App() {
     return (
       <GestureHandlerRootView style={{ flex: 1 }}>
         {/* ... */}
       </GestureHandlerRootView>
     );
   }
   ```

2. In an Expo app on SDK 50+, `babel-preset-expo` auto-detects `react-native-reanimated` /
   `react-native-worklets` in `node_modules` and wires their Babel plugin for you — no
   `babel.config.js` changes needed. Outside Expo, add `react-native-worklets/plugin` to your
   Babel config's `plugins` (must be listed last).

## Components

| Component | Description |
|-----------|-------------|
| `LineChart` | Multi-series line chart with dots, grid, axis labels, and legend |
| `BarChart` | Grouped/clustered bar chart for categorical comparisons |
| `AreaChart` | Filled area chart — flat tint or gradient fill, overlapping or stacked series |
| `PieChart` | Pie or donut chart with optional in-slice labels and legend |
| `RadarChart` | Spider/radar chart for multi-attribute comparisons across subjects |
| `RadialBarChart` | Concentric arc bars for multiple circular progress metrics |
| `CloudChart` | Word/tag cloud with value-proportional font sizing |
| `SparkLineChart` | Minimal inline line sparkline for embedding in cards and tables |
| `SparkAreaChart` | Minimal inline area sparkline with optional gradient fill |
| `SparkBarChart` | Minimal inline bar sparkline for compact trend display |
| `ScatterChart` | Scatter/bubble chart for correlation between two numeric variables; `zKey` encodes a third dimension as bubble size |
| `FunnelChart` | Funnel visualization for conversion rates and sales pipelines |
| `ComposedChart` | Mixed `bar`/`line`/`area` series sharing one x-axis |
| `GaugeChart` | Radial gauge for a single value against a min/max range, with optional color thresholds |
| `TreeMap` | Proportional-area rectangles for hierarchical/part-of-whole data, laid out with a squarified treemap algorithm |
| `SankeyChart` | Flow diagram for multi-stage funnels/allocations, laid out with a d3-sankey-style algorithm |

## Usage

```tsx
import { LineChart } from '@gnome-ui/react-native-charts';

<LineChart
  data={[
    { day: 'Mon', cpu: 42, memory: 68 },
    { day: 'Tue', cpu: 58, memory: 72 },
  ]}
  series={[
    { dataKey: 'cpu', name: 'CPU %' },
    { dataKey: 'memory', name: 'Memory %' },
  ]}
  xAxisKey="day"
  showLegend
/>;
```

See [`src/components/LineChart/README.md`](src/components/LineChart/README.md),
[`src/components/BarChart/README.md`](src/components/BarChart/README.md),
[`src/components/AreaChart/README.md`](src/components/AreaChart/README.md),
[`src/components/PieChart/README.md`](src/components/PieChart/README.md),
[`src/components/RadarChart/README.md`](src/components/RadarChart/README.md),
[`src/components/RadialBarChart/README.md`](src/components/RadialBarChart/README.md),
[`src/components/CloudChart/README.md`](src/components/CloudChart/README.md),
[`src/components/SparkLineChart/README.md`](src/components/SparkLineChart/README.md),
[`src/components/SparkAreaChart/README.md`](src/components/SparkAreaChart/README.md),
[`src/components/SparkBarChart/README.md`](src/components/SparkBarChart/README.md),
[`src/components/ScatterChart/README.md`](src/components/ScatterChart/README.md),
[`src/components/FunnelChart/README.md`](src/components/FunnelChart/README.md),
[`src/components/ComposedChart/README.md`](src/components/ComposedChart/README.md),
[`src/components/GaugeChart/README.md`](src/components/GaugeChart/README.md),
[`src/components/TreeMap/README.md`](src/components/TreeMap/README.md), and
[`src/components/SankeyChart/README.md`](src/components/SankeyChart/README.md) for the full prop
reference of each.

## Design notes

- **Shared chart internals live in `src/internal/`** (`ChartContainer`, `ChartLegend`, `chartKeys`,
  `useChartFont`) — extracted once `BarChart` became a second consumer of the exact same axis-font/
  palette/legend/generic-typing code `LineChart` already had. Not part of the public API; every new
  chart should compose these rather than re-deriving them.

- **Series colors** default to the GNOME Adwaita chart palette (`blue3`, `green4`, `orange3`,
  `purple3`, `red3`, `yellow5`), read from the active `GnomeProvider` theme so they track color
  scheme and high-contrast switches — see `getChartPalette`.
- **Axis/tick labels use Skia's `matchFont({ fontSize: 12 })` with the default `"System"` family,
  not `theme.fontFamily`** ("Adwaita Sans") — confirmed on-device that Skia's font matcher renders
  no glyphs at all for a family name that isn't actually registered on the device, unlike RN's own
  `<Text>`, which silently falls back to the OS default font for an unknown `fontFamily`.
- **No interactive (tap/press) tooltip yet.** Victory Native's `useChartPressState` requires the
  series' data keys to be known as TypeScript literal types at the call site, which doesn't fit
  this package's (and `@gnome-ui/charts`') deliberately dynamic `series: { dataKey: string }[]`
  prop shape without a larger API redesign. Revisit once a second chart's needs clarify the right
  shape for it.
- **`AreaChart`'s `stacked` mode passes an explicit `domain={{ y: [0, stackedMax] }}`** to
  `CartesianChart` — its own auto-domain is the extent of each series' raw values, not aware a
  stacked chart sums them, so without this the topmost stacked band renders visibly flat-clipped
  at the un-stacked ceiling (confirmed on-device). Gradient fills use a `withAlpha()` helper
  (`src/internal/colorAlpha.ts`) to turn a palette hex color into a `#RRGGBBAA` fade-to-transparent
  pair for Skia's `<LinearGradient>` — the same alpha-suffix trick `Chip`/`Highlight` use in
  `@gnome-ui/react-native`.
- **`PieChart` is polar, not Cartesian** — it composes `PolarChart`/`Pie.Chart` instead of
  `CartesianChart`, has no axes/grid, and its `data` prop is a flat `{ label, value, color? }[]`
  rather than the `data`+`series` split the other charts use. Slice labels render *inside* each
  slice (Victory Native's `Pie.Label`) rather than the web version's external leader-line labels —
  there's no leader-line primitive to build on, and a label-position swap is a reasonable
  platform-idiom adaptation, not a data/behavior change.
- **`RadarChart` has no Victory Native primitive at all** and is hand-built directly on
  `@shopify/react-native-skia`'s own low-level primitives (`Canvas`, `Path`, `Line`, `Text`,
  `Skia.PathBuilder`) — flagged to the user before starting rather than assumed, since it's a real
  architecture decision (same category as the original Victory Native choice for this whole
  package). Manages its own `Canvas` sizing via a plain `View`'s `onLayout`, since there's no
  `CartesianChart`/`PolarChart` wrapper to do it. Uses the modern `Skia.PathBuilder.Make()` API,
  not the older mutable `Skia.Path.Make()` (deprecated in this Skia version — confirmed via a real
  runtime warning, not assumed from docs).
- **`RadialBarChart` also has no Victory Native primitive** — same situation as `RadarChart`,
  confirmed again with the user before starting rather than assumed. Hand-built on
  `SkPathBuilder.addArc` (a thick stroked arc per ring, not a filled annular sector). **A real
  sweep-direction bug shipped and was caught by the on-device screenshot, not by any automated
  check** — Skia's `addArc` treats positive sweep as clockwise in its y-down coordinate space, so
  a negative sweep from `startAngle: 180` traced the *bottom* half instead of the intended top-half
  gauge, rendering as a barely-visible sliver clipped against the canvas edge. Any future arc-based
  chart in this package should double-check sweep direction algebraically against Skia's own doc
  comment before trusting a screenshot alone to catch a sign error like this.
- **`CloudChart` needed no Skia canvas at all**, unlike `RadarChart`/`RadialBarChart` — its web
  source has no real word-cloud packing algorithm, just flex-wrapped `<span>`s with `font-size`
  scaled linearly by value, laid out by the browser's own text flow. Ports directly to a plain
  `flexWrap: 'wrap'` RN `View` of `Text`s. No hover-only hint (web's `:hover { opacity: 0.7 }`, no
  touch equivalent and no `onPress` in the source either).
- **`SparkLineChart` still reuses `CartesianChart`** (unlike `CloudChart`) purely for its scaling
  math, with every decorative axis/grid/frame part hidden (`axisOptions={{ lineColor: 'transparent' }}`,
  no `font`). It fully controls its own normalized data shape internally (always a plain
  `Record<string, number>` via a synthetic `__x` index field), so it passes explicit generic type
  arguments to `CartesianChart` instead of needing the `InputKeys`/`NumericalKeys` replica pattern
  the bigger, consumer-shape-generic charts use. The web's hover-triggered `highlighted` mode is
  dropped — a sparkline's usual embedding size (e.g. inside a table cell) has no natural touch
  affordance, unlike this whole port's usual hover-to-long-press swap. `resolveSparkSeries`/
  `normalizeSparkData`/`sparkAccessibilityProps` (`src/internal/sparkTypes.ts`) are shared by the
  whole spark-chart family, extracted once `SparkAreaChart` became a second consumer — same "second
  occurrence" call as the bigger charts' own `src/internal/` split.
- **`SparkAreaChart` layers `Area` (fill) + a separate `Line` (stroke)**, same as `AreaChart` —
  Victory Native's `Area` hardcodes `style: "fill"` and its props don't accept a `style`/
  `strokeWidth` override at all (confirmed via a real `tsc` error, not assumed), so a second
  `<Area style="stroke">` doesn't typecheck.
- **`SparkBarChart` has no multi-`series` mode at all** (single `dataKey`+`color` only), matching
  the web version exactly — unlike its two spark siblings. Uses Victory Native's standalone `Bar`,
  not `BarGroup`/`BarGroup.Bar` (which `BarChart` needs for grouping multiple series side by side),
  since there's only ever one series here.
- **`ScatterChart` is the only chart here where each series owns its own independent point list**
  (its own `xKey`/`yKey`/`zKey` field names), not rows shared across series — every series' points
  are merged into one combined row array before handing it to `CartesianChart`, with each row only
  populating its own series' namespaced y (and z) field; `Scatter` itself skips any point whose `y`
  isn't a number, so other series' rows render as gaps for free. **`CartesianChart` sorts its data
  by `xKey` internally (confirmed from `transformInputData`'s source) — any per-point data matched
  back in *after* the fact (this chart's bubble-size `zKey` lookup) must match by each point's own
  raw `xValue`/`yValue`, never by array index into the array you originally built,** since the sort
  reorders points relative to your own insertion order. `xLabel`/`yLabel` from the web version are
  dropped — they only ever fed Recharts' tooltip text, which this package has none of yet.
- **`FunnelChart` has no Victory Native primitive either**, same category as `RadarChart`/
  `RadialBarChart`, and is hand-built directly on `Skia.PathBuilder` — one closed trapezoid `Path`
  per segment (`moveTo`/`lineTo` around the four corners, `.close()`), width tapering linearly by
  each item's share of the largest value. Uses `ChartContainer` with `legend={null}` since the web
  source renders no legend for this chart. Shipped with zero bugs on the first on-device
  screenshot — the first hand-rolled-geometry chart in this package to do so, credited to already
  having the `Skia.PathBuilder.Make()` API and Skia's angle/coordinate conventions worked out from
  the two prior hand-rolled charts before writing a line of this one.
- **`ComposedChart` is the first chart mixing multiple render primitives (`bar`/`line`/`area`)
  within one `series` array** — every prior chart's series all shared one rendering primitive.
  `series` is split by `type` and rendered as: all bar-type series together inside one `BarGroup`
  (it needs every bar as a direct child to compute width/offset), then area-type (`Area` fill + a
  separate `Line` stroke, same pattern `AreaChart` uses), then line-type last — a deliberate,
  documented deviation from the array's own literal order, since bars can't be interleaved with
  other types without breaking `BarGroup`'s internal width math. **The first on-device screenshot
  surfaced a demo-data mistake, not a component bug**: a `growth` field (values 8–30) sharing one
  y-axis with `revenue` (4000–5600) rendered as an invisible hairline — `CartesianChart` shares one
  y-domain across every `yKey`, with no per-series secondary axis, the same limitation the web
  `ComposedChart` has with its own single `YAxis`. Any future composed-chart data needs every
  series kept within the same order of magnitude, or a series will visually vanish.
- **`GaugeChart` is a single-ring simplification of `RadialBarChart`'s already-validated
  semicircle-gauge geometry** — fourth chart in this package with no Victory Native primitive
  (same category as `RadarChart`/`RadialBarChart`/`FunnelChart`), reusing `RadialBarChart`'s exact
  `SkPathBuilder.addArc` sweep-direction convention and `strokeCap="round"` track/value pairing
  rather than re-deriving them. Adds `thresholds` (ascending value/color status bands) and a
  centered value+caption drawn as Skia `Text` nodes directly on the `Canvas`, rather than an
  absolutely-positioned RN `<Text>` overlay. **No RN theme token exists for the web's
  `--gnome-dim-label-color` CSS var** (confirmed by grepping the generated theme — zero hits) —
  approximated the caption's dimmed look with `theme.windowFgColor` plus a Skia `opacity={0.55}`
  node prop instead of inventing a new theme token for one component's caption text. Shipped with
  zero bugs on the on-device screenshot, continuing the pattern `FunnelChart` started: once a
  hand-rolled Skia chart's underlying primitive (arc math, here) has been paid down by an earlier
  chart, a later chart reusing it in a simpler shape can reasonably ship clean.
- **`TreeMap` is the first chart needing an actual layout algorithm, not just a hand-rolled
  Skia primitive** — flagged to the user before starting, since it's a different category of
  decision than "no Victory Native primitive" (already settled for `RadarChart`/`RadialBarChart`/
  `FunnelChart`/`GaugeChart`). Ships a hand-rolled squarified treemap (Bruls/Huizing/van Wijk —
  the same algorithm Recharts' own `Treemap` uses internally) as pure `squarify`/`layoutRow`/
  `worstRatio` number-only helpers, decoupled from Skia entirely; `TreeMap` itself only turns the
  resulting rects into `RoundedRect`/`Text` nodes. Sorts `data` descending by `value` before
  layout — a deliberate deviation from array order, since squarify's aspect ratios degrade
  noticeably on unsorted input. Reuses `GaugeChart`'s `opacity` node-prop trick for the dimmed
  secondary value line. **Real bug found and fixed via the on-device screenshot**: the show-label
  gate only checked the tile's own `width`/`height` against a fixed size threshold, never whether
  the label's own measured text width actually fit inside that tile — a tall-but-narrow tile (an
  ordinary outcome of squarify packing several small values into one row) could pass the size gate
  while still being narrower than its own text, visibly bleeding the label into the neighboring
  tile. Fixed by measuring `font.measureText(label).width` before deciding to draw it, hiding the
  label entirely once it doesn't fit rather than letting it overflow.
- **`SankeyChart` is the second chart needing a real layout algorithm** — flagged to the user
  before starting (same category as `TreeMap`, distinct from the "no Victory Native primitive"
  question already settled for the arc-based hand-rolled charts), who chose a full d3-sankey-style
  layout over a simplified no-relaxation version. Column assignment by longest-path depth (bounded
  relaxation over the DAG, not an explicit topological sort), node height proportional to
  throughput, then several passes alternating `relaxRightToLeft`/`relaxLeftToRight` — each pass
  pulls every node toward the weighted-center of the links tugging on it and resolves the
  resulting overlap — to straighten links and reduce crossings, the same technique d3-sankey (and
  the web version's underlying Recharts `Sankey`) uses. Deliberately skips d3-sankey's own
  link-crossing-minimizing sort at each node (links stack in the input `links` array's own order)
  as a smaller, documented scope trim distinct from the relaxation algorithm itself. Links are
  cubic-Bezier `Path`s colored by their *source* node via the `withAlpha()` helper
  (`AreaChart`/`SparkAreaChart`'s translucent-fill trick), standing in for the web version's CSS
  `color-mix` (no Skia equivalent).
