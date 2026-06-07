Header button that opens overlay sidebars on narrow screens and toggles rail collapse on wider screens.

Renders the appropriate icon based on the current sidebar state (`open`, `collapsed`). Designed to be placed in the leading slot of `AppHeader`.

```tsx
import { SidebarTrigger } from '@gnome-ui/layout';

const [open, setOpen] = useState(false);
const [collapsed, setCollapsed] = useState(false);

<SidebarTrigger
  sidebarOpen={open}
  sidebarCollapsed={collapsed}
  onSidebarOpenChange={setOpen}
  onSidebarCollapsedChange={setCollapsed}
/>
```

### Guidelines

- Use inside `AppHeader`'s `leading` slot alongside a `SidebarShell`.
- On mobile breakpoints, `open/onSidebarOpenChange` controls an overlay drawer.
- On desktop breakpoints, `collapsed/onSidebarCollapsedChange` controls rail vs. full width.
