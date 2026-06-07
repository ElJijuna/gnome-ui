Card with a structured **header / body / footer** layout and built-in
collapse/expand behaviour.

The expanded state lives inside the component. Use a `ref` to drive it
imperatively from the outside:

```tsx
import { useRef } from "react";
import { PanelCard } from "@gnome-ui/layout";
import type { PanelCardHandle } from "@gnome-ui/layout";

const ref = useRef<PanelCardHandle>(null);

<button onClick={() => ref.current?.toggle()}>Toggle</button>

<PanelCard
  ref={ref}
  icon={<Icon icon={DocumentOpen} />}
  title="My Panel"
  headerActions={<Button variant="flat">Edit</Button>}
  onExpandedChange={(open) => console.log(open)}
  footer={<Text variant="caption" color="dim">Saved 2 min ago</Text>}
  footerActions={<Button variant="suggested">Save</Button>}
>
  Panel body content
</PanelCard>
```
