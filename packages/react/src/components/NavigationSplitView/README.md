Two-pane sidebar + content layout that collapses to a single navigable pane on narrow screens (≤ 400 px), mirroring `AdwNavigationSplitView`.

- **Wide (> 400 px):** sidebar and content are side-by-side. `showContent` is ignored.
- **Narrow (≤ 400 px):** only one pane is visible at a time. Use `showContent` to switch.

### Guidelines
- Use for apps with a list → detail navigation pattern (mail, files, contacts).
- The sidebar should contain a navigable list; the content pane shows the selected item.
- On narrow screens, add a **Back** button to the content header bar so users can return to the sidebar.
- The `showContent` prop is typically driven by whether a selection has been made.
