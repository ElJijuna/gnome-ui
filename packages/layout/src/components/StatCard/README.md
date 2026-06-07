Metric card for dashboards with optional unit, trend indicator, icon, background chart, and loading state.

```tsx
import { StatCard } from "@gnome-ui/layout";

<StatCard
  label="Active Users"
  value={1284}
  unit="users"
  trend={{ direction: "up", value: 12, period: "vs last week" }}
/>
```

Pass a spark chart as a decorative background without coupling the card to a
specific chart type:

```tsx
<StatCard
  label="Requests"
  value="24.8k"
  backgroundChart={<SparkAreaChart data={requestTrend} height={96} />}
/>
```
