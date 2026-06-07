Sidebar-style view switcher for apps with many top-level views or when the
sidebar layout fits better than a header-bar `ViewSwitcher`.

Mirrors `AdwViewSwitcherSidebar` (libadwaita 1.9 / GNOME 50) — the modern
replacement for `GtkStackSidebar`.

### When to use
- More than 4 top-level views (where `ViewSwitcher` in a HeaderBar becomes cramped).
- Apps whose primary navigation is already sidebar-shaped (mail, files, contacts).
- When views need additional metadata like unread counts (`count`) or custom widgets (`suffix`).

### vs `Sidebar`
| | `Sidebar` | `ViewSwitcherSidebar` |
|---|---|---|
| Semantics | `nav` + `aria-current` | `radiogroup` + `aria-checked` |
| Keyboard | Tab between items | ↑ / ↓ within group |
| Use for | App-level navigation | Switching between views/pages |
