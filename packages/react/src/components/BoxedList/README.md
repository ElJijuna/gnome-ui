Rounded bordered list — the most common container pattern in GNOME settings and detail views.

Mirrors the Adwaita `.boxed-list` style class on `GtkListBox`.

### Guidelines
- Use to group a set of related settings or items inside a view.
- Separators between rows are inserted automatically.
- Pair with `ActionRow` for the canonical GNOME settings pattern.
- Keep lists focused: 3–8 rows is typical. Split long lists into labelled sections.
- Don't nest `BoxedList` inside another `BoxedList`.
