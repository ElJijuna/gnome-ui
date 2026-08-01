Sticky table-of-contents side rail with scroll-spy: the link for the section
currently nearest the top of the viewport is highlighted automatically as the
user scrolls. For long docs/settings pages.

Each `sections[].id` must match the `id` of a real heading element on the
page — `StickyToc` observes those elements directly via
`IntersectionObserver`, it does not render the headings itself.

```tsx
import { StickyToc } from "@gnome-ui/layout";

<StickyToc
  sections={[
    { id: "intro", label: "Introduction" },
    { id: "usage", label: "Usage" },
    { id: "props", label: "Props" },
  ]}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `sections` | `StickyTocSection[]` (`{ id, label }`) | — | Sections to link to, in document order |
| `label` | `string` | `"On this page"` | Heading rendered above the list, and the nav's accessible label |
| `onActiveChange` | `(id: string) => void` | — | Called whenever the active section changes, from either scrolling or clicking a link |

### Guidelines

- Once a section scrolls fully out of view with nothing else visible (e.g. mid-scroll between two sections), the last active link stays highlighted rather than flickering back to "none active".
- Clicking a link scrolls its target into view directly — it doesn't rely on the browser's native hash-jump, so it works even when the page uses a fixed header that would otherwise cover the heading.
