Horizontal action bar following the libadwaita `.toolbar` pattern.

Provides **6 px padding and gap** — the standard spacing for rows of flat buttons in
header bars, action bars, and tool rows. Use `<Spacer />` to push trailing items to the end.

### Guidelines
- Use `<Button variant="flat">` for buttons that blend into the bar background.
- Use `<Button variant="raised">` inside a Toolbar when a button needs explicit elevation.
- Place `<Spacer />` between leading and trailing button groups.
- Nest inside a surface (card, header bar, bottom bar) — Toolbar itself has no background.
