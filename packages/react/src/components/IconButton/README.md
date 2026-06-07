Icon-only action button composed from `Button`, `Icon`, and optionally `Tooltip`.

`label` is required as the accessible name since the button has no visible text. Optionally pass `tooltip` to show it on hover/focus.

```tsx
import { Search, Settings } from '@gnome-ui/icons';
import { IconButton } from '@gnome-ui/react';

<IconButton icon={Search} label="Search" />
<IconButton icon={Settings} label="Settings" variant="flat" tooltip="Open settings" />
```

### Variants

| Variant | Use case |
|---------|----------|
| `default` | Standard toolbar action |
| `suggested` | Primary recommended action |
| `destructive` | Irreversible action (delete, remove) |
| `flat` | Low-emphasis, no background |
| `raised` | Elevated surface (floating button) |
| `osd` | On-screen display overlay (media controls) |

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `IconDefinition` | — | Icon from `@gnome-ui/icons` |
| `label` | `string` | — | Accessible name (required) |
| `variant` | `IconButtonVariant` | `"default"` | Visual style |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Button size |
| `iconSize` | `IconSize` | matches `size` | Override icon size independently |
| `tooltip` | `string` | — | Tooltip text shown on hover/focus |
| `tooltipPlacement` | `TooltipPlacement` | `"top"` | Preferred tooltip position |
| `tooltipDelay` | `number` | — | Tooltip delay in ms |

### Guidelines

- Always provide a descriptive `label` — it is the only accessible name.
- Use `tooltip` to expose the label visually when context is ambiguous.
- Use `osd` variant for media overlays on dark or blurred backgrounds.
