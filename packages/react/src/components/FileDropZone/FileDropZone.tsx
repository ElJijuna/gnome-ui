import { Folder, FolderDragAccept } from '@gnome-ui/icons';
import {
  type DragEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  useId,
  useRef,
  useState,
} from 'react';

import { Icon } from '../Icon';
import { VisuallyHidden } from '../VisuallyHidden';

import styles from './FileDropZone.module.css';

export interface FileDropZoneProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'onDrop' | 'onError'> {
  /** Called with the accepted files, whether dropped or picked via the browse dialog. */
  onFilesSelected: (files: File[]) => void;
  /**
   * Called once per rejected file, with a human-readable reason
   * (wrong type or over `maxSize`). Native `accept` restricts the browse
   * dialog automatically, but drag-and-drop bypasses it, so dropped files
   * are re-validated against both `accept` and `maxSize` here.
   */
  onError?: (message: string) => void;
  /** MIME types / extensions accepted, e.g. `"image/*"` or `".pdf,.docx"`. */
  accept?: string;
  /** Allow selecting or dropping more than one file. Defaults to `false`. */
  multiple?: boolean;
  /** Maximum file size in bytes. Files over this size are rejected. */
  maxSize?: number;
  /** Disables the drop zone and browse trigger. */
  disabled?: boolean;
  /** Primary label. Defaults to `"Drag files here or click to browse"`. */
  label?: string;
  /** Helper text below the label (e.g. accepted formats or a size limit hint). */
  helperText?: string;
}

function matchesAccept(file: File, accept?: string): boolean {
  if (!accept) {
    return true;
  }

  const patterns = accept
    .split(',')
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean);

  if (patterns.length === 0) {
    return true;
  }

  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  return patterns.some((p) => {
    if (p.startsWith('.')) {
      return name.endsWith(p);
    }
    if (p.endsWith('/*')) {
      return type.startsWith(p.slice(0, -1));
    }

    return type === p;
  });
}

/**
 * Drag-and-drop file upload target with hover/active states, falling back
 * to a `GtkFileDialog`-style click-to-browse trigger.
 *
 * Native `accept` only restricts the browse dialog, not drag-and-drop, so
 * dropped files are re-validated against both `accept` and `maxSize` before
 * `onFilesSelected` is called.
 */
export const FileDropZone = ({
  onFilesSelected,
  onError,
  accept,
  multiple = false,
  maxSize,
  disabled = false,
  label = 'Drag files here or click to browse',
  helperText,
  id: idProp,
  className,
  ...props
}: FileDropZoneProps) => {
  const autoId = useId();
  const id = idProp ?? autoId;
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  const processFiles = (fileList: FileList | null) => {
    if (!fileList) {
      return;
    }

    const incoming = multiple ? Array.from(fileList) : Array.from(fileList).slice(0, 1);
    const accepted: File[] = [];

    for (const file of incoming) {
      if (!matchesAccept(file, accept)) {
        onError?.(`"${file.name}" is not an accepted file type.`);
        continue;
      }
      if (maxSize !== undefined && file.size > maxSize) {
        onError?.(`"${file.name}" exceeds the maximum file size.`);
        continue;
      }
      accepted.push(file);
    }

    if (accepted.length > 0) {
      onFilesSelected(accepted);
    }
  };

  const openBrowser = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openBrowser();
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) {
      return;
    }
    dragCounterRef.current += 1;
    setIsDragging(true);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) {
      return;
    }
    dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragCounterRef.current = 0;
    setIsDragging(false);

    if (disabled) {
      return;
    }
    processFiles(e.dataTransfer.files);
  };

  return (
    <div
      id={id}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled || undefined}
      className={[
        styles.zone,
        isDragging ? styles.dragging : null,
        disabled ? styles.disabled : null,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={openBrowser}
      onKeyDown={handleKeyDown}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      {...props}
    >
      <Icon
        icon={isDragging ? FolderDragAccept : Folder}
        size="lg"
        aria-hidden
        className={styles.icon}
      />
      <span className={styles.label}>{label}</span>
      {helperText && <span className={styles.helperText}>{helperText}</span>}

      <VisuallyHidden aria-hidden="true">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          tabIndex={-1}
          // A programmatic input.click() dispatches a real click event that
          // bubbles — without this it would re-trigger the wrapping zone's
          // own onClick and call openBrowser() a second time.
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            processFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </VisuallyHidden>
    </div>
  );
};
