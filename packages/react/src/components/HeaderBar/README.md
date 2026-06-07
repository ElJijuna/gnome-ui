Title bar with centered title and leading/trailing action slots.

Mirrors the Adwaita `AdwHeaderBar` pattern.

### Guidelines
- Use **flat** buttons (`variant="flat"`) for all controls inside the header bar.
- Keep the title short and centered — it should name the current view, not the app.
- Place primary navigation controls (back, menu) on the **leading** side.
- Place secondary actions (add, share, overflow menu) on the **trailing** side.
- Use at most 2–3 actions per side; move the rest into an overflow menu.
- Use `flat` on the topmost bar of a full-window layout to blend with the window chrome.
