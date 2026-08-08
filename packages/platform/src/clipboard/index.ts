import { isWebKitBridge, postMessage, postMessageAndWait } from '../bridge';

const READ_TEXT_RESPONSE_EVENT = 'clipboard-read-text-result';
const READ_IMAGE_RESPONSE_EVENT = 'clipboard-read-image-result';
const READ_FILES_RESPONSE_EVENT = 'clipboard-read-files-result';

// Same constraint as `fileChooser`: browsers deliberately never expose real
// filesystem paths to page scripts, so there is no honest way to fake a
// files clipboard fallback — `readFiles`/`writeFiles` are WebKitGTK-only.
function assertBridgeAvailableForFiles(action: string): void {
  if (!isWebKitBridge()) {
    throw new Error(
      `Clipboard ${action} is not supported outside a WebKitGTK environment — browsers do not expose real filesystem paths to page scripts.`,
    );
  }
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

/**
 * Reads an image from the system clipboard as a `data:` URL. Resolves with
 * `null` when the clipboard has no image on it — that's a normal, expected
 * state, not an error.
 *
 * - **WebKitGTK**: `Gdk.Clipboard`'s image read is async for the same reason
 *   `readText`'s is, so this goes through the same `postMessageAndWait`
 *   round trip. The host encodes the `Gdk.Texture` as a base64 `data:` URL
 *   before sending it across the bridge — raw pixel buffers can't cross it.
 * - **Browser / PWA**: uses the real `navigator.clipboard.read()`, looking
 *   for an `image/*` `ClipboardItem` type and converting its `Blob` to a
 *   `data:` URL via `FileReader`, so both paths return the same shape.
 * - Rejects if neither is available.
 */
export async function readImage(): Promise<string | null> {
  if (isWebKitBridge()) {
    const detail = await postMessageAndWait<{ requestId: string; dataUrl: string | null }>(
      'clipboard',
      { action: 'readImage' },
      READ_IMAGE_RESPONSE_EVENT,
    );

    return detail.dataUrl;
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard?.read) {
    const items = await navigator.clipboard.read();

    for (const item of items) {
      const imageType = item.types.find((type) => type.startsWith('image/'));

      if (imageType) {
        return blobToDataUrl(await item.getType(imageType));
      }
    }

    return null;
  }

  throw new Error('Clipboard image read is not supported in this environment.');
}

/**
 * Writes an image (as a `data:` URL) to the system clipboard.
 *
 * - **WebKitGTK**: forwards the `data:` URL to the GJS host, which decodes
 *   it into a `Gdk.Texture` and calls `Gdk.Clipboard.set()`. Fire-and-forget,
 *   matching `postMessage`'s contract.
 * - **Browser / PWA**: converts the `data:` URL to a `Blob` and uses the
 *   real `navigator.clipboard.write()` with a `ClipboardItem`.
 * - Rejects if neither is available.
 */
export async function writeImage(dataUrl: string): Promise<void> {
  if (isWebKitBridge()) {
    await postMessage('clipboard', { action: 'writeImage', dataUrl });

    return;
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard?.write) {
    const blob = await dataUrlToBlob(dataUrl);

    await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);

    return;
  }

  throw new Error('Clipboard image write is not supported in this environment.');
}

/**
 * Reads the file paths currently on the system clipboard (e.g. after
 * copying files in Nautilus). Resolves with an empty array when there are
 * none — that's a normal, expected state, not an error.
 *
 * WebKitGTK only, request/response correlated the same way as `readText` —
 * see `assertBridgeAvailableForFiles` for why there is no browser fallback.
 */
export async function readFiles(): Promise<string[]> {
  assertBridgeAvailableForFiles('file read');

  const detail = await postMessageAndWait<{ requestId: string; paths: string[] }>(
    'clipboard',
    { action: 'readFiles' },
    READ_FILES_RESPONSE_EVENT,
  );

  return detail.paths;
}

/**
 * Puts references to the given file paths on the system clipboard (e.g. so
 * pasting into Nautilus copies those files there) — this copies file
 * *references*, not their contents.
 *
 * WebKitGTK only, fire-and-forget — see `assertBridgeAvailableForFiles` for
 * why there is no browser fallback.
 */
export async function writeFiles(paths: string[]): Promise<void> {
  assertBridgeAvailableForFiles('file write');

  await postMessage('clipboard', { action: 'writeFiles', paths });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read image blob.'));
    reader.readAsDataURL(blob);
  });
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl);

  return response.blob();
}
