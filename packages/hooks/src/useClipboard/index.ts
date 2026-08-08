import { readText, writeText } from '@gnome-ui/platform';
import { useCallback, useRef, useState } from 'react';

export interface UseClipboardResult {
  /** Last text copied or pasted through this hook. `null` until one of those happens. */
  value: string | null;
  /** Writes text to the clipboard and updates `value`. */
  copy: (text: string) => Promise<void>;
  /** Reads text from the clipboard, updates `value`, and resolves with it. */
  paste: () => Promise<string>;
  /** True while a copy/paste call is pending. */
  loading: boolean;
  /** Set when the last copy/paste call failed — e.g. outside a supported environment. */
  error: Error | null;
}

function toError(reason: unknown): Error {
  return reason instanceof Error ? reason : new Error(String(reason));
}

/**
 * Copies and pastes clipboard text, tracking the last value as reactive
 * state.
 *
 * Text only — `@gnome-ui/platform`'s `clipboard` module also has
 * `readImage`/`writeImage`/`readFiles`/`writeFiles` for images and file
 * references, but those are a different enough shape (a `data:` URL, a
 * list of paths) that folding them into this hook's single `value` would
 * just make it harder to use for the common case. Reach for the platform
 * functions directly for those.
 *
 * There is no "clipboard changed" signal to subscribe to — `value` only
 * updates when you call `copy`/`paste` through this hook, not when the
 * clipboard changes externally (another app, another window).
 *
 * @example
 * const { value, copy, paste } = useClipboard();
 *
 * <Button onClick={() => copy(text)}>Copy</Button>
 * <Button onClick={() => paste().then(setText)}>Paste</Button>
 * {value && <span>Copied: {value}</span>}
 */
export function useClipboard(): UseClipboardResult {
  const [value, setValue] = useState<string | null>(null);
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

  const copy = useCallback(
    (text: string) =>
      withLoading(async () => {
        await writeText(text);
        setValue(text);
      }),
    [withLoading],
  );

  const paste = useCallback(
    () =>
      withLoading(async () => {
        const text = await readText();

        setValue(text);

        return text;
      }),
    [withLoading],
  );

  return { value, copy, paste, loading, error };
}
