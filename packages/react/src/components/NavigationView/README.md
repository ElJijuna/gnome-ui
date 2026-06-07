Single-pane push/pop navigation stack.

Mirrors `AdwNavigationView` — the mobile-first counterpart to `NavigationSplitView`.
Compose `NavigationPage` children and use `useNavigation()` inside them to push/pop pages.

### Usage
- Each `NavigationPage` has a unique `tag` and a `title`.
- Call `navigate(tag)` to push a new page onto the stack.
- Call `pop()` to go back one page.
- `canGoBack` is `true` when there is a page to return to.
