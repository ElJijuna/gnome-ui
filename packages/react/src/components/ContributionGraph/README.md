A responsive activity heatmap calendar styled with Adwaita design tokens.
Colour intensity represents activity count per day.

**Guidelines (GNOME HIG):**
- Use inside a `Card` to frame the graph on a dashboard or profile page.
- Cells use the named accent colour token family from `GnomeProvider`; CSS accent values without token variants fall back to green.
- Cells expand to use available width and narrow layouts show fewer recent weeks before cells become too small.
- Dark mode is handled automatically via CSS custom properties — no extra configuration needed.
- Keyboard users can navigate every cell with arrow keys (`role="grid"`).
