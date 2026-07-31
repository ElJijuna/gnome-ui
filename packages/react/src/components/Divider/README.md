Horizontal rule with an optional centred label — common auth/login-form pattern.

```tsx
import { Divider } from '@gnome-ui/react';

<Divider>OR</Divider>
<Divider>Continue with</Divider>
<Divider />
```

### Divider vs Separator

| | Content slot | Orientation |
|---|---|---|
| `Separator` | None — a bare dividing line | Horizontal or vertical |
| `Divider` | Optional centred label | Horizontal only |

Use `Separator` for structural dividers inside lists (`BoxedList`, `ExpanderRow`) or between toolbar sections. Use `Divider` specifically when you need a labelled break — most commonly "OR" between two sign-in methods.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | Optional centred label |

### Guidelines

- Without `children`, renders as a single full-width line — functionally equivalent to a horizontal `Separator`. Prefer `Separator` in that case for clarity.
- The accessible name is set automatically from a string label; pass a non-string `children` (e.g. an icon + text) and it will still render visually, but consider adding your own `aria-label` in that case.
