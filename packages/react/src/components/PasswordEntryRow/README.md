Password entry row with a built-in reveal/conceal toggle.

Mirrors `AdwPasswordEntryRow` — an `EntryRow` variant that defaults to
`type="password"` and provides a trailing icon button to show or hide the
entered text. Use inside a `BoxedList` for password settings fields.

### Guidelines
- Use `title` as the floating label (e.g. "Password", "Confirm Password").
- The reveal button is always present; do not replicate it via `trailing`.
- Supports controlled (`value`) and uncontrolled (`defaultValue`) modes.
