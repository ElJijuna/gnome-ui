Multi-column sortable data table styled with Adwaita design tokens.

Mirrors `GtkColumnView` / `AdwColumnView` — the canonical GNOME widget for tabular data in file managers, settings lists, and dashboards.

**Guidelines (GNOME HIG):**
- Use for datasets where users benefit from comparing values across columns.
- Prefer `selectionMode="single"` for navigation (open on click) and `"multiple"` for batch operations.
- Always provide an `ariaLabel` describing the data set.
- Set `height` when the dataset may exceed the viewport — this enables vertical scroll with a sticky header.
