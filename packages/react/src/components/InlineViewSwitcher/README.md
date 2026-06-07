Compact inline view switcher for placing inside content areas, cards, or toolbars.

Use when `ViewSwitcher` (header-bar sized) is too heavy — `InlineViewSwitcher` sits
comfortably inline with other content. Mirrors `AdwInlineViewSwitcher`
(libadwaita 1.7 / GNOME 48).

Compose with `InlineViewSwitcherItem`. Keyboard: **← →** cycle, **Home / End** jump.

### Variants
| Variant | When to use |
|---------|-------------|
| `default` | Standalone control with clear elevation — inside cards or content areas |
| `flat` | Inside a toolbar or header bar background — blends with the surface |
| `round` | Prominent pill shape with accent active indicator |
| `pill` | Segmented-control style — active item lifted, no accent color (Following tabs) |

### Guidelines
- Prefer `ViewSwitcher` in a `HeaderBar` for top-level navigation.
- Use `InlineViewSwitcher` for secondary, in-context view switching (e.g. chart type, layout mode).
- Always provide an `aria-label` on the container and `aria-label` on icon-only items.
