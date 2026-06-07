Typography component mirroring all [Adwaita text style classes](https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/style-classes.html).

### Variants

| Variant | Element | Use case |
|---------|---------|----------|
| `large-title` | `h1` | Display heading with lots of whitespace |
| `title-1` | `h1` | Primary page/view title |
| `title-2` | `h2` | Section title |
| `title-3` | `h3` | Sub-section title |
| `title-4` | `h4` | Minor heading |
| `heading` | `h3` | UI labels, boxed list headers |
| `body` | `p` | Default UI text, descriptions |
| `document` | `p` | Reading content (chat, articles) |
| `caption` | `span` | Sub-text, metadata |
| `caption-heading` | `span` | Small group labels (uppercase) |
| `monospace` | `code` | Code, logs, shell commands |
| `numeric` | `span` | Aligned numbers, counters |

Use the `as` prop to override the rendered HTML element without changing the visual style.
