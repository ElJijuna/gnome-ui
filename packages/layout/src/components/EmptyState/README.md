Centered empty-state illustration for views with no data.

No card background or border — intended to fill its parent container.

```tsx
import { EmptyState } from "@gnome-ui/layout";
import { Icon } from "@gnome-ui/react";
import { Folder } from "@gnome-ui/icons";

<EmptyState
  icon={<Icon icon={Folder} size="lg" />}
  title="No files yet"
  description="Files you add will appear here."
  action={<Button variant="suggested">Add File</Button>}
/>
```
