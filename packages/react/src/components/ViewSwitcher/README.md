Segmented control for switching between major views, mirroring the Adwaita `AdwViewSwitcher`.

Two components:
- **`ViewSwitcher`** — the pill-shaped container with `role="radiogroup"` and roving-tabindex keyboard navigation.
- **`ViewSwitcherItem`** — individual option with `role="radio"` and optional icon.

### Guidelines
- Use for 2–4 top-level views that are parallel (not sequential).
- Prefer placing it as the `title` of a `HeaderBar` — the canonical GNOME pattern.
- For more than 4 options, use **Tabs** or a **Sidebar** instead.
- Do not use for settings that have side-effects; use **Switch** for that.
- Keyboard: ← / → (or ↑ / ↓) cycle through items and activate them immediately.
