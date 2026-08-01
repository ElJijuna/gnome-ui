Drag-and-drop file upload target with hover/active states, falling back to a `GtkFileDialog`-style click-to-browse trigger.

```tsx
import { FileDropZone } from '@gnome-ui/react';

<FileDropZone
  onFilesSelected={(files) => upload(files)}
  onError={(message) => showToast(message)}
  accept="image/*"
  maxSize={5 * 1024 * 1024}
  helperText="PNG or JPG, up to 5 MB"
/>
```

The whole zone is a single clickable/keyboard-focusable region: click or press Enter/Space to open the native file browser, or drag a file over it to drop.

Native `accept` only restricts the browse dialog, not drag-and-drop — dropped files are re-validated against both `accept` and `maxSize` before `onFilesSelected` is called, so both paths enforce the same constraints.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onFilesSelected` | `(files: File[]) => void` | — | Called with the accepted files, whether dropped or picked |
| `onError` | `(message: string) => void` | — | Called once per rejected file, with a human-readable reason |
| `accept` | `string` | — | MIME types / extensions accepted, e.g. `"image/*"` or `".pdf,.docx"` |
| `multiple` | `boolean` | `false` | Allow selecting or dropping more than one file |
| `maxSize` | `number` | — | Maximum file size in bytes |
| `disabled` | `boolean` | `false` | Disables the drop zone and browse trigger |
| `label` | `string` | `'Drag files here or click to browse'` | Primary label |
| `helperText` | `string` | — | Helper text below the label (e.g. accepted formats or a size hint) |

### Guidelines

- Use `helperText` to state the accepted formats and size limit up front — it saves a round trip through `onError` for the common case.
- The icon swaps to `folder-drag-accept` (mirroring Nautilus's own drag-and-drop indicator) while a file is dragged over the zone, giving a clear "drop here" affordance beyond just the border color change.
