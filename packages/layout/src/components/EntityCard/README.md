Avatar/icon + title + meta card. Covers both compact grid cards (Following screen)
and full-width list rows (MyApps screen) via additive optional props.

```tsx
import { EntityCard } from "@gnome-ui/layout";
import { IconBadge } from "@gnome-ui/layout";

<EntityCard
  avatar={<IconBadge color="blue" size="md">🌤</IconBadge>}
  title="GNOME Weather"
  subtitle="@alice_dev"
  meta={["v4.8.0", "⭐ 203"]}
/>
```
