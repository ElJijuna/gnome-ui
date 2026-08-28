Swipeable content carousel.

Mirrors `AdwCarousel`. Uses CSS scroll-snapping for smooth, native-feeling
page transitions. Supports keyboard navigation (←/→ or ↑/↓), touch, and mouse drag.

Pair with `CarouselIndicatorDots` or `CarouselIndicatorLines` for pagination UI,
or let `indicator` render one for you.

### Layout
- `visibleSlides` — how many children fit inside the viewport at once. Paging moves a
  whole group, so 5 slides with `visibleSlides={2}` give 3 pages.
- `peek` — how much of the neighbouring slides shows at each edge, as a px number or any
  CSS length (`peek="10%"`, `peek={40}`). The active group shrinks to make room, so
  paging still advances exactly one group. `spacing` is added on top of it, so `peek` is
  the amount of the neighbour you actually see.
- `focusActiveSlides` — shrink everything outside the current page so the active slides
  read as the focus. `true` scales them to 80%; pass a number for a different ratio
  (`focusActiveSlides={0.92}`). It only shows when the neighbours are on screen, so pair
  it with `peek`. The scale is a transform on an element inside each slide, so layout,
  snap points and paging are all untouched.

### Navigation chrome
- `indicator` — `'dots'`, `'lines'`, or `'none'` to hide the pagination entirely.
- `arrows` — overlays previous/next buttons on the carousel edges. They disable at the
  first/last page unless the carousel wraps, and disappear when there is only one page.
  Label them with `previousLabel` / `nextLabel`.

### Wrapping: `loop` vs `infinite`
Both wrap around past the ends; they differ in how they get there.

- `loop` rewinds: stepping forward from the last page scrolls all the way back to the
  first. Nothing is cloned, so your children render exactly once.
- `infinite` is seamless: a copy of the last page is rendered *before* the first one (and
  a copy of the first page after the last), so paging past either end keeps moving in the
  same direction. Once the animation settles the carousel silently repositions onto the
  real page. Implies `loop`.

`infinite` clones your children, so avoid it for slides that own uncloneable side effects
— autoplaying media, unique DOM ids, per-slide data fetches. The clones are `aria-hidden`
and `inert`, so assistive tech and the tab order still see the real slides only.

Motion is perfectly seamless when the slide count is a multiple of `visibleSlides`. With
a remainder the last group overlaps the first one (5 slides in groups of 2 give pages
`[1,2] [3,4] [5,1]`), so the wrap shifts by the leftover slides.

```tsx
<Carousel visibleSlides={2} spacing={16} peek={40} focusActiveSlides arrows infinite>
  {items.map((item) => (
    <Card key={item.id}>{item.title}</Card>
  ))}
</Carousel>
```

### Behaviour notes
- `onPageChanged` fires once per actual page change. A swipe emits a scroll event per
  frame, and navigating past the end without `loop` clamps back onto the current page —
  neither re-notifies you of a page you are already on.
- Programmatic scrolls honour `prefers-reduced-motion: reduce` by jumping straight to the
  page. A `behavior: 'smooth'` scroll overrides the stylesheet, so this cannot be undone
  from CSS.

### Guidelines
- Keep page count low (3–6). More pages need a compact indicator like lines.
- Reserve inline padding inside slides when `arrows` is on so the buttons don't sit on
  top of text.
- Use `orientation="vertical"` for feed-style layouts — arrows move to the top and
  bottom edges automatically, and `peek` insets the block axis instead.
- Pair `peek` with `infinite` so the leading edge is never blank on the first page.
- Remember that `focusActiveSlides` eats into the peek: a slide scaled to 80% gives back
  a tenth of its width at each side, so raise `peek` to keep the same visible sliver.
- Use `infinite` for image galleries where wrap-around is expected, and `loop` when the
  slides must not be duplicated.
