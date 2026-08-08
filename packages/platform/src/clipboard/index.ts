import { isWebKitBridge, onNativeEvent, postMessage } from '../bridge';

const READ_TEXT_RESPONSE_EVENT = 'clipboard-read-text-result';
const READ_TEXT_TIMEOUT_MS = 5000;

let requestCounter = 0;

function nextRequestId(): string {
  requestCounter += 1;

  return `clipboard-read-${requestCounter}`;
}

/**
 * Writes text to the system clipboard.
 *
 * - **WebKitGTK**: forwards to the GJS host, which calls `Gdk.Clipboard.set()`.
 *   Fire-and-forget, matching `postMessage`'s contract — the returned promise
 *   resolves once the request is dispatched, not once GDK has actually
 *   finished the write.
 * - **Browser / PWA**: uses the real `navigator.clipboard.writeText()`.
 * - Rejects if neither is available.
 */
export async function writeText(text: string): Promise<void> {
  if (isWebKitBridge()) {
    await postMessage('clipboard', { action: 'writeText', text });

    return;
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);

    return;
  }

  throw new Error('Clipboard write is not supported in this environment.');
}

/**
 * Reads text from the system clipboard.
 *
 * - **WebKitGTK**: `Gdk.Clipboard.read_text_async()` is inherently
 *   asynchronous, so this posts a `readText` request carrying a `requestId`
 *   and waits for the GJS host to dispatch a matching
 *   `gnome:clipboard-read-text-result` event (`{ requestId, text }`) — the
 *   `requestId` is what matches the response back to this specific call when
 *   several reads are in flight concurrently. Rejects after 5s if the host
 *   never replies (e.g. the WebView shell hasn't implemented this channel).
 * - **Browser / PWA**: uses the real `navigator.clipboard.readText()`.
 * - Rejects if neither is available.
 */
export function readText(): Promise<string> {
  if (isWebKitBridge()) {
    return readTextViaBridge();
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard?.readText) {
    return navigator.clipboard.readText();
  }

  return Promise.reject(new Error('Clipboard read is not supported in this environment.'));
}

function readTextViaBridge(): Promise<string> {
  const requestId = nextRequestId();

  return new Promise<string>((resolve, reject) => {
    let settled = false;

    const unsubscribe = onNativeEvent<{ requestId: string; text: string }>(
      READ_TEXT_RESPONSE_EVENT,
      (detail) => {
        if (settled || detail.requestId !== requestId) {
          return;
        }

        settled = true;
        clearTimeout(timer);
        unsubscribe();
        resolve(detail.text);
      },
    );

    const timer = setTimeout(() => {
      if (settled) {
        return;
      }

      settled = true;
      unsubscribe();
      reject(new Error('Timed out waiting for the clipboard read response from the host.'));
    }, READ_TEXT_TIMEOUT_MS);

    postMessage('clipboard', { action: 'readText', requestId });
  });
}
