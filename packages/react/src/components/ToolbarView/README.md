Layout container that attaches bars at the top and/or bottom while
scrolling only the middle content.

The top/bottom bars remain fixed; the inner content area gets
`overflow-y: auto` so it scrolls independently.

Mirrors `AdwToolbarView`.

### Usage
- Pass a `HeaderBar` or `Toolbar` to `topBar`.
- Pass a `Toolbar` or `ViewSwitcherBar` to `bottomBar`.
- Put scrollable page content in `children`.
