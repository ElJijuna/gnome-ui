Modal dialog listing keyboard shortcuts grouped in sections, with integrated search.

Mirrors `AdwShortcutsDialog` (libadwaita 1.8 / GNOME 49) — the modern replacement for `GtkShortcutsWindow`.

- Search filters across all sections in real time (by description or key name).
- Renders into a portal; traps focus; Escape closes.
- Pass `sections` as a plain data array — no JSX needed for the shortcut entries.
