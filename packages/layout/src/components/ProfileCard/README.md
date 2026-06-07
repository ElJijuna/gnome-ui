Dashboard card for displaying a user profile — avatar, name, handle, optional status dot, optional stats row, and an optional decorative background chart.

```tsx
import { ProfileCard } from "@gnome-ui/layout";

<ProfileCard
  name="rcronald"
  username="@rcronald"
  status="online"
  stats={[
    { label: "posts", value: 127 },
    { label: "followers", value: "2.4k" },
  ]}
/>
```

Pass any `ReactNode` as `backgroundChart` — e.g. a `SparkAreaChart` from `@gnome-ui/charts`:

```tsx
<ProfileCard
  name="rcronald"
  username="@rcronald"
  backgroundChart={<SparkAreaChart data={activityData} height={80} />}
/>
```
