Swipeable content carousel.

Mirrors `AdwCarousel`. Uses CSS scroll-snapping for smooth, native-feeling
page transitions. Supports keyboard navigation (←/→ or ↑/↓), touch, and mouse drag.

Pair with `CarouselIndicatorDots` or `CarouselIndicatorLines` for pagination UI,
or let `indicator` render one for you.

### Layout
- `visibleSlides` — how many children fit inside the viewport at once. Paging moves a
  whole group, so 5 slides with `visibleSlides={2}` give 3 pages. Takes a breakpoint map too
  — see [Responsive](#responsive).
- `peek` — how much of the neighbouring slides shows at each edge, as a px number or any
  CSS length (`peek="10%"`, `peek={40}`). The active group shrinks to make room, so
  paging still advances exactly one group. `spacing` is added on top of it, so `peek` is
  the amount of the neighbour you actually see.
- `focusActiveSlides` — shrink everything outside the current page so the active slides
  read as the focus. `true` scales them to 80%; pass a number for a different ratio
  (`focusActiveSlides={0.92}`). It only shows when the neighbours are on screen, so pair
  it with `peek`. The scale is a transform on an element inside each slide, so layout,
  snap points and paging are all untouched.

### Responsive
`visibleSlides` and `peek` accept a breakpoint map as well as a plain value:

```tsx
<Carousel visibleSlides={{ base: 3, wide: 2, narrow: 1 }} peek={{ base: 32, narrow: 0 }} />
```

The buckets are the GNOME max-widths (`narrow` ≤ 400, `medium` ≤ 550, `wide` ≤ 860), so a map
reads like stacked media queries and the **narrowest matching entry wins**. Leave one out and
it falls outwards: with no `medium`, a 550 px width keeps the `wide` value.

They resolve against the **carousel's own width**, not the viewport — the `AdwBreakpointBin`
pattern, so a carousel in a sidebar adapts to the space it was given rather than to the
window. The width measured is the border box, so `peek` (which is padding on that element)
cannot feed back into the bucket that chose it.

Regrouping keeps the slide that was leading the view on screen, so the page index follows the
content: at 3-per-page, page 2 leads with slide 4; drop to 1-per-page and you land on page 4,
still looking at slide 4.

### Navigation chrome
- `indicator` — `'dots'`, `'lines'`, or `'none'` to hide the pagination entirely, and
  `indicatorPosition` puts it on any edge. At `'left'` or `'right'` the carousel stacks it
  for you, by handing the indicator its own `orientation="vertical"` — pass that yourself
  when you render `CarouselIndicatorDots` / `CarouselIndicatorLines` standalone beside a
  track. Stacked, the line segments turn with the indicator so the deck still reads as one
  track rather than a ladder of unrelated dashes.
- `arrows` — overlays previous/next buttons on the carousel edges. They go `aria-disabled`
  at the first/last page unless the carousel wraps, and disappear when there is only one
  page. Label them with `previousLabel` / `nextLabel`.
- `autoPlay` — overlays a play/pause button in the corner. Turn `autoPlayControl` off only
  when you render your own; automatically moving content must be stoppable.

### Right to left
Direction is read off the DOM, so a `dir="rtl"` anywhere up the tree is all it takes — there
is no prop. Everything mirrors: paging runs right to left, `peek` and the arrows follow the
inline axis, the chevrons flip, dragging is reversed, and the **left** arrow key is the one
that moves forward, because arrow keys follow what the eye sees rather than the index.

Internally the scroll position is kept in logical coordinates — 0 on page 0, growing as you
page forward — because a right-to-left scroller reports `scrollLeft` as 0 at its right edge
and counts *down* into negatives from there.

### Accessibility
- `label` names the carousel region (`'Carousel'` by default). `role="region"` is dropped
  from the landmark tree without a name, so give it something specific when the page holds
  more than one carousel.
- Every visible string is a prop: `label`, `indicatorLabel`, `pageLabel`, `slideLabel`,
  `statusLabel`, `previousLabel`, `nextLabel`, `pauseLabel`, `playLabel`. `pageLabel`,
  `slideLabel` and `statusLabel` are formatters — `(index, total) => string`, all
  zero-based on `index`.
- A visually hidden `role="status"` region announces the page on every move — *"Page 3 of
  5"*, or whatever `statusLabel` returns. Both cues for the change are invisible to a
  screen reader otherwise: the dot moving, and the track scrolling under slides that are
  all in the DOM whichever page you are on. It falls silent (`aria-live="off"`) while an
  `autoPlay` rotation is running — a carousel that talks every few seconds is unusable —
  and speaks again the moment the rotation stops, the automatic pause while the keyboard
  is inside the carousel included. A single-page deck gets no live region at all.
- The arrows carry `aria-disabled` and ignore the press, rather than being truly
  `disabled`. A real `disabled` leaves the tab order the instant you page onto the last
  slide, so the focus you were pressing Enter on falls to the body and the deck you were
  navigating is gone.
- Every slide stays reachable by Tab, on screen or not — a control you cannot reach is
  worse than one you have to page to. Tabbing to something in an off-screen slide scrolls
  it in, and the carousel reads the new page back off that scroll, so the indicator and
  the arrows follow the focus.
- Keyboard: ←/→ (or ↑/↓ when vertical) page by one, `Home` and `End` jump to the first and
  last page.
- `autoPlay` pauses while the pointer is over the carousel, while the keyboard is inside
  it, during a drag, while the tab is in the background, and whenever the pause button says
  so. Pressing play overrides the hover and focus pauses, so the button never reads as dead.
- The page indicators are a `role="group"` of ordinary buttons, and the current one carries
  `aria-current="true"`. They are deliberately **not** a `tablist`: there are no tabpanels
  behind them, and the role would promise roving-tabindex arrow navigation that a page
  picker does not have.

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

### Page state
Uncontrolled by default — pass `defaultPage` to start somewhere other than the first page.

Pass `page` to control it, and then you own the position: the carousel renders the page you
give it and reports every user-driven move through `onPageChanged`, but it does not force
the prop back. If you drop that callback on the floor, the track ends up on one page while
the indicator and the arrows still describe another. Feed `onPageChanged` straight back into
`page` — the same contract as a controlled `<input>`.

```tsx
const [page, setPage] = useState(0);

<Carousel page={page} onPageChanged={setPage} indicator="dots" />;
```

### Imperative control
Pass a `ref` to drive the carousel from outside — a toolbar, a keyboard shortcut, a step in
a wizard.

```tsx
const carousel = useRef<CarouselHandle>(null);

<Carousel ref={carousel} indicator="dots" loop>…</Carousel>;

carousel.current?.next();
carousel.current?.goToSlide(4);
carousel.current?.page; // 4
```

| | |
| --- | --- |
| `next()` / `previous()` | Page by one. Wraps when `loop` or `infinite` is on. |
| `goTo(page, { animate })` | Absolute jump. Clamped into range — it never wraps. |
| `goToSlide(slide, { animate })` | Jump to the page holding a slide. Not the page index once `visibleSlides` is above 1. |
| `focus()` | Move keyboard focus to the track. |
| `play()` / `pause()` | Start and stop the `autoPlay` rotation, exactly as the button does. |
| `page`, `pageCount`, `isPlaying` | Live getters. |
| `element` | The scrollable track, for measuring or positioning. `null` before mount. |

Every method takes the same path as the arrows and the indicator, so wrapping, travel across
cloned pages, reduced motion and the `onPageChanged`-once rule behave the same however the
move started. In particular the handle **reports** rather than seizes: with a controlled
`page`, `next()` calls `onPageChanged` and leaves the prop to you, just like the arrow does.

The readable members are getters, not a frozen snapshot, so `handle.page` is already right on
the line after `next()` instead of a render later.

### Behaviour notes
- `defaultPage` is clamped into range and ignored entirely once `page` is passed.
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
