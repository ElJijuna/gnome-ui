import type { HTMLAttributes } from 'react';

import { Icon, type IconSize } from '../Icon';

import styles from './FileTypeIcon.module.css';
import {
  categoryFromMimeType,
  categoryFromName,
  getFileTypeIcon,
  getFileTypeLabel,
} from './fileType';

export interface FileTypeIconProps extends HTMLAttributes<HTMLSpanElement> {
  /** File name (e.g. `"report.pdf"`) — resolves the icon from its extension. */
  name?: string;
  /**
   * MIME type (e.g. `"application/pdf"`, `"inode/directory"`).
   * Takes precedence over `name` when both are provided.
   */
  mimeType?: string;
  /** Renders the folder icon regardless of `name`/`mimeType`. */
  isFolder?: boolean;
  /** Thumbnail image URL. When provided, renders the image instead of the resolved icon. */
  thumbnail?: string;
  /** Accessible label. Defaults to a generated description (e.g. `"PDF document"`). */
  label?: string;
  /** Icon size. Defaults to `"md"`. */
  size?: IconSize;
}

/**
 * Small icon — optionally a thumbnail — resolved from a file's MIME type
 * or name extension. Useful for file-manager-style listings.
 *
 * Falls back to the generic file icon (mirrors freedesktop's
 * `text-x-generic`) when the type can't be resolved.
 */
export const FileTypeIcon = ({
  name,
  mimeType,
  isFolder = false,
  thumbnail,
  label,
  size = 'md',
  className,
  ...props
}: FileTypeIconProps) => {
  const category = isFolder
    ? 'folder'
    : (mimeType && categoryFromMimeType(mimeType)) || (name && categoryFromName(name)) || 'unknown';

  const resolvedLabel = label ?? getFileTypeLabel(category);

  return (
    <span
      role="img"
      aria-label={resolvedLabel}
      className={[styles.wrapper, styles[size], className].filter(Boolean).join(' ')}
      {...props}
    >
      {thumbnail ? (
        <img src={thumbnail} alt="" className={styles.thumbnail} />
      ) : (
        <Icon icon={getFileTypeIcon(category)} size={size} />
      )}
    </span>
  );
};
