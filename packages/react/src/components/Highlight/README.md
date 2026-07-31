Wraps every occurrence of `query` within `text` in a `<mark>` element.

Pairs with `SearchBar`'s suggestion list and any filterable list/table to show users which part of a result matched what they typed.

```tsx
import { Highlight } from '@gnome-ui/react';

<Highlight text="Preferences for accessibility" query="access" />
<Highlight text="The quick brown fox" query={['quick', 'fox']} />
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | — | Full text to render |
| `query` | `string \| string[]` | — | Term or terms to highlight. Pass an array to highlight multiple distinct terms at once |
| `caseSensitive` | `boolean` | `false` | Match case-sensitively |

### Guidelines

- Empty or whitespace-only terms are ignored automatically — safe to pass a `query` derived directly from a live search input without checking for blank strings first.
- Query terms are matched literally; regex special characters (e.g. `(`, `.`, `[`) are escaped internally, so they never need escaping by the caller.
- For a multi-word search (e.g. `"quick fox"`), split on whitespace and pass the array (`query={['quick', 'fox']}`) rather than the whole phrase, so each word highlights independently even when they don't appear adjacent in the result.
