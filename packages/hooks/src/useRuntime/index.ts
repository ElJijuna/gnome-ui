import type { RuntimeInfo } from '@gnome-ui/platform';
import { getRuntime } from '@gnome-ui/platform';
import { useMemo } from 'react';

/**
 * Returns a snapshot of the current runtime environment.
 *
 * @example
 * const { shell, engine, browser, os } = useRuntime();
 *
 * if (shell === "webkitgtk-webview") // GJS message handlers available
 * if (browser.epiphany)              // running inside Epiphany / GNOME Web
 * if (shell === "pwa")               // installed PWA
 * if (os.linux)                      // Linux host
 */
export function useRuntime(): RuntimeInfo {
  return useMemo(() => getRuntime(), []);
}
