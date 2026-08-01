Read-only `TextField` with a built-in trailing `CopyButton`, for displaying copyable values (API keys, tokens, IDs) outside the `CveIdentifier`/`CweIdentifier`-style specialised components.

```tsx
import { CopyField } from '@gnome-ui/react';

<CopyField label="API key" value="sk-live-4242424242424242" />
<CopyField label="Webhook URL" value="https://example.com/hooks/abc123" monospace={false} />
```

The field is `readOnly`, not `disabled` — its text remains selectable for manual copy in addition to the button.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | — | The value displayed in the field and copied to the clipboard |
| `label` | `string` | — | Visible label rendered above the field |
| `helperText` | `string` | — | Helper text below the field, hidden when `error` is set |
| `error` | `string` | — | Error message shown in place of `helperText`; also applies the error border |
| `copyLabel` | `string` | `"Copy"` | Accessible label and tooltip for the copy button before copying |
| `copiedLabel` | `string` | `"Copied!"` | Accessible label and tooltip after a successful copy |
| `monospace` | `boolean` | `true` | Render the value in a monospace font — useful for tokens, keys, and IDs |

### Guidelines

- Always provide a `label` — it is the primary accessible name for the field.
- Set `monospace={false}` for values that read better in a proportional font, such as URLs or plain identifiers with mixed casing intended for reading rather than character-by-character verification.
- Use `error` to communicate a revoked/expired value rather than a validation failure — since the field is read-only, there's nothing for the user to correct.
