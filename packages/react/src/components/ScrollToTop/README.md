Fixed-position button that scrolls the page to the top on click, following the GNOME Human Interface Guidelines.

### Guidelines

- Use `visible="auto"` (default) to show the button only after the user has scrolled far enough to benefit from it.
- Use `visible="always"` sparingly — only when continuous access to the top is part of the page's core interaction model.
- The button is semi-transparent at rest and fully opaque on hover or focus to avoid obscuring content beneath it.
- The default position is `"bottom-right"` with 24 px edge clearance matching `--gnome-space-4`.
- Pair with a `scrollTarget` when your scrollable container is an element other than `window` (e.g. a drawer or split-view pane).
