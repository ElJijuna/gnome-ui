# Roadmap — @gnome-ui/react-native-charts

Component porting plan from [`@gnome-ui/charts`](../charts/README.md) (23 components, built on
Recharts/SVG-over-DOM) to React Native, on top of [Victory Native](https://commerce.nearform.com/open-source/victory-native/)
(Skia + Reanimated) — this package's package.json/`README.md#design-notes` documents why that
library was chosen over `react-native-svg-charts` (unmaintained) or hand-rolling on
`react-native-svg` directly.

This block was tracked as `🚫 Deferred as a block` in
[`packages/react-native/ROADMAP.md`](../react-native/ROADMAP.md) until a concrete need to start it
came up — see that file for the original deferral note.

| Status | Component | Notes |
|--------|-----------|-------|
| ✅ | **LineChart** | First component — established the package's architecture: `matchFont({ fontSize: 12 })` (not `theme.fontFamily`, see README) for axis labels, `getChartPalette(theme)` for series colors, a hand-rolled legend (Victory Native has none built in). No interactive tap tooltip yet — see README |
| ✅ | **BarChart** | Second component — moved the shared architecture (axis font, palette, legend, `InputKeys`/`NumericalKeys` generic helpers) out to `src/internal/` (`ChartContainer`, `ChartLegend`, `chartKeys`, `useChartFont`), now that a second consumer needed the exact same code. Grouped/clustered bars via `BarGroup`/`BarGroup.Bar` (not stacked — matches the web version's default un-stacked `<Bar>` behavior), `roundedCorners={{ topLeft: 4, topRight: 4 }}` for the top-rounded look |
| ✅ | **AreaChart** | Third component — `stacked`/`gradient` toggles, matching the web props. Non-stacked draws `Area` (fill) + `Line` (stroke) per series since Victory Native's `Area` only fills, no stroke; stacked uses `StackedArea` with per-row `areaOptions` for gradient. Gradient fill via Skia `<LinearGradient>` as a child, colors built with a new `withAlpha()` helper (`#RRGGBB` → `#RRGGBBAA`, the same suffix trick `Chip`/`Highlight` use in `@gnome-ui/react-native`). **Real on-device bug found and fixed**: `CartesianChart`'s auto y-domain is each series' own raw-value extent, not aware `stacked` sums them — the stacked chart's topmost band rendered visibly flat-clipped at the un-stacked ceiling until `domain={{ y: [0, stackedMax] }}` was computed and passed explicitly for `stacked` mode |
| ✅ | **PieChart** | Fourth component, first non-Cartesian (polar) chart — `PolarChart`/`Pie.Chart`/`Pie.Slice`/`Pie.Label` instead of `CartesianChart` (no axes/grid at all, `data`/`height`/`donut`/`showLabels`/`showLegend`/`legendPosition` only, no `series`/`xAxisKey`). `PolarChart`'s `colorKey` generic requires the data itself to carry a real (non-optional) color field, so each item is pre-resolved to `{ ...item, resolvedColor }` before handing it to `PolarChart` — no `InputKeys`/`NumericalKeys` replica types needed here since this component isn't generic over consumer data shape. `Pie.Label` draws centered *inside* each slice (`radiusOffset`), a deliberate platform-idiom swap from the web's external leader-line labels — Victory Native has no leader-line primitive and building one wasn't worth it for a label position, not a data question. Kept the web's <4%-of-total label-clutter guard (computed from `slice.sweepAngle / 360`, since Victory Native's own `Pie.Slice` has no built-in equivalent). No inter-slice white border (web's `stroke`) — `Pie.Slice` hardcodes `style="fill"` on a single `Path`, so a stroke would need a second overlaid `Path` per slice; skipped as a minor, deliberate cosmetic trim. First chart shipped in this package with no bug found on the on-device screenshot check |
| ⬜ | **RadarChart** | |
| ⬜ | **PieChart** | |
| ⬜ | **RadarChart** | |
| ⬜ | **RadialBarChart** | |
| ⬜ | **CloudChart** | No Victory Native equivalent — word/tag cloud is a from-scratch layout problem, not a chart primitive it ships |
| ⬜ | **SparkLineChart** | |
| ⬜ | **SparkAreaChart** | |
| ⬜ | **SparkBarChart** | |
| ⬜ | **ScatterChart** | |
| ⬜ | **FunnelChart** | No Victory Native equivalent |
| ⬜ | **ComposedChart** | |
| ⬜ | **GaugeChart** | |
| ⬜ | **TreeMap** | No Victory Native equivalent |
| ⬜ | **SankeyChart** | No Victory Native equivalent |
| ⬜ | **BulletChart** | |
| ⬜ | **WaterfallChart** | |
| ⬜ | **Heatmap** | |
| ⬜ | **SparkGaugeChart** | |
| ⬜ | **SparkPieChart** | |
| ⬜ | **SparkBulletChart** | |
| ⬜ | **BoxPlot** | |

Rows marked "No Victory Native equivalent" will need either hand-rolled Skia primitives (paths/
shapes on top of `@shopify/react-native-skia` directly, the same way `LineChart` composes
`CartesianChart`) or a different approach entirely — flag to the user when reached rather than
assuming.
