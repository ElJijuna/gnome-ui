Compact footer/status bar for application shells.

Renders a thin bar at the bottom of the layout. Accepts arbitrary children for the leading side and a `trailing` slot for right-aligned content (version strings, connection status, etc.).

```tsx
import { StatusBar } from '@gnome-ui/layout';
import { Text } from '@gnome-ui/react';

<StatusBar
  trailing={
    <Text variant="caption" color="dim">
      GNOME Files 48.0
    </Text>
  }
>
  <Text variant="caption" color="dim">
    1,248 items
  </Text>
</StatusBar>
```

### Guidelines

- Place in the `footer` slot of `Layout`.
- Keep content concise — captions and short status strings only.
- Use `color="dim"` on `Text` to match the subtle status bar aesthetic.
