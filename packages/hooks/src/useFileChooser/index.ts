import type {
  OpenFileOptions,
  OpenFileResult,
  SaveFileOptions,
  SaveFileResult,
  SelectFolderOptions,
  SelectFolderResult,
} from '@gnome-ui/platform';
import { openFile, saveFile, selectFolder as selectFolderViaPlatform } from '@gnome-ui/platform';
import { useCallback, useRef, useState } from 'react';

export interface UseFileChooserResult {
  /**
   * Most recently chosen path — a single file, a save destination, or a
   * folder, depending on which trigger was last used. `null` until
   * something is chosen; unchanged by a canceled dialog.
   */
  path: string | null;
  /** All paths from the most recent `open({ multiple: true })` call. Empty otherwise; unchanged by a canceled dialog. */
  paths: string[];
  /** Opens a file picker. Updates `path`/`paths` unless the user cancels. */
  open: (options?: OpenFileOptions) => Promise<OpenFileResult>;
  /** Opens a save dialog. Updates `path` unless the user cancels. */
  save: (options?: SaveFileOptions) => Promise<SaveFileResult>;
  /** Opens a folder picker. Updates `path` unless the user cancels. */
  selectFolder: (options?: SelectFolderOptions) => Promise<SelectFolderResult>;
  /** True while a dialog is open and awaiting the user. */
  loading: boolean;
  /** Set when the last dialog call failed — e.g. outside a WebKitGTK environment. */
  error: Error | null;
}

function toError(reason: unknown): Error {
  return reason instanceof Error ? reason : new Error(String(reason));
}

/**
 * Triggers file/save/folder dialogs and tracks the resolved path as
 * reactive state.
 *
 * WebKitGTK only, same as `@gnome-ui/platform`'s `fileChooser` module —
 * browsers never expose real filesystem paths to page scripts, so every
 * trigger rejects outside that environment (see `error`).
 *
 * @example
 * const { path, open, loading } = useFileChooser();
 *
 * <Button
 *   onClick={() => open({ filters: [{ name: "Images", extensions: ["png", "jpg"] }] })}
 *   disabled={loading}
 * >
 *   {path ?? "Choose a file…"}
 * </Button>
 */
export function useFileChooser(): UseFileChooserResult {
  const [path, setPath] = useState<string | null>(null);
  const [paths, setPaths] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const pendingRef = useRef(0);

  const withLoading = useCallback(async <T>(run: () => Promise<T>): Promise<T> => {
    pendingRef.current += 1;
    setLoading(true);

    try {
      const result = await run();

      setError(null);

      return result;
    } catch (reason) {
      setError(toError(reason));
      throw reason;
    } finally {
      pendingRef.current -= 1;

      if (pendingRef.current === 0) {
        setLoading(false);
      }
    }
  }, []);

  const open = useCallback(
    (options?: OpenFileOptions) =>
      withLoading(async () => {
        const result = await openFile(options);

        if (!result.canceled) {
          setPaths(result.paths);
          setPath(result.paths[0] ?? null);
        }

        return result;
      }),
    [withLoading],
  );

  const save = useCallback(
    (options?: SaveFileOptions) =>
      withLoading(async () => {
        const result = await saveFile(options);

        if (!result.canceled) {
          setPath(result.path);
        }

        return result;
      }),
    [withLoading],
  );

  const selectFolder = useCallback(
    (options?: SelectFolderOptions) =>
      withLoading(async () => {
        const result = await selectFolderViaPlatform(options);

        if (!result.canceled) {
          setPath(result.path);
        }

        return result;
      }),
    [withLoading],
  );

  return { path, paths, open, save, selectFolder, loading, error };
}
