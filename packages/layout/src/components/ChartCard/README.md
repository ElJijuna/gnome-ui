# ChartCard

Structured card shell for dashboard charts.

`ChartCard` provides a consistent header, optional metric/trend, action slot,
chart body, footer, and loading/empty/error states. It intentionally accepts
`children` for the visualization so it can wrap `@gnome-ui/charts` components,
SVGs, tables, or custom graphics without depending on a charting library.

```tsx
import { ChartCard } from '@gnome-ui/layout';
import { LineChart } from '@gnome-ui/charts';

<ChartCard
  title="Sessions"
  subtitle="Last 30 days"
  value={12840}
  trend={{ direction: 'up', value: 12, period: 'vs last month' }}
  actions={<button type="button">Export</button>}
>
  <LineChart data={data} series={series} xAxisKey="day" />
</ChartCard>;
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `ReactNode` | — | Card title |
| `subtitle` | `ReactNode` | — | Supporting text under the title |
| `value` | `number \| string` | — | Primary metric in the header |
| `unit` | `string` | — | Unit suffix next to `value` |
| `trend` | `StatCardTrend` | — | Directional percentage trend |
| `actions` | `ReactNode` | — | Header actions |
| `children` | `ReactNode` | — | Chart body |
| `footer` | `ReactNode` | — | Footer/status content |
| `loading` | `boolean` | `false` | Show loading placeholder |
| `loadingType` | `"skeleton" \| "spinner"` | `"skeleton"` | Loading visual |
| `error` | `ReactNode` | — | Error content shown instead of chart |
| `empty` | `ReactNode` | — | Empty content shown instead of chart |
| `chartHeight` | `number \| string` | `220` | Minimum chart body height |

## Notes

- Numeric `value` and trend values use `GnomeProvider` number formatting.
- `error` takes precedence over `empty`.
- Keep chart-specific controls in `actions`; keep explanatory metadata in
  `footer`.
