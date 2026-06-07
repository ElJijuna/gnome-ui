Sidebar + content layout where the sidebar becomes a slide-over **overlay** on narrow screens (≤ 400 px), mirroring `AdwOverlaySplitView`.

- **Wide (> 400 px):** sidebar and content are side-by-side. `showSidebar` is ignored.
- **Narrow (≤ 400 px):** content fills full width; sidebar slides in as an overlay when `showSidebar` is true.

### Guidelines
- Use when the sidebar is contextual and not always needed (e.g. document outline, filters).
- A hamburger / menu button in the HeaderBar typically toggles it on narrow screens.
- Backdrop click and Escape close the overlay. Provide an `onClose` handler.
- Prefer `NavigationSplitView` for primary list → detail navigation.
