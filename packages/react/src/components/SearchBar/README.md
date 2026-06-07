Collapsible search bar following the Adwaita `AdwSearchBar` pattern.

### Guidelines
- Toggle visibility with the `open` prop — the bar slides in/out with a CSS transition.
- Place it directly below a `HeaderBar` (the canonical GNOME pattern).
- Pass `onClose` to handle Escape key and any "close search" trigger in your UI.
- Use `onClear` to reset the search query when the × button is clicked.
- The input auto-focuses when `open` becomes `true`.
- Optional `children` render a filter-chip row below the input.
