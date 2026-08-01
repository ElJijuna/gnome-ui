Two or more panels separated by a draggable divider, based on the `GtkPaned`
pattern. Foundational for user-resizable master-detail layouts (code editors,
file explorers, analytics dashboards).

```tsx
import { ResizablePanel } from "@gnome-ui/layout";

<ResizablePanel direction="horizontal" defaultSizes={[30, 70]}>
  <FileTree />
  <Editor />
</ResizablePanel>
```

Implements the WAI-ARIA "window splitter" pattern: each divider is a
`role="separator"` with `aria-orientation` and `aria-valuenow`, focusable
and resizable with the arrow keys in addition to pointer drag.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | Two or more panels, each rendered as one resizable region |
| `direction` | `"horizontal" \| "vertical"` | `"horizontal"` | Layout direction |
| `defaultSizes` | `number[]` | equal split | Initial size of each panel as a percentage. Falls back to an equal split when its length doesn't match the number of panels |
| `minSize` | `number` | `10` | Minimum size any panel can be resized to, as a percentage |
| `onResize` | `(sizes: number[]) => void` | — | Called with the updated sizes while dragging |

### Guidelines

- Dragging a divider only ever resizes the two panels immediately adjacent to it — resizing one pair never affects panels further away.
- Sizes are uncontrolled — pass `defaultSizes` to set the initial split and read `onResize` if you need to persist the user's chosen layout.
