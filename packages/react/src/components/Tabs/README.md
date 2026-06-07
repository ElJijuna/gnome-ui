Tab-based navigation following the Adwaita `AdwTabBar` pattern.

Three components work together:
- **`TabBar`** — the horizontal bar that holds `TabItem` elements; manages roving-tabindex keyboard navigation.
- **`TabItem`** — individual tab button with optional icon, close button, and ARIA wiring.
- **`TabPanel`** — content panel linked to its tab via `id` / `panelId`.

### Guidelines
- Use tabs for parallel views of the same data, not sequential steps (use a wizard for those).
- Keep labels short — one or two words.
- The active tab has an accent underline and higher contrast.
- Keyboard: ← / → cycle through tabs, Home / End jump to first / last.
- When tabs are closeable, always keep at least one tab open.
