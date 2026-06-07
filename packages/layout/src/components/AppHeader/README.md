GNOME application header with named shell slots.

Mirrors `AdwHeaderBar` — renders a sticky top bar with `leading`, `title`/`subtitle`, `navigation`, `search`, and `actions` slots. Place at the top of `Layout` or directly in a page shell.

```tsx
import { AppHeader } from '@gnome-ui/layout';
import { Button, SearchBar } from '@gnome-ui/react';

<AppHeader
  title="Files"
  subtitle="Home"
  leading={<Button variant="flat" aria-label="Toggle sidebar">☰</Button>}
  actions={<Button variant="flat">New Folder</Button>}
/>
```

### With navigation and search

```tsx
<AppHeader
  title="Documents"
  navigation={
    <ViewSwitcher aria-label="Document view">
      <ViewSwitcherItem label="Recent" active />
      <ViewSwitcherItem label="Starred" />
    </ViewSwitcher>
  }
  search={<SearchBar inline open placeholder="Search documents" aria-label="Search documents" />}
/>
```

### Props

| Prop | Type | Description |
|------|------|-------------|
| `title` | `string` | Primary window/page title |
| `subtitle` | `string` | Secondary label shown below title |
| `leading` | `ReactNode` | Left slot (back button, sidebar trigger) |
| `navigation` | `ReactNode` | Center slot (view switcher, tabs) |
| `search` | `ReactNode` | Inline search bar |
| `actions` | `ReactNode` | Right slot (action buttons, menu) |

### Guidelines

- Use `SidebarTrigger` in the `leading` slot to wire sidebar collapse/open.
- Place `ViewSwitcher` in `navigation` for multi-view apps.
- Avoid putting more than 2–3 actions in the `actions` slot; use a menu for overflow.
