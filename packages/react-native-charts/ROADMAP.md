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
| ⬜ | **BarChart** | |
| ⬜ | **AreaChart** | |
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
