import { isWebKitBridge, onNativeEvent, postMessageAndWait } from '../bridge';

export interface PortalCallOptions {
  /** XDG portal interface name, e.g. `"org.freedesktop.portal.OpenURI"`. */
  interface: string;
  /** Method name on that interface, e.g. `"OpenURI"`. */
  method: string;
  /** Method arguments, forwarded as-is to the D-Bus call. */
  args?: Record<string, unknown>;
}

const CALL_RESPONSE_EVENT = 'portal-call-result';
const SIGNAL_EVENT = 'portal-signal';

/**
 * Calls an arbitrary XDG Desktop Portal method and waits for its response.
 *
 * This is the generic escape hatch behind the more specific portal-backed
 * modules — reach for it when the app needs a portal interface this package
 * doesn't wrap in a dedicated module yet (`OpenURI`, `Email`, `Print`,
 * `Account`, `Background`, `Inhibit`, `Location`, `ScreenCast`, …).
 *
 * The real XDG portal protocol is itself request/response over D-Bus: a
 * method call returns a `Request` object path immediately, and the actual
 * result arrives later as a `Response` signal on that path. The GJS host is
 * responsible for bridging that two-step protocol into a single
 * `gnome:portal-call-result` event (`{ requestId, result }`) — this posts
 * the call and waits for it, same as every other request/response
 * operation in this package.
 *
 * WebKitGTK only — portals are meaningless outside a sandboxed GNOME host.
 */
export async function callPortal<T = unknown>(options: PortalCallOptions): Promise<T> {
  if (!isWebKitBridge()) {
    throw new Error('Portal access is not supported outside a WebKitGTK environment.');
  }

  const detail = await postMessageAndWait<{ requestId: string; result: T }>(
    'portals',
    { interface: options.interface, method: options.method, args: options.args ?? {} },
    CALL_RESPONSE_EVENT,
  );

  return detail.result;
}

/**
 * Subscribes to an ongoing D-Bus signal on a portal interface — e.g.
 * `org.freedesktop.portal.Settings`'s `SettingChanged`, or session update
 * signals from `org.freedesktop.portal.ScreenCast`.
 *
 * The GJS host dispatches `gnome:portal-signal` (`{ interface, signal,
 * payload }`) for every signal it's been told to forward; this filters down
 * to the one interface/signal pair the caller asked about, mirroring
 * `onSettingChanged`'s per-key filtering and `onNotificationAction`'s
 * per-id filtering.
 *
 * Returns an unsubscribe function. Outside a WebKitGTK bridge this still
 * returns a valid unsubscribe function, it just never fires — there is no
 * live D-Bus connection to listen on.
 */
export function onPortalSignal<T = unknown>(
  interfaceName: string,
  signal: string,
  handler: (payload: T) => void,
): () => void {
  return onNativeEvent<{ interface: string; signal: string; payload: T }>(
    SIGNAL_EVENT,
    (detail) => {
      if (detail.interface === interfaceName && detail.signal === signal) {
        handler(detail.payload);
      }
    },
  );
}
