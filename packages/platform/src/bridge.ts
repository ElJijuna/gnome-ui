/**
 * Low-level bridge between the web layer and the GNOME host process.
 *
 * Resolution order:
 *  1. WebKitGTK  — `window.webkit.messageHandlers` (GJS host, full access)
 *  2. Stub       — no-op fallback for browsers and test environments
 */

declare global {
  interface Window {
    webkit?: {
      messageHandlers: Record<
        string,
        { postMessage: (payload: unknown) => void }
      >;
    };
  }
}

export type BridgeChannel =
  | "settings"
  | "notifications"
  | "fileChooser"
  | "colorScheme"
  | "window"
  | "clipboard"
  | "portals";

/** Returns true when running inside a WebKitGTK WebView with a GJS host. */
export function isWebKitBridge(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.webkit?.messageHandlers === "object"
  );
}

/**
 * Post a message to a named GJS handler.
 * In non-WebKit environments this is a no-op and resolves immediately.
 */
export function postMessage(
  channel: BridgeChannel,
  payload: unknown
): Promise<void> {
  if (!isWebKitBridge()) return Promise.resolve();
  try {
    window.webkit!.messageHandlers[channel]?.postMessage(payload);
  } catch {
    // ignore — handler not registered yet
  }
  return Promise.resolve();
}
