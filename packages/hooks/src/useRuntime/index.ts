import { useMemo } from "react";
import { getRuntime } from "@gnome-ui/platform";
import type { RuntimeInfo } from "@gnome-ui/platform";

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
