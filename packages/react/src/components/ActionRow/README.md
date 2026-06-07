Standard settings row with title, optional subtitle, leading icon, and trailing widget.

Mirrors the Adwaita `AdwActionRow` pattern — the fundamental building block inside a `BoxedList`.

### Guidelines
- Always provide a `title`. Use `subtitle` for secondary context (current value, description).
- Use `trailing` for the primary control: `Switch`, `Button`, a value label, or a chevron icon.
- Use `interactive` for rows that navigate or trigger an action (renders as `<button>`).
- Avoid putting interactive elements inside an `interactive` row — they create nested buttons.
- Wrap in `BoxedList` for the canonical GNOME settings appearance.
