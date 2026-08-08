import { getSetting, onSettingChanged, setSetting } from '@gnome-ui/platform';
import { useCallback, useEffect, useState } from 'react';

export interface UseSettingsResult<T> {
  /** Current value — `defaultValue` until the first successful read, or forever if unsupported. */
  value: T;
  /** Writes a new value. Updates `value` immediately (optimistic), then persists via the bridge. */
  setValue: (value: T) => void;
  /** True until the first read completes, successfully or not. */
  loading: boolean;
  /** Set when reading or writing failed — e.g. outside a WebKitGTK environment. Cleared on the next successful write. */
  error: Error | null;
}

function toError(reason: unknown): Error {
  return reason instanceof Error ? reason : new Error(String(reason));
}

/**
 * Reads and writes a single `GSettings` key as reactive React state.
 *
 * Starts at `defaultValue` and resolves to the real value once the initial
 * read completes. Re-renders on external changes too — another app,
 * `dconf-editor`, `gsettings set` from a terminal — via the bridge's
 * `onSettingChanged`.
 *
 * Outside a WebKitGTK environment (a browser, Storybook, tests) there is no
 * equivalent for reading/writing settings — `value` stays at `defaultValue`
 * forever and `error` is set. See `@gnome-ui/platform`'s `settings` module.
 *
 * @example
 * const { value: darkMode, setValue: setDarkMode, loading } = useSettings('prefer-dark', false);
 *
 * <Switch checked={darkMode} onChange={setDarkMode} disabled={loading} />
 */
export function useSettings<T = unknown>(key: string, defaultValue: T): UseSettingsResult<T> {
  const [value, setValueState] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError(null);

    (async () => {
      try {
        const next = await getSetting<T>(key);

        if (active) {
          setValueState(next);
        }
      } catch (reason) {
        if (active) {
          setError(toError(reason));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    const unsubscribe = onSettingChanged<T>(key, (next) => {
      if (active) {
        setValueState(next);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [key]);

  const setValue = useCallback(
    (next: T) => {
      setValueState(next);

      (async () => {
        try {
          await setSetting(key, next);
          setError(null);
        } catch (reason) {
          setError(toError(reason));
        }
      })();
    },
    [key],
  );

  return { value, setValue, loading, error };
}
