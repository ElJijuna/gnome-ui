Standalone disclosure triangle + collapsible content — mirrors `GtkExpander`.

```tsx
import { Expander } from '@gnome-ui/react';

<Expander label="Show advanced options">
  <TextField label="Custom endpoint" />
</Expander>
```

A bare, unstyled counterpart to `ExpanderRow`, which is a `BoxedList`-row variant with title/subtitle/leading/trailing slots and a card look. Use `Expander` outside a settings-row context — e.g. "Show advanced options" in a form, or "Show details" under an error message.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `ReactNode` | — | Clickable header label (required) |
| `children` | `ReactNode` | — | Content revealed when expanded |
| `expanded` | `boolean` | — | Controlled expanded state |
| `defaultExpanded` | `boolean` | `false` | Initial expanded state when uncontrolled |
| `onExpandedChange` | `(expanded: boolean) => void` | — | Called when the expanded state changes |
| `disabled` | `boolean` | `false` | Disables the toggle |

### Guidelines

- Use for optional, secondary content that most users won't need — advanced settings, verbose error details, raw data.
- For a settings-list row with title/subtitle and nested rows, use `ExpanderRow` instead.
- Content stays mounted in the DOM while collapsed (revealed via a CSS grid-height animation), so state inside it isn't lost when toggled.
