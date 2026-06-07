Slide-up panel that overlays content from the bottom edge.

Mirrors `AdwBottomSheet` (libadwaita 1.6+). Renders into a portal on
`document.body`. Traps focus, closes on Escape or backdrop click (configurable).

### Guidelines
- Use for actions or supplementary content on mobile/narrow viewports.
- Keep content concise — the sheet should not exceed ~90 % of the viewport height.
- Provide an `onClose` handler to close the sheet on Escape and backdrop tap.
