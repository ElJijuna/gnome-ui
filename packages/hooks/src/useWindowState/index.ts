import type { WindowState } from '@gnome-ui/platform';
import {
  closeWindow as closeWindowViaPlatform,
  getWindowState,
  minimizeWindow as minimizeWindowViaPlatform,
  onWindowStateChanged,
  setFullscreen as setFullscreenViaPlatform,
  setMaximized as setMaximizedViaPlatform,
} from '@gnome-ui/platform';
import { useCallback, useEffect, useState } from 'react';

export interface UseWindowStateResult extends WindowState {
  /** Maximizes or restores the window. WebKitGTK only — no browser equivalent, see `error`. */
  setMaximized: (maximized: boolean) => void;
  /** Enters or exits fullscreen. Falls back to the real Fullscreen API in a browser. */
  setFullscreen: (fullscreen: boolean) => void;
  /** Minimizes the window. WebKitGTK only — no browser equivalent, see `error`. */
  minimize: () => void;
  /** Requests that the window close. Falls back to the real `window.close()` in a browser (subject to the browser's own script-only restriction). */
  close: () => void;
  /** True until the first read completes. */
  loading: boolean;
  /** Set when the last read or action failed — e.g. `setMaximized`/`minimize` outside a WebKitGTK environment. Cleared on the next successful action. */
  error: Error | null;
}

const INITIAL_STATE: WindowState = { maximized: false, fullscreen: false, focused: false };

function toError(reason: unknown): Error {
  return reason instanceof Error ? reason : new Error(String(reason));
}

/**
 * Reactive window state (`maximized`, `fullscreen`, `focused`) plus
 * matching actions, synced with `@gnome-ui/platform`'s `window` module.
 *
 * `setMaximized`/`minimize` are WebKitGTK-only — there is no browser
 * equivalent (see `error`). `setFullscreen`/`close` fall back to the real
 * Fullscreen API / `window.close()` in a browser. `maximized` is always
 * `false` outside WebKitGTK — no browser API exposes whether the OS window
 * chrome is maximized.
 *
 * @example
 * const { maximized, fullscreen, setFullscreen, close } = useWindowState();
 *
 * <button onClick={() => setFullscreen(!fullscreen)}>
 *   {fullscreen ? "Exit" : "Enter"} fullscreen
 * </button>
 */
export function useWindowState(): UseWindowStateResult {
  const [state, setState] = useState<WindowState>(INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const initial = await getWindowState();

        if (active) {
          setState(initial);
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

    const unsubscribe = onWindowStateChanged((next) => {
      if (active) {
        setState(next);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const runAction = useCallback((run: () => Promise<void>) => {
    (async () => {
      try {
        await run();
        setError(null);
      } catch (reason) {
        setError(toError(reason));
      }
    })();
  }, []);

  const setMaximized = useCallback(
    (maximized: boolean) => runAction(() => setMaximizedViaPlatform(maximized)),
    [runAction],
  );
  const setFullscreen = useCallback(
    (fullscreen: boolean) => runAction(() => setFullscreenViaPlatform(fullscreen)),
    [runAction],
  );
  const minimize = useCallback(() => runAction(() => minimizeWindowViaPlatform()), [runAction]);
  const close = useCallback(() => runAction(() => closeWindowViaPlatform()), [runAction]);

  return { ...state, setMaximized, setFullscreen, minimize, close, loading, error };
}
