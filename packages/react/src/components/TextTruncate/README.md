Single/multi-line text truncation with an automatic tooltip revealing the full content on overflow — mirrors `GtkLabel`'s `ellipsize` property.

```tsx
import { TextTruncate } from '@gnome-ui/react';

<TextTruncate>A very long file name that might not fit in the sidebar.txt</TextTruncate>
<TextTruncate lines={3}>A longer description that should clamp after three lines…</TextTruncate>
```

The tooltip only appears when the text is actually clipped — measured via `ResizeObserver`, so it stays accurate as the container is resized. Text that fits renders as plain, unwrapped content.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `string` | — | The text to display (required) |
| `lines` | `number` | `1` | Number of lines before truncating. `1` uses a single-line ellipsis; values above `1` clamp to that many lines |
| `tooltipPlacement` | `TooltipPlacement` | `"top"` | Tooltip placement when the text is truncated |

### Guidelines

- `children` must be a plain string — the same text is used both for display and as the tooltip's label.
- For a fixed-width container (e.g. a sidebar item, a table cell), wrap `TextTruncate` in an element with a defined `width`/`max-width`; truncation only kicks in once the content actually overflows its container.
