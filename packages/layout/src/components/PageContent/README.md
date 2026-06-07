Page content container with GNOME spacing and optional width clamping.

Centers content within the viewport, applies consistent horizontal padding, and optionally clamps the maximum content width. Use inside the main content area of `Layout`.

```tsx
import { PageContent } from '@gnome-ui/layout';
import { Text } from '@gnome-ui/react';

// Clamped to a readable width
<PageContent maxWidth="md">
  <Text variant="title-2">Settings</Text>
</PageContent>

// Full-width with spacious padding
<PageContent maxWidth="none" padding="spacious">
  <Text variant="title-2">Dashboard</Text>
</PageContent>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `maxWidth` | `"sm" \| "md" \| "lg" \| "xl" \| "none"` | `"lg"` | Maximum content width |
| `padding` | `"default" \| "spacious"` | `"default"` | Horizontal padding size |
| `as` | `ElementType` | `"div"` | Override the rendered HTML element |

### Guidelines

- Use `maxWidth="md"` for settings pages and forms — matches GNOME HIG readable line length.
- Use `maxWidth="none"` for dashboards and full-bleed data views.
- Nest inside `Layout`'s main area or directly inside a scrollable container.
