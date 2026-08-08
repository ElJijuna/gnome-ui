import { isWebKitBridge, postMessageAndWait } from '../bridge';

export interface FileFilter {
  /** Display name for this filter, e.g. `"Images"`. */
  name: string;
  /** File extensions without the leading dot, e.g. `["png", "jpg"]`. */
  extensions?: string[];
  /** MIME types, e.g. `["image/png"]`. */
  mimeTypes?: string[];
}

export interface OpenFileOptions {
  title?: string;
  /** Allow selecting more than one file. Defaults to `false`. */
  multiple?: boolean;
  filters?: FileFilter[];
  /** Starting directory. */
  currentFolder?: string;
}

export interface SaveFileOptions {
  title?: string;
  /** Suggested filename. */
  currentName?: string;
  filters?: FileFilter[];
  currentFolder?: string;
}

export interface SelectFolderOptions {
  title?: string;
  currentFolder?: string;
}

export interface OpenFileResult {
  canceled: boolean;
  /** Empty when canceled. More than one entry only when `multiple: true`. */
  paths: string[];
}

export interface SaveFileResult {
  canceled: boolean;
  /** `null` when canceled. */
  path: string | null;
}

export interface SelectFolderResult {
  canceled: boolean;
  /** `null` when canceled. */
  path: string | null;
}

const RESULT_EVENT = 'file-chooser-result';

// Unlike `clipboard` (real `navigator.clipboard`) or `notifications` (real
// `Notification`), there is no honest browser fallback here: the File System
// Access API's `showOpenFilePicker()` / `showSaveFilePicker()` /
// `showDirectoryPicker()` hand back opaque `FileSystemHandle`s, not real
// filesystem paths — browsers deliberately never expose those to page
// scripts. Since every caller of this module is after an actual path (see
// `OpenFileResult.paths` etc.), faking one from a handle's `.name` would be
// silently wrong, so every function here is WebKitGTK-only.
function assertBridgeAvailable(): void {
  if (!isWebKitBridge()) {
    throw new Error(
      'File dialogs are not supported outside a WebKitGTK environment — browsers do not expose real filesystem paths to page scripts.',
    );
  }
}

/**
 * Opens a `GtkFileChooserDialog` (or XDG portal equivalent for sandboxed
 * apps) in "open" mode and resolves once the user picks file(s) or cancels.
 */
export async function openFile(options: OpenFileOptions = {}): Promise<OpenFileResult> {
  assertBridgeAvailable();

  const detail = await postMessageAndWait<{
    requestId: string;
    canceled: boolean;
    paths: string[];
  }>('fileChooser', { action: 'open', ...options }, RESULT_EVENT);

  return { canceled: detail.canceled, paths: detail.paths };
}

/**
 * Opens a `GtkFileChooserDialog` (or XDG portal equivalent) in "save" mode
 * and resolves once the user confirms a destination or cancels.
 */
export async function saveFile(options: SaveFileOptions = {}): Promise<SaveFileResult> {
  assertBridgeAvailable();

  const detail = await postMessageAndWait<{
    requestId: string;
    canceled: boolean;
    path: string | null;
  }>('fileChooser', { action: 'save', ...options }, RESULT_EVENT);

  return { canceled: detail.canceled, path: detail.path };
}

/**
 * Opens a `GtkFileChooserDialog` (or XDG portal equivalent) in "select
 * folder" mode and resolves once the user picks a directory or cancels.
 */
export async function selectFolder(options: SelectFolderOptions = {}): Promise<SelectFolderResult> {
  assertBridgeAvailable();

  const detail = await postMessageAndWait<{
    requestId: string;
    canceled: boolean;
    path: string | null;
  }>('fileChooser', { action: 'selectFolder', ...options }, RESULT_EVENT);

  return { canceled: detail.canceled, path: detail.path };
}
