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
> `CloudChart`, and `SparkLineChart` shipped. This package mirrors
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
[`src/components/CloudChart/README.md`](src/components/CloudChart/README.md), and
[`src/components/SparkLineChart/README.md`](src/components/SparkLineChart/README.md) for the full
prop reference of each.

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
  affordance, unlike this whole port's usual hover-to-long-press swap.
