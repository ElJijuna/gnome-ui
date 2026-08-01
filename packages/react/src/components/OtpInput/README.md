Segmented PIN/verification-code input — one cell per digit, with auto-advance on typing, backspace-to-previous-cell, and paste support.

```tsx
import { useState } from 'react';
import { OtpInput } from '@gnome-ui/react';

const [code, setCode] = useState('');

<OtpInput
  label="Verification code"
  value={code}
  onChange={setCode}
  onComplete={(fullCode) => verify(fullCode)}
/>
```

Common auth pattern, pairs naturally with `PasswordEntryRow`/`PasswordField` for a two-factor confirmation step following a password entry.

- Typing a digit advances focus to the next cell automatically.
- Backspace clears the current cell, or the previous cell (and moves focus back to it) if the current one is already empty.
- ←/→ move focus between cells without changing their value.
- Pasting a full code into any cell distributes its digits across that cell and the ones after it.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | — | Current value — a string of up to `length` digits |
| `onChange` | `(value: string) => void` | — | Called whenever the value changes |
| `onComplete` | `(value: string) => void` | — | Called once, when the value reaches `length` digits |
| `length` | `number` | `6` | Number of digit cells |
| `masked` | `boolean` | `false` | Obscure entered digits like a password field |
| `label` | `string` | — | Visible label, rendered as the group's `<legend>` |
| `helperText` | `string` | — | Helper text below the label, hidden when `error` is set |
| `error` | `string` | — | Error message shown in place of `helperText` |
| `disabled` | `boolean` | `false` | Disables every cell |
| `autoFocus` | `boolean` | `false` | Autofocus the first cell on mount |

### Guidelines

- Non-digit input is filtered automatically — only digits 0–9 are accepted, matching typical SMS/email verification codes.
- `onComplete` only fires on the transition into a complete value (e.g. right after the user types the last digit or pastes a full code) — it does not re-fire if the component re-renders with an already-complete `value`.
- Set `masked` for higher-sensitivity codes (e.g. a PIN used for account recovery) where the digits shouldn't be visible over someone's shoulder.
