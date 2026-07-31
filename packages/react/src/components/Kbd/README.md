Standalone single key-cap for inline instructional text.

```tsx
import { Kbd } from '@gnome-ui/react';

<p>Press <Kbd>Enter</Kbd> to continue.</p>
<p>Hold <Kbd>Shift</Kbd> while dragging to select multiple files.</p>
```

Complements `ShortcutLabel`, which only renders full `+`-delimited combos (`"Ctrl+S"`) and doesn't expose its per-key styling on its own — use `Kbd` when referencing a single key outside of a shortcut combo.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `string` | — | The key name (e.g. `"Enter"`, `"Esc"`, `"A"`) |
| `symbols` | `boolean` | `true` | Normalise common key names to their Unicode symbol (e.g. `"Enter"` → `↵`). Matches `ShortcutLabel`'s mapping |

### Guidelines

- Set `symbols={false}` when the raw key name reads more clearly in prose than its glyph (e.g. `"Esc"` is often clearer than `⎋` in a help article).
- When a symbol is substituted, `Kbd` sets `aria-label` to the original key name so screen readers announce `"Enter"` rather than the glyph.
