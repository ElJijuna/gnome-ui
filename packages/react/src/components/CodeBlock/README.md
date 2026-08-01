Static monospace code/config snippet display with optional line numbers and a trailing `CopyButton`.

```tsx
import { CodeBlock } from '@gnome-ui/react';

<CodeBlock
  filename="config.yaml"
  language="YAML"
  lineNumbers
  code={`server:\n  port: 8080\n  host: 0.0.0.0`}
/>
```

Distinct from `TerminalView`, which is for live, scrolling terminal output — `CodeBlock` is for a fixed snippet (a config example, a command to run, a code sample in documentation).

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `code` | `string` | — | The code/config content to display |
| `filename` | `string` | — | Optional filename shown in the header |
| `language` | `string` | — | Optional language label shown in the header |
| `lineNumbers` | `boolean` | `false` | Show line numbers in a gutter |
| `copyable` | `boolean` | `true` | Show a trailing `CopyButton` in the header |
| `wrap` | `boolean` | `false` | Wrap long lines instead of scrolling horizontally |

### Guidelines

- `CodeBlock` does not perform syntax highlighting — `language` is a plain cosmetic label, not a highlighting mode. For colored syntax highlighting, pair the raw text with a dedicated highlighter in your app and pass the already-highlighted markup as `children` to your own wrapper instead.
- The header (filename/language/copy button) is omitted entirely when none of `filename`, `language`, or `copyable` apply, so a minimal snippet doesn't render an empty bar.
- Enable `wrap` for snippets meant to be read top-to-bottom without horizontal scrolling (e.g. prose-adjacent examples); leave it off for shell commands and tabular output where line breaks are meaningful.
