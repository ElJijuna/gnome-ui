Single-line text input with label, helper text, and error state.

Follows the Adwaita `GtkEntry` / `.entry` style class.

### Guidelines
- Always provide a `label` — it is the primary accessible name for the input.
- Use `helperText` for formatting hints or constraints (e.g. "Must be at least 8 characters").
- Replace `helperText` with `error` to communicate validation failure — never show both.
- Show errors only after the user has interacted (on blur or on submit), not while typing.
- Keep labels short and in sentence case ("Full name", not "Full Name").
