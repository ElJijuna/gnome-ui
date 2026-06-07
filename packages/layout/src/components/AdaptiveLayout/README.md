Full-page adaptive shell that switches navigation automatically based on viewport width.
Use the **viewport toolbar** to preview each breakpoint:

- **Mobile** (< 480 px): `ViewSwitcherBar` pinned at the bottom.
- **Tablet** (480–1023 px): `ViewSwitcherSidebar` collapsed to icon-only.
- **Desktop** (≥ 1024 px): `ViewSwitcherSidebar` expanded with labels.

Pass `sidebarHeader` for the user card (expanded) and `sidebarHeaderCollapsed`
for the avatar-only version (collapsed). Grouped items (`group` field) become
sidebar sections on tablet/desktop and a single slot + `BottomSheet` on mobile.
When mobile bar slots exceed 4, the first 3 are shown and a **More** button handles
the rest.

Use `bgColor`, `bgShade` (1–5), and `bgOpacity` (0–1) to tint the shell background.
