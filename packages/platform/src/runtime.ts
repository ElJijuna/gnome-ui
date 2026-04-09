/**
 * Runtime environment detection.
 *
 * Returns a structured snapshot of the current execution context:
 * shell (how the app is launched), engine (rendering engine),
 * browser identity, and OS flags.
 */

export type Shell =
  | "browser"          // regular browser tab
  | "pwa"              // installed PWA / standalone display-mode
  | "electron"         // Electron shell
  | "webkitgtk-webview"; // embedded WebKitGTK WebView with GJS host

export type Engine =
  | "webkit"    // WebKitGTK, Epiphany, Safari
  | "blink"     // Chromium, Chrome, Edge, Brave
  | "gecko"     // Firefox
  | "unknown";

export interface RuntimeBrowser {
  epiphany: boolean;
  chrome: boolean;
  firefox: boolean;
  safari: boolean;
  edge: boolean;
  brave: boolean;
}

export interface RuntimeOS {
  android: boolean;
  ios: boolean;
  linux: boolean;
  mac: boolean;
  windows: boolean;
}

export interface RuntimeInfo {
  shell: Shell;
  engine: Engine;
  browser: RuntimeBrowser;
  os: RuntimeOS;
}

function detectShell(): Shell {
  if (typeof window === "undefined") return "browser";

  // Electron exposes process.versions.electron on the renderer window
  if (
    typeof (window as Window & { process?: { versions?: { electron?: string } } })
      .process?.versions?.electron === "string"
  ) {
    return "electron";
  }

  // WebKitGTK embedded WebView: GJS host registers message handlers
  if (typeof window.webkit?.messageHandlers === "object") {
    return "webkitgtk-webview";
  }

  // Installed PWA / standalone display-mode
  if (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  ) {
    return "pwa";
  }

  return "browser";
}

function detectEngine(ua: string): Engine {
  // Blink: Chrome / Chromium / Edge / Brave all include "Chrome" in the UA
  if (/Chrome\//.test(ua)) return "blink";
  // Gecko: Firefox
  if (/Gecko\//.test(ua) && /Firefox\//.test(ua)) return "gecko";
  // WebKit: Safari, Epiphany, WebKitGTK
  if (/AppleWebKit\//.test(ua)) return "webkit";
  return "unknown";
}

function detectBrowser(ua: string): RuntimeBrowser {
  return {
    epiphany: /Epiphany\//.test(ua),
    // Edge identifies itself with "Edg/" (not "Edge")
    edge: /Edg\//.test(ua),
    // Brave exposes navigator.brave at runtime — UA alone is not reliable
    brave:
      typeof (navigator as Navigator & { brave?: { isBrave?: unknown } })
        .brave?.isBrave !== "undefined",
    // Chrome: present but not Edge/Brave
    chrome: /Chrome\//.test(ua) && !/Edg\//.test(ua),
    firefox: /Firefox\//.test(ua),
    // Safari: WebKit-based but not Blink and not Epiphany
    safari:
      /Safari\//.test(ua) &&
      !/Chrome\//.test(ua) &&
      !/Epiphany\//.test(ua),
  };
}

function detectOS(ua: string): RuntimeOS {
  const android = /Android/.test(ua);
  const ios = /iPhone|iPad|iPod/.test(ua);
  // Linux: present in WebKitGTK / Epiphany / Linux Chrome — exclude Android
  const linux = /Linux/.test(ua) && !android;
  const mac = /Macintosh/.test(ua);
  const windows = /Windows/.test(ua);
  return { android, ios, linux, mac, windows };
}

let cached: RuntimeInfo | undefined;

/**
 * Returns a snapshot of the current runtime environment.
 * The result is memoized — call once at app startup or inside a hook.
 */
export function getRuntime(): RuntimeInfo {
  if (cached) return cached;

  const ua =
    typeof navigator !== "undefined" ? navigator.userAgent : "";

  cached = {
    shell: detectShell(),
    engine: detectEngine(ua),
    browser: detectBrowser(ua),
    os: detectOS(ua),
  };

  return cached;
}
