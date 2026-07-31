Small icon — optionally a thumbnail — resolved from a file's MIME type or name extension. Useful for file-manager-style listings.

```tsx
import { FileTypeIcon } from '@gnome-ui/react';

<FileTypeIcon name="report.pdf" />
<FileTypeIcon mimeType="image/png" />
<FileTypeIcon name="cover.jpg" thumbnail={thumbnailUrl} />
<FileTypeIcon isFolder />
```

Icons mirror the freedesktop.org icon-naming convention already shipped in `@gnome-ui/icons` (`image-x-generic`, `audio-x-generic`, `x-office-document`, etc.), falling back to the generic file icon (`text-x-generic`) when the type can't be resolved.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | — | File name (e.g. `"report.pdf"`) — resolves the icon from its extension |
| `mimeType` | `string` | — | MIME type (e.g. `"application/pdf"`, `"inode/directory"`) — takes precedence over `name` |
| `isFolder` | `boolean` | `false` | Renders the folder icon regardless of `name`/`mimeType` |
| `thumbnail` | `string` | — | Image URL. When provided, renders the image instead of the resolved icon |
| `label` | `string` | generated | Accessible label. Auto-generated from the resolved category (e.g. `"PDF document"`) when omitted |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Icon/thumbnail size |

### Resolved categories

`folder`, `image`, `audio`, `video`, `pdf`, `archive`, `document`, `spreadsheet`, `presentation`, `font`, `executable`, `text`, and `unknown` (fallback).

### Guidelines

- Prefer `mimeType` when you have a real MIME type (e.g. from the File API or a server response) — it's more reliable than guessing from a file name, and it's the only way to resolve `folder` via `"inode/directory"` without the explicit `isFolder` prop.
- Pass `thumbnail` for image/video files where a real preview is available; the layout doesn't shift since the thumbnail is sized to match the icon.
