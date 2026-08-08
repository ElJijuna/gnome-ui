import type { ColorScheme, ColorSchemePreference } from '@gnome-ui/platform';
import { getColorScheme, onColorSchemeChanged, setColorScheme } from '@gnome-ui/platform';
import { useCallback, useEffect, useState } from 'react';

export interface UseColorSchemeResult {
  /** Current resolved scheme. Defaults to `"light"` until the first read completes. */
  scheme: ColorScheme;
  /** Sets this app's color scheme preference (`"light"` | `"dark"` | `"system"`). */
  setScheme: (preference: ColorSchemePreference) => void;
  /** True until the first read completes. */
  loading: boolean;
  /** Set when reading or writing failed — e.g. `setScheme` outside a WebKitGTK environment. Cleared on the next successful write. */
  error: Error | null;
}

function toError(reason: unknown): Error {
  return reason instanceof Error ? reason : new Error(String(reason));
}

/**
 * Reactive resolved color scheme (`"light"` | `"dark"`), synced with
 * `@gnome-ui/platform`'s `colorScheme` module.
 *
 * Not the same thing as `GnomeProvider`'s `resolvedColorScheme` in
 * `@gnome-ui/react` — that one drives your CSS theme (a `data-theme`
 * attribute) from a plain `matchMedia` read and works everywhere. This hook
 * talks to `Adw.StyleManager` through the platform bridge, so `setScheme`
 * forces *this app's own* Adwaita rendering independently of your CSS —
 * reach for it only if you specifically need that. Outside a WebKitGTK
 * environment `setScheme` has no effect (see `error`); use `GnomeProvider`'s
 * `colorScheme` prop there instead.
 *
 * @example
 * const { scheme, setScheme } = useColorScheme();
 *
 * <button onClick={() => setScheme(scheme === "dark" ? "light" : "dark")}>
 *   Switch to {scheme === "dark" ? "light" : "dark"} mode
 * </button>
 */
export function useColorScheme(): UseColorSchemeResult {
  const [scheme, setSchemeState] = useState<ColorScheme>('light');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const initial = await getColorScheme();

        if (active) {
          setSchemeState(initial);
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

    const unsubscribe = onColorSchemeChanged((next) => {
      if (active) {
        setSchemeState(next);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const setScheme = useCallback((preference: ColorSchemePreference) => {
    (async () => {
      try {
        await setColorScheme(preference);
        setError(null);
      } catch (reason) {
        setError(toError(reason));
      }
    })();
  }, []);

  return { scheme, setScheme, loading, error };
}
