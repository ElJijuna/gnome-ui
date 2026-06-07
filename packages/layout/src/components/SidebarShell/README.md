Full-height GNOME sidebar with fixed header/footer and scrollable navigation area.

Wraps `@gnome-ui/react`'s `Sidebar` with named slots for a sticky `header`, scrollable `children`, and a fixed `footer`. Supports collapsed rail mode and an optional search bar.

```tsx
import { SidebarShell } from '@gnome-ui/layout';
import { Button, SidebarItem, SidebarSection, Text } from '@gnome-ui/react';
import { GoHome, Settings, Star } from '@gnome-ui/icons';

<SidebarShell
  header={<Text variant="heading">Files</Text>}
  footer={<Button variant="flat" style={{ width: '100%' }}>Preferences</Button>}
  aria-label="Files navigation"
>
  <SidebarSection>
    <SidebarItem label="Home" icon={GoHome} active />
    <SidebarItem label="Starred" icon={Star} />
    <SidebarItem label="Settings" icon={Settings} />
  </SidebarSection>
</SidebarShell>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `header` | `ReactNode` | — | Sticky top area (app name, avatar…) |
| `footer` | `ReactNode` | — | Fixed bottom area (account, preferences…) |
| `collapsed` | `boolean` | `false` | Render as a narrow icon rail |
| `searchable` | `boolean` | `false` | Show an inline search bar to filter items |

### Guidelines

- Use with `SidebarTrigger` in `AppHeader` to wire open/collapse state.
- Wrap in `SidebarShellContext` if you need to share sidebar state across the layout.
