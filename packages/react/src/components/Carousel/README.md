Swipeable content carousel.

Mirrors `AdwCarousel`. Uses CSS scroll-snapping for smooth, native-feeling
page transitions. Supports keyboard navigation (←/→ or ↑/↓), touch, and mouse drag.

Pair with `CarouselIndicatorDots` or `CarouselIndicatorLines` for pagination UI,
or let `indicator` render one for you.

### Navigation chrome
- `visibleSlides` — how many children fit inside the viewport at once. Paging moves a
  whole group, so 5 slides with `visibleSlides={2}` give 3 pages.
- `indicator` — `'dots'`, `'lines'`, or `'none'` to hide the pagination entirely.
- `arrows` — overlays previous/next buttons on the carousel edges. They disable at the
  first/last page unless `loop` is set, and disappear when there is only one page.
  Label them with `previousLabel` / `nextLabel`.

```tsx
<Carousel visibleSlides={2} spacing={16} arrows indicator="dots" loop>
  {items.map((item) => (
    <Card key={item.id}>{item.title}</Card>
  ))}
</Carousel>
```

### Guidelines
- Keep page count low (3–6). More pages need a compact indicator like lines.
- Reserve inline padding inside slides when `arrows` is on so the buttons don't sit on
  top of text.
- Use `orientation="vertical"` for feed-style layouts — arrows move to the top and
  bottom edges automatically.
- Use `loop` for image galleries where wrap-around is expected.
