Masonry layout that distributes variable-height items across columns using a
**shortest-column-first** algorithm — each new item is placed in the column
with the least accumulated height, minimising gaps.

Layout is computed in JavaScript via `ResizeObserver`, so it adapts automatically
when the container or any item changes size. Enable `fresh` to continuously
monitor individual item heights.

```tsx
import { MasonryGrid } from "@gnome-ui/layout";

<MasonryGrid columns={{ xs: 1, sm: 2, md: 3 }} gap="md">
  <Card />
  <Card />
  <Card />
</MasonryGrid>
```
