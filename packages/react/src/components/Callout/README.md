Inline, dismissible admonition box for contextual help text within forms and cards.

```tsx
import { Callout } from '@gnome-ui/react';

<Callout>Changes are saved automatically.</Callout>
<Callout variant="warning">This action can't be undone.</Callout>
<Callout variant="tip">Press Ctrl+K to open the command palette.</Callout>
```

### Callout vs Banner vs Toast

| | Placement | Lifetime |
|---|---|---|
| `Callout` | Inline, alongside the content it annotates | Persistent until dismissed |
| `Banner` | Edge-to-edge strip at the top of a view | Persistent until dismissed or the condition resolves |
| `Toast` | Floating, overlaid on content | Temporary — auto-dismisses |

Use `Callout` for documentation-style notes inside a form, dialog, or card. Use `Banner` for view-level conditions (an outage, an update available). Use `Toast` for a brief confirmation of something that just happened.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | The message content (required) |
| `variant` | `"info" \| "warning" \| "tip"` | `"info"` | Visual emphasis |
| `dismissible` | `boolean` | `false` | Shows a dismiss (×) button |
| `onDismiss` | `() => void` | — | Called when the dismiss button is clicked |

### Guidelines

- Renders as `role="note"` — a static annotation, not a live region. If the callout appears dynamically in response to a live event, consider `Banner` or `Toast` instead.
- `dismissible` only renders the button — you're responsible for removing the `Callout` from the tree in `onDismiss` (it doesn't manage its own visibility).
