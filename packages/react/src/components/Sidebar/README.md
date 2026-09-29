Lateral navigation panel following the Adwaita `.navigation-sidebar` pattern.

Updated for **libadwaita 1.9 / GNOME 50**:

- **`SidebarSection`** — groups items under a named heading with a divider between sections.
- **`suffix`** — general trailing widget per item (button, badge, icon…); supersedes `badge`.
- **`tooltip`** — short label shown on hover, useful for truncated or icon-only rows.
- **`menuItems`** — per-item context menu on right-click or the `Menu` key.
- **`searchable`** — built-in search bar with automatic item filtering.
- **`mode`** — `"sidebar"` (default) or `"page"` (full-width boxed-list layout for narrow viewports).

Updated for **libadwaita 1.10 / GNOME 51**:

- **`prefix` / `suffix`** — content pinned above and below the scrollable item list (account switcher, title, help button…). Slot content can call `useSidebarCollapsed()` to adapt to rail mode.
- **`SidebarSection` `suffix`** — widget at the end of the section header (count badge, "add" button); never toggles a collapsible section.

All previous `Sidebar` / `SidebarItem` usage is fully backward compatible.
