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

> **Status:** `LineChart` and `BarChart` shipped. This package mirrors
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

See [`src/components/LineChart/README.md`](src/components/LineChart/README.md) and
[`src/components/BarChart/README.md`](src/components/BarChart/README.md) for the full prop
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
