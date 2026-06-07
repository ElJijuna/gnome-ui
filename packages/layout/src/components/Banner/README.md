Persistent in-app message strip shown at the top of a view, following GNOME HIG banner guidelines.

Use banners to communicate **ongoing states** — offline mode, read-only access, pending updates.
They do not auto-dismiss. For individual events and short-lived messages, use `Toast` instead.

```tsx
import { Banner } from "@gnome-ui/layout";

<Banner type="warning" action={{ label: "Reconnect", onClick: retry }}>
  Working offline — changes will sync when you reconnect
</Banner>
```
