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

// ---------------------------------------------------------------------------
// Native → Web events
//
// The GJS host dispatches events by evaluating JS in the WebView:
//
//   webView.evaluate_javascript(
//     `window.dispatchEvent(new CustomEvent("gnome:open-modal", { detail: { id: "settings" } }))`,
//     -1, null, null, null, null
//   );
//
// All events use the "gnome:" prefix to avoid collisions with other DOM events.
// ---------------------------------------------------------------------------

const NATIVE_EVENT_PREFIX = "gnome:";

export type NativeEventHandler<T = unknown> = (payload: T) => void;

/**
 * Subscribe to a native event dispatched by the GJS host.
 * Returns an unsubscribe function — call it to clean up.
 *
 * @example
 * const off = onNativeEvent("open-modal", (payload) => openModal(payload.id));
 * // later:
 * off();
 */
export function onNativeEvent<T = unknown>(
  type: string,
  handler: NativeEventHandler<T>
): () => void {
  if (typeof window === "undefined") return () => {};

  const listener = (event: Event) =>
    handler((event as CustomEvent<T>).detail);

  window.addEventListener(NATIVE_EVENT_PREFIX + type, listener);
  return () => window.removeEventListener(NATIVE_EVENT_PREFIX + type, listener);
}
