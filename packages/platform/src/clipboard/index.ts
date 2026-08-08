import { isWebKitBridge, postMessage, postMessageAndWait } from '../bridge';

const READ_TEXT_RESPONSE_EVENT = 'clipboard-read-text-result';

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
 *   asynchronous, so this posts a `readText` request and waits for the GJS
 *   host to dispatch a matching `gnome:clipboard-read-text-result` event
 *   (`{ requestId, text }`) via `postMessageAndWait` — the `requestId` is
 *   what matches the response back to this specific call when several reads
 *   are in flight concurrently. Rejects after 5s if the host never replies
 *   (e.g. the WebView shell hasn't implemented this channel).
 * - **Browser / PWA**: uses the real `navigator.clipboard.readText()`.
 * - Rejects if neither is available.
 */
export async function readText(): Promise<string> {
  if (isWebKitBridge()) {
    const detail = await postMessageAndWait<{ requestId: string; text: string }>(
      'clipboard',
      { action: 'readText' },
      READ_TEXT_RESPONSE_EVENT,
    );

    return detail.text;
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard?.readText) {
    return navigator.clipboard.readText();
  }

  throw new Error('Clipboard read is not supported in this environment.');
}
