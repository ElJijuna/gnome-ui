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
      messageHandlers: Record<string, { postMessage: (payload: unknown) => void }>;
    };
  }
}

export type BridgeChannel =
  | 'settings'
  | 'notifications'
  | 'fileChooser'
  | 'colorScheme'
  | 'window'
  | 'clipboard'
  | 'portals'
  | 'hapticFeedback';

/** Returns true when running inside a WebKitGTK WebView with a GJS host. */
export function isWebKitBridge(): boolean {
  return typeof window !== 'undefined' && typeof window.webkit?.messageHandlers === 'object';
}

/**
 * Post a message to a named GJS handler.
 * In non-WebKit environments this is a no-op and resolves immediately.
 */
export function postMessage(channel: BridgeChannel, payload: unknown): Promise<void> {
  if (!isWebKitBridge()) {
    return Promise.resolve();
  }

  try {
    window.webkit?.messageHandlers[channel]?.postMessage(payload);
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

const NATIVE_EVENT_PREFIX = 'gnome:';

export type NativeEventHandler<T = unknown> = (payload: T) => void;

/**
 * Subscribe to a native event dispatched by the GJS host.
 * Returns an unsubscribe function — call it to clean up.
 *
 * **Security note:** events arrive as plain DOM `CustomEvent`s, so any script
 * running in the page can forge them — there is no way to verify the sender.
 * Treat payloads as untrusted input: validate their shape, and never gate a
 * privileged action (e.g. granting access, executing commands) solely on
 * receiving one of these events. This matters especially if the WebView ever
 * renders third-party content.
 *
 * @example
 * const off = onNativeEvent("open-modal", (payload) => openModal(payload.id));
 * // later:
 * off();
 */
export function onNativeEvent<T = unknown>(
  type: string,
  handler: NativeEventHandler<T>,
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const listener = (event: Event) => handler((event as CustomEvent<T>).detail);

  window.addEventListener(NATIVE_EVENT_PREFIX + type, listener);

  return () => window.removeEventListener(NATIVE_EVENT_PREFIX + type, listener);
}

// ---------------------------------------------------------------------------
// Request/response round trips
//
// Several host operations (GDK clipboard reads, GSettings reads, file
// choosers…) are inherently asynchronous on the GJS side, so a single
// fire-and-forget `postMessage` isn't enough — the host's reply has to be
// matched back to the specific call that triggered it, especially when
// several calls are in flight concurrently. `postMessageAndWait` is the
// shared request/response primitive for that: it tags the outgoing message
// with a `requestId`, and resolves once the host dispatches a native event
// carrying that same `requestId` back.
// ---------------------------------------------------------------------------

let requestCounter = 0;

function nextRequestId(channel: BridgeChannel): string {
  requestCounter += 1;

  return `${channel}-${requestCounter}`;
}

const DEFAULT_REQUEST_TIMEOUT_MS = 5000;

/**
 * Posts a message to a named GJS handler and waits for a matching native
 * response event.
 *
 * The host must reply by dispatching `gnome:${responseEvent}` with a
 * `CustomEvent.detail` that includes the same `requestId` sent in the
 * request payload — that's how the response gets matched back to this
 * specific call rather than some other concurrent request on the same
 * channel.
 *
 * Rejects after `timeoutMs` (default 5s) if no matching response arrives
 * — e.g. because the WebView shell hasn't implemented this channel yet.
 */
export function postMessageAndWait<TResponse extends { requestId: string }>(
  channel: BridgeChannel,
  payload: Record<string, unknown>,
  responseEvent: string,
  timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
): Promise<TResponse> {
  const requestId = nextRequestId(channel);

  return new Promise<TResponse>((resolve, reject) => {
    let settled = false;

    const unsubscribe = onNativeEvent<TResponse>(responseEvent, (detail) => {
      if (settled || detail.requestId !== requestId) {
        return;
      }

      settled = true;
      clearTimeout(timer);
      unsubscribe();
      resolve(detail);
    });

    const timer = setTimeout(() => {
      if (settled) {
        return;
      }

      settled = true;
      unsubscribe();
      reject(
        new Error(`Timed out waiting for a "${responseEvent}" response to a "${channel}" request.`),
      );
    }, timeoutMs);

    postMessage(channel, { ...payload, requestId });
  });
}
