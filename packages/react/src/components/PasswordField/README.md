Single-line password input with a peek toggle that reveals the value as plain text.

Mirrors `GtkPasswordEntry` (and its built-in peek icon), as opposed to `TextField` with `type="password"`, which has no reveal affordance.

```tsx
import { PasswordField } from '@gnome-ui/react';

<PasswordField label="Password" helperText="Must be at least 8 characters." />
<PasswordField label="Confirm password" error="Passwords do not match." />
<PasswordField label="PIN" revealable={false} />
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Visible label rendered above the input |
| `helperText` | `string` | — | Helper text below the input, hidden when `error` is set |
| `error` | `string` | — | Error message shown in place of `helperText`; also applies the error border |
| `revealable` | `boolean` | `true` | Show the peek toggle button that reveals the password as plain text |
| `revealLabel` | `string` | `"Show password"` | Accessible label for the toggle while the password is hidden |
| `concealLabel` | `string` | `"Hide password"` | Accessible label for the toggle while the password is revealed |

### Guidelines

- Always provide a `label` — it is the primary accessible name for the input.
- The toggle button is `type="button"` so it never submits an enclosing `<form>`.
- Set `revealable={false}` for high-security fields (e.g. a PIN pad) where the value should never be displayable.
- Show errors only after the user has interacted (on blur or on submit), not while typing.
