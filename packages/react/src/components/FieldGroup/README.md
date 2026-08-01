Generic form-field grouping with a shared label, help text, and error message, for arbitrary fields outside a `BoxedList`.

```tsx
import { FieldGroup, RadioButton } from '@gnome-ui/react';

<FieldGroup label="Notification method" helperText="Choose how you want to be notified.">
  <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <RadioButton name="notify" value="email" /> Email
  </label>
  <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <RadioButton name="notify" value="sms" /> SMS
  </label>
</FieldGroup>
```

`PreferencesGroup` is scoped specifically to wrapping settings rows inside a `BoxedList` — use `FieldGroup` for a plain `<fieldset>`/`<legend>` grouping around any set of related form controls (e.g. a radio group or several checkboxes sharing one label and error), independent of the settings-page layout.

Renders a native `<fieldset>`, so `disabled` automatically disables every descendant form control for free — no need to thread it through manually.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Group heading, rendered as the `<legend>` (required) |
| `helperText` | `string` | — | Helper text below the label, hidden when `error` is set |
| `error` | `string` | — | Error message shown in place of `helperText`, announced via `role="alert"` |
| `disabled` | `boolean` | `false` | Disables the `<fieldset>` and every descendant form control |
| `children` | `ReactNode` | — | The grouped fields |

### Guidelines

- Prefer `FieldGroup` over a plain `<div>` wrapper whenever several related controls (radios, checkboxes, a custom composite field) need one shared label and error — it gives you correct `<fieldset>`/`<legend>` semantics for free.
- Show `error` only after the user has interacted with the group (on blur or on submit), not while they're still making a first selection.
