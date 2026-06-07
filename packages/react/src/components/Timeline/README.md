Ordered sequence of events connected by a visual timeline.

Supports two orientations — **vertical** (activity feed, history log) and
**horizontal** (stepper, progress indicator) — and three connector styles.

```tsx
import { Timeline } from "@gnome-ui/react";

<Timeline
  items={[
    {
      leading: <Text variant="caption" color="dim">10:32</Text>,
      icon: <Icon icon={Check} />,
      content: <Text variant="body">Document approved</Text>,
    },
  ]}
/>
```
