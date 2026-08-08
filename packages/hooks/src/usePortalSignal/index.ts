import { onPortalSignal } from '@gnome-ui/platform';
import { useEffect, useRef } from 'react';

/**
 * Subscribe to an XDG Desktop Portal D-Bus signal — e.g.
 * `org.freedesktop.portal.Settings`'s `SettingChanged`, or session updates
 * from `org.freedesktop.portal.ScreenCast`. The subscription is
 * automatically removed when the component unmounts, and re-subscribed
 * whenever `interfaceName` or `signal` changes.
 *
 * Outside a WebKitGTK bridge this never fires — there is no live D-Bus
 * connection to listen on — but still subscribes/unsubscribes cleanly.
 *
 * @example
 * usePortalSignal("org.freedesktop.portal.Settings", "SettingChanged", (payload) => {
 *   console.log("Setting changed:", payload);
 * });
 */
export function usePortalSignal<T = unknown>(
  interfaceName: string,
  signal: string,
  handler: (payload: T) => void,
): void {
  // Keep a stable ref so the effect does not re-subscribe on every render
  // when the handler is defined inline.
  const handlerRef = useRef(handler);

  handlerRef.current = handler;

  useEffect(() => {
    return onPortalSignal<T>(interfaceName, signal, (payload) => handlerRef.current(payload));
  }, [interfaceName, signal]);
}
