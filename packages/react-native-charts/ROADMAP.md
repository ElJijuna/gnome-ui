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
| ✅ | **RadarChart** | Fifth component — **no Victory Native primitive exists at all** (confirmed: neither `CartesianChart` nor `PolarChart` support an arbitrary-axis-count spider plot), flagged to the user via `AskUserQuestion` before starting rather than assumed; user chose hand-rolling directly on `@shopify/react-native-skia` (`Canvas`/`Path`/`Line`/`Text`/`Skia.PathBuilder`) over the alternative of skipping ahead to a Victory-Native-backed chart. Own manual `View`-`onLayout`-then-`Canvas` sizing (no `CartesianChart`/`PolarChart` wrapper to measure for it). Grid is `GRID_LEVELS` (4) concentric N-gon rings + one spoke line per axis; each series is a closed polygon (`Skia.PathBuilder.Make()...build()` — not the older mutable `Skia.Path.Make()`, deprecated in this Skia version, confirmed via a real runtime warning caught before shipping) rendered twice, fill then stroke, so `filled` toggles only the fill's opacity. Axis labels use `font.measureText(text).width` to manually center/right/left-align per axis angle (mirrors `Pie.Label`'s internal `getFontGlyphWidth` trick, since Skia `Text` has no CSS `text-anchor` equivalent) — no explicit radius-axis tick-number labels (a deliberate, documented scope trim; the web version's own `PolarRadiusAxis` numbers are barely visible anyway). Rendered correctly on the very first real on-device screenshot, no bugs found |
| ✅ | **RadialBarChart** | Sixth component — confirmed via `AskUserQuestion` that hand-rolling on Skia (same approach as `RadarChart`) was still wanted rather than skipping to a Victory-Native-backed chart. Each `data` item is one concentric semicircle ring (`SkPathBuilder.addArc` on an oval sized per ring, stroked with a thick `strokeWidth` band rather than a filled annular-sector path) — a gray full-180° track drawn first, then the value-proportional arc on top in the series color, `strokeCap="round"` for the friendly rounded ends. All rings share one 0-to-max scale (`max` of all `data[].value`, same convention `RadarChart`/the web version use), matching the web's own `startAngle={180} endAngle={0}` half-circle-gauge layout. **Real bug found and fixed via the on-device screenshot**: the arc rendered as a tiny clipped sliver near the canvas's bottom edge instead of a semicircle — the sweep direction was inverted (used `sweepAngle: -180`, tracing the *bottom* half via Skia's `addArc` clockwise-positive/y-down convention, almost entirely outside the canvas since the center sits at the canvas's bottom edge by design). Fixed by flipping to `sweepAngle: +180` (verified the direction algebraically against Skia's own doc comment before re-testing, not by trial and error). **User-spotted follow-up from a pasted screenshot crop**: the gray track's arc ends were square while the value arc's were round — `strokeCap="round"` had only been added to the value `Path`, not the track `Path`; fixed by adding it to both |
| ✅ | **CloudChart** | Seventh component — flagged as "No Victory Native equivalent" in this file, but turned out to need **no Skia canvas at all**, unlike `RadarChart`/`RadialBarChart`: reading the web source first showed it has no real word-cloud packing/collision algorithm — just flex-wrapped `<span>`s with `font-size` scaled linearly by value, laid out by the browser's own text flow. Ports directly to a `flexWrap: 'wrap'` RN `View` of `Text`s, no architecture question needed. Web's `:hover { opacity: 0.7 }` dropped (no touch equivalent, and the words were never interactive — no `onPress` in the source either). `lineHeight` computed per-word (`fontSize * 1.2`) since RN's `lineHeight` is an absolute pixel value, unlike CSS's relative `1.2` multiplier that works uniformly across the source's differently-sized words for free. Shipped with no bug found on the on-device screenshot check — first hand-checked chart since `PieChart` to do so |
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
