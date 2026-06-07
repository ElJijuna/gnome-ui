Chronological list of recent events with relative timestamps, optional icons,
skeleton loading state, and a "Show more" affordance.

```tsx
import { ActivityFeed } from "@gnome-ui/layout";

<ActivityFeed
  items={[
    { id: "1", label: "File uploaded", timestamp: new Date() },
  ]}
  maxItems={5}
/>
```
