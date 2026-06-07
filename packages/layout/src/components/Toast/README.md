In-app notifications following the GNOME Human Interface Guidelines.

Toasts are **transient** messages shown at the bottom-center of the window.
They auto-dismiss after a configurable delay and support a single action button.
Use them for individual events, not for persistent or ongoing states — for those, use `Banner`.

## Setup

Wrap your app (or the relevant subtree) with `ToastProvider` once, then call
`useToast().show()` from any descendant:

```tsx
// main.tsx
import { ToastProvider } from "@gnome-ui/layout";

<ToastProvider>
  <App />
</ToastProvider>

// Anywhere inside the tree
import { useToast } from "@gnome-ui/layout";

const { show, dismiss } = useToast();
show({ title: "File saved", action: { label: "Undo", onClick: undo } });
```
