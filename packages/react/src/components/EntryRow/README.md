Row with an inline text entry field.

Mirrors `AdwEntryRow` — the `title` acts as a floating label that rises above the
input when the field is focused or has content. Use inside a `BoxedList` for
settings that require free-form text input.

### Guidelines
- Use `title` as the label, not as a placeholder — it is always visible.
- Add `trailing` widgets for actions like copy, clear, or reveal-password.
- For passwords, set `type="password"` and provide a trailing reveal button.
- Supports controlled (`value`) and uncontrolled (`defaultValue`) modes.
