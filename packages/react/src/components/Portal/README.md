Reusable `createPortal` wrapper — SSR-safe (renders `children` inline when `document` is unavailable) with optional mount-target support.

```tsx
import { Portal } from '@gnome-ui/react';

<Portal>
  <div role="alert">Rendered at the end of document.body</div>
</Portal>

<Portal container={someElement}>
  <div>Rendered inside someElement instead</div>
</Portal>
```

Extracts the ad-hoc portal logic previously duplicated independently across `Dialog`, `Modal`, `Popover`, `Tooltip`, `BottomSheet`, and other floating-content components, each of which re-implemented the same `typeof document === 'undefined'` check inline.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | Content to render into the target container |
| `container` | `Element \| DocumentFragment` | `document.body` | DOM node to portal into |

### Guidelines

- Use `Portal` for floating UI (dropdowns, tooltips, dialogs, toasts) that needs to escape an ancestor's `overflow: hidden` or `z-index` stacking context.
- During server-side rendering, `document` doesn't exist — `Portal` detects this and renders `children` inline instead of throwing, so components built on it stay SSR-safe without extra guards at the call site.
