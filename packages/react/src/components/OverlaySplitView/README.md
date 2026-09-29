Sidebar + content layout where the sidebar becomes a slide-over **overlay** on narrow screens (≤ 400 px), mirroring `AdwOverlaySplitView`.

- **Wide (> 400 px):** sidebar and content are side-by-side. `showSidebar` is ignored.
- **Narrow (≤ 400 px):** content fills full width; sidebar slides in as an overlay when `showSidebar` is true.

### Guidelines
- Use when the sidebar is contextual and not always needed (e.g. document outline, filters).
- A hamburger / menu button in the HeaderBar typically toggles it on narrow screens.
- Backdrop click and Escape close the overlay. Provide an `onClose` handler.
- Prefer `NavigationSplitView` for primary list → detail navigation.

### Styling the overlay sidebar (libadwaita 1.10 / GNOME 51)
While the sidebar is shown as an overlay (narrow screens) its pane carries a
`data-overlay` attribute; the docked sidebar on wide screens does not. Use it
to style the two states differently:

```css
.my-app [data-overlay] {
  box-shadow: 0 0 24px rgb(0 0 0 / 0.2);
}
```

Mirrors the overlay-sidebar style class `AdwOverlaySplitView` adds in libadwaita 1.10.
