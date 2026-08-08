Visually hidden live region announcing a skeleton loading state to screen readers.

`aria-busy` alone is not announced by most screen readers, and `Skeleton`
placeholders are intentionally `aria-hidden` (they're visual filler, not
content) — `LoadingStatus` is the part that actually communicates
"Loading…" to assistive technology. Used internally by `StatCard`,
`EntityCard`, `ProfileCard`, `ChartCard`, `ActivityFeed`, and other cards'
loading states; reach for it directly in your own skeleton layouts too.

```tsx
import { LoadingStatus } from "@gnome-ui/layout";
import { Card, Skeleton } from "@gnome-ui/react";

<Card aria-busy="true">
  <LoadingStatus />
  <Skeleton variant="rect" width={150} height={34} />
</Card>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `"Loading…"` | Announcement read by screen readers |
