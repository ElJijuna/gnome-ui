Expandable option list following the Adwaita combo-row / drop-down style.

### Guidelines
- Use when the user must pick exactly one option from a list of 4 or more.
- For 2–3 options prefer **Radio Buttons** (all choices visible at once).
- Keep labels short — one to three words.
- Provide a meaningful `placeholder` that describes what to select.
- The list flips above the trigger when there is not enough space below.
- Keyboard: Space / Enter / ↓ opens; ↑↓ navigates; Enter selects; Escape closes.

### Flat style (libadwaita 1.10 / GNOME 51)
- **`flat`** — borderless trigger that only shows a hover background, for use in toolbars and dense layouts.
- Inside a `HeaderBar`, `Toolbar` or `ToolbarView` bar the dropdown is flat **automatically**.
- **`raised`** — keeps the regular trigger inside a toolbar (wins over `flat`).
- The same props are available on `MultiSelectDropdown` and `FilterableMultiSelectDropdown`.
