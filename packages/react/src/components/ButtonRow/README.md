Full-width activatable row styled as a button inside a `BoxedList`.

Mirrors `AdwButtonRow` — use when an entire list row should trigger a single
action with a centered label. Supports `suggested` and `destructive` variants
that colour the title text accordingly.

### Guidelines
- Always wrap in `BoxedList` for the canonical GNOME settings appearance.
- Use `suggested` for primary affirmative actions (e.g. "Save", "Apply").
- Use `destructive` for irreversible or dangerous actions (e.g. "Delete Account").
- Use `leading` / `trailing` for optional icons flanking the label.
- Prefer `ActionRow` with `interactive` when the row needs title + subtitle layout.
