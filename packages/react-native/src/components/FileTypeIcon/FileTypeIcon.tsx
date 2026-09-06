import type { StyleProp, ViewStyle } from 'react-native';
import { Image, View } from 'react-native';

import { Icon, type IconSize } from '@/components/Icon';
import { ICON_SIZE_MAP } from '@/components/Icon/shared';
import { useGnomeTheme } from '@/GnomeProvider';

import {
  categoryFromMimeType,
  categoryFromName,
  getFileTypeIcon,
  getFileTypeLabel,
} from './fileType';

export interface FileTypeIconProps {
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
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Small icon — optionally a thumbnail — resolved from a file's MIME type
 * or name extension. Useful for file-manager-style listings. Mirrors
 * `@gnome-ui/react`'s `FileTypeIcon`.
 *
 * Falls back to the generic file icon (mirrors freedesktop's
 * `text-x-generic`) when the type can't be resolved.
 *
 * `fileType.ts`'s category-resolution logic (MIME type / extension → one of
 * 13 categories, plus the freedesktop icon and generated label per
 * category) is pure, DOM-free TS — duplicated verbatim from
 * `@gnome-ui/react` rather than imported cross-package, the same
 * `isIconDefinition`/`Icon.tsx` precedent already established for
 * DOM-independent logic that still isn't worth a shared package for one
 * function's worth of code.
 *
 * `role="img"` + `accessibilityLabel` ports 1:1 (the same `Avatar`/
 * `LevelBar` precedent for RN's newer web-aligned `Role` union). The
 * thumbnail reuses `Avatar`'s own `Image`/`resizeMode="cover"` recipe,
 * sized from `Icon`'s own `ICON_SIZE_MAP` so swapping between the resolved
 * icon and a thumbnail never shifts layout — the same reasoning the web
 * version's `.sm`/`.md`/`.lg` classes document.
 */
export const FileTypeIcon = ({
  name,
  mimeType,
  isFolder = false,
  thumbnail,
  label,
  size = 'md',
  style,
  testID,
}: FileTypeIconProps) => {
  const theme = useGnomeTheme();
  const box = ICON_SIZE_MAP[size];

  const category = isFolder
    ? 'folder'
    : (mimeType && categoryFromMimeType(mimeType)) || (name && categoryFromName(name)) || 'unknown';

  const resolvedLabel = label ?? getFileTypeLabel(category);

  return (
    <View
      testID={testID}
      accessible
      role="img"
      accessibilityLabel={resolvedLabel}
      style={[{ width: box, height: box, alignItems: 'center', justifyContent: 'center' }, style]}
    >
      {thumbnail ? (
        <Image
          testID={testID ? `${testID}-thumbnail` : undefined}
          source={{ uri: thumbnail }}
          resizeMode="cover"
          style={{ width: box, height: box, borderRadius: theme.radiusSm }}
        />
      ) : (
        <Icon icon={getFileTypeIcon(category)} size={size} />
      )}
    </View>
  );
};
