Rounded-square tinted icon container. Accepts the seven gnome-ui named colors or any hex value (`#rgb` / `#rrggbb`). In both cases the background is rendered at 15% opacity via `color-mix`.

```tsx
import { IconBadge } from "@gnome-ui/layout";

<IconBadge color="blue" size="lg">🚀</IconBadge>
<IconBadge color="#6c8ebf" size="md"><Icon icon={GoHome} /></IconBadge>
<IconBadge size="sm">📄</IconBadge>
```
