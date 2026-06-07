Mutually-exclusive group of toggle buttons for in-place option selection.

Mirrors `AdwToggleGroup` (libadwaita 1.7 / GNOME 48).

Use for formatting controls, alignment selectors, and toolbar view modes —
wherever a `ViewSwitcher` would be too heavy or doesn't belong in a HeaderBar.

- Items can be **icon-only**, **label-only**, or **icon + label**.
- For icon-only items, always provide an `aria-label` for screen readers.
- Keyboard: ← / → cycle through items, Home / End jump to first / last.
