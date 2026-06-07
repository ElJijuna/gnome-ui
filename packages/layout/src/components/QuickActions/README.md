Grid of shortcut action buttons for dashboards, file managers, and control panels.

```tsx
import { QuickActions } from "@gnome-ui/layout";

<QuickActions
  actions={[
    { id: "new-file", label: "New File", icon: <AddIcon />, onActivate: createFile },
    { id: "share", label: "Share", icon: <ShareIcon />, onActivate: share },
  ]}
/>
```
