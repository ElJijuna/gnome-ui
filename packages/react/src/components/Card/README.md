Card component following the [GNOME HIG containers](https://developer.gnome.org/hig/patterns/containers.html) and the Adwaita `.card` style class.

### Guidelines
- Use cards to group related content on an elevated surface.
- Use `interactive` for clickable cards (grid items, settings shortcuts). They render as `<button>` for accessibility.
- Avoid nesting interactive elements (buttons, links) inside an `interactive` card — it creates nested interactive elements.
- Cards work at any width; let the layout dictate their size.
- Prefer `padding="md"` (24px) for most cases; `"sm"` for compact UIs.
