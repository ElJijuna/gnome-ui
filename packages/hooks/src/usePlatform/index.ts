import { useMemo } from "react";
import { getRuntime } from "@gnome-ui/platform";

export interface PlatformInfo {
  /** True when running inside a WebKitGTK WebView with a GJS host (GNOME native app). */
  isGnomeWebView: boolean;
  /** True when running as an installed PWA (standalone display-mode). */
  isPWA: boolean;
  /** True when running inside an Electron shell. */
  isElectron: boolean;
  /** True when running in a regular browser tab. */
  isBrowser: boolean;
  /** True when running inside GNOME Web (Epiphany). */
  isEpiphany: boolean;
}

/**
 * Returns convenience boolean flags about the current platform context.
 *
 * @example
 * const { isGnomeWebView } = usePlatform();
 * if (isGnomeWebView) return null; // hide component inside GNOME native app
 */
export function usePlatform(): PlatformInfo {
  return useMemo(() => {
    const { shell, browser } = getRuntime();
    return {
      isGnomeWebView: shell === "webkitgtk-webview",
      isPWA: shell === "pwa",
      isElectron: shell === "electron",
      isBrowser: shell === "browser",
      isEpiphany: browser.epiphany,
    };
  }, []);
}
