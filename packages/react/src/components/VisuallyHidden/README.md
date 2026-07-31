Reusable "sr-only" utility — visually hides content while keeping it in the accessibility tree, so screen readers still announce it.

```tsx
import { VisuallyHidden } from '@gnome-ui/react';

<VisuallyHidden role="status" aria-live="polite">Copied to clipboard</VisuallyHidden>
<VisuallyHidden as="div" focusable>
  <a href="#main">Skip to content</a>
</VisuallyHidden>
```

Extracts the recipe previously duplicated inline inside `CopyButton`'s live-region announcement. Prefer this over `aria-hidden`/`display: none` when content should remain readable by assistive technology but not take up visual space — extra context for an icon-only control, a live-region status message, or a skip-link.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | Content to hide visually while keeping it in the accessibility tree |
| `as` | `ElementType` | `'span'` | Override the rendered HTML element |
| `focusable` | `boolean` | `false` | Restore normal layout when the element (or a focusable descendant) receives keyboard focus — the standard "sr-only-focusable" pattern used by skip-links |

### Guidelines

- Use `role="status"`/`aria-live="polite"` alongside plain hidden text for one-off announcements (e.g. "Copied!"); reserve `focusable` for content meant to become visible on keyboard focus, like a skip-link.
- `focusable` doesn't add any visual styling for the revealed state (background, padding, positioning) — apply your own via `className` so the revealed content is legible against the page.
