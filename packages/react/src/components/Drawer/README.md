Slide-over panel for supplementary React content. Use `side` to open from the
left or right, `size` for classic or wide widths, and pass the body through
`children` or the `content` prop.

`variant` controls how the drawer displaces the page. The default
`"overlay"` floats above the page behind a dismissible, focus-trapping
backdrop. `"push"` renders in normal document flow instead — no portal, no
backdrop, no focus trap, since the rest of the page stays visible and
interactive — so place it next to your main content inside a flex/grid
container and it shoulders that content aside as it opens.

Opening a second `Drawer` from inside a drawer's content (or `content` prop)
automatically makes it narrower than its parent — each nesting level scales
the preset width down until it hits a minimum, so stacked drawers read as a
drill-in hierarchy instead of identical overlapping panels.

Pass `rail` to render a narrow icon strip on the drawer's inner edge (the
edge facing the backdrop) for switching between related panels without
closing the drawer — for example, a fixed rail of related sections while the
drawer's own `content` swaps underneath it. The rail is presentational only:
each entry's `onClick` is the caller's responsibility, and `active` just
marks which entry looks pressed.
