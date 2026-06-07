Breadcrumb path bar for navigating a hierarchical location.

Mirrors the location bar in **GNOME Files (Nautilus)**. Segments are separated
by chevron dividers. All segments except the last are interactive — clicking
them calls `onNavigate`. The last segment represents the current location and
is rendered as a bold, non-interactive label.

```tsx
import { PathBar } from "@gnome-ui/react";

<PathBar
  segments={[
    { label: "Home",      path: "/home"                     },
    { label: "Documents", path: "/home/documents"           },
    { label: "Projects",  path: "/home/documents/projects"  },
  ]}
  onNavigate={(path) => navigate(path)}
/>
```
