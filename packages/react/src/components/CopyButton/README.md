Icon button that copies a value to the clipboard, swapping to a checkmark and a "Copied!" tooltip as confirmation.

```tsx
import { CopyButton } from '@gnome-ui/react';

<CopyButton value="CVE-2024-3094" label="Copy CVE ID" />
```

Built on `IconButton`, so it accepts the same `variant`, `size`, and other button props. Writes via `navigator.clipboard.writeText` — no `@gnome-ui/platform` dependency required.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | — | Text copied to the clipboard (required) |
| `label` | `string` | `"Copy"` | Accessible label / tooltip before copying |
| `copiedLabel` | `string` | `"Copied!"` | Accessible label / tooltip after a successful copy |
| `resetDelay` | `number` | `2000` | Milliseconds before reverting to `label` |
| `onCopied` | `(value: string) => void` | — | Called after a successful copy |
| `onCopyError` | `(error: unknown) => void` | — | Called if the Clipboard API is unavailable or the write is rejected |

Plus any `IconButtonProps` other than `icon`, `label`, `onClick`, and `tooltip` (e.g. `variant`, `size`, `disabled`).

### Guidelines

- Pass a specific `label` (e.g. `"Copy CVE ID"`) when the copied value's context isn't obvious from surrounding content.
- The copied confirmation is also announced to screen readers via a live region, independent of hover/focus.
