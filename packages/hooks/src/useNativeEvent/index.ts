import { useEffect, useRef } from "react";
import { onNativeEvent } from "@gnome-ui/platform";
import type { NativeEventHandler } from "@gnome-ui/platform";

/**
 * Subscribe to a native event dispatched by the GJS host.
 * The subscription is automatically removed when the component unmounts.
 *
 * The GJS host dispatches events by evaluating JS in the WebView:
 * ```js
 * webView.evaluate_javascript(
 *   `window.dispatchEvent(new CustomEvent("gnome:open-modal", { detail: { id: "settings" } }))`,
 *   -1, null, null, null, null
 * );
 * ```
 *
 * @example
 * useNativeEvent("open-modal", (payload) => {
 *   setOpen(true);
 * });
 */
export function useNativeEvent<T = unknown>(
  type: string,
  handler: NativeEventHandler<T>
): void {
  // Keep a stable ref so the effect does not re-subscribe on every render
  // when the handler is defined inline.
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    return onNativeEvent<T>(type, (payload) => handlerRef.current(payload));
  }, [type]);
}
