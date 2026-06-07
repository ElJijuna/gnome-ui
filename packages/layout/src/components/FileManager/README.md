GNOME Files (Nautilus)–style file browser assembled from **`@gnome-ui/layout`**
and **`@gnome-ui/react`** components.

### Dual-headerbar pattern

The top bar is split into two sections that sit side-by-side:

| Section | Width | Contents |
|---------|-------|----------|
| Sidebar header | 240 px (56 px collapsed) | Search · Title · Toggle button |
| Content header | `flex: 1` | Back/Forward · **PathBar** · Refresh · More · Avatar |

This mirrors the `AdwOverlaySplitView` dual-`AdwHeaderBar` pattern used in GNOME Files.

**Closes:** [#16](https://github.com/ElJijuna/gnome-ui/issues/16)
**Depends on:** [#17 PathBar](https://github.com/ElJijuna/gnome-ui/issues/17)
