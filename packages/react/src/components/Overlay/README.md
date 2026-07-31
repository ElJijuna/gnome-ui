Standalone backdrop/scrim layer with a fade transition and click-to-dismiss — the shared building block behind `Modal`, `Dialog`, and `BottomSheet`'s backdrops, extracted for building custom overlay UI.

```tsx
import { Overlay } from '@gnome-ui/react';

<Overlay open={open} onDismiss={() => setOpen(false)}>
  <MyCustomPanel />
</Overlay>
```

Deliberately minimal: no focus trap, no Escape handling, no dialog role. Use `Modal` or `Dialog` directly when you need a full modal — reach for `Overlay` when you're building something those don't cover (a lightbox, a custom dropdown panel, an image viewer).

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | — | Whether the overlay is visible (required) |
| `onDismiss` | `() => void` | — | Called when the backdrop itself — not its content — is clicked |
| `container` | `Element` | `document.body` | Portal mount target |
| `children` | `ReactNode` | — | Content positioned over the backdrop |

### Guidelines

- Clicks on `children` never trigger `onDismiss` — the check is `event.target === event.currentTarget`, so nested content doesn't need its own `stopPropagation()`.
- Locks body scroll while open and restores it on close.
- Respects `prefers-reduced-motion` — skips the fade and jumps straight to the open/closed state.
- Add your own `role`/`aria-*` attributes (via forwarded HTML attributes) and keyboard handling appropriate to what you're building — `Overlay` only manages the backdrop, not the semantics of its content.
