import { isWebKitBridge, onNativeEvent, postMessage, postMessageAndWait } from '../bridge';

const GET_RESPONSE_EVENT = 'settings-get-result';
const CHANGED_EVENT = 'settings-changed';

/**
 * Reads a `GSettings` value by key.
 *
 * `Gio.Settings.get_value()` runs host-side, out of process from the web
 * layer, so this posts a `get` request and waits for the GJS host to
 * dispatch a matching `gnome:settings-get-result` event
 * (`{ requestId, value }`) via `postMessageAndWait`. Rejects after 5s if the
 * host never replies, and always in a non-WebKit environment — there is no
 * browser equivalent of an app-schema-scoped `GSettings` store to fall back
 * to (unlike `clipboard`, which has a real `navigator.clipboard`).
 */
export async function getSetting<T = unknown>(key: string): Promise<T> {
  if (!isWebKitBridge()) {
    throw new Error('Settings are not supported in this environment.');
  }

  const detail = await postMessageAndWait<{ requestId: string; value: T }>(
    'settings',
    { action: 'get', key },
    GET_RESPONSE_EVENT,
  );

  return detail.value;
}

/**
 * Writes a `GSettings` value by key.
 *
 * Fire-and-forget, matching `postMessage`'s contract — the returned promise
 * resolves once the request is dispatched, not once `GSettings` has actually
 * persisted the write. Rejects in a non-WebKit environment (see `getSetting`
 * for why there is no browser fallback).
 */
export async function setSetting(key: string, value: unknown): Promise<void> {
  if (!isWebKitBridge()) {
    throw new Error('Settings are not supported in this environment.');
  }

  await postMessage('settings', { action: 'set', key, value });
}

/**
 * Subscribes to changes for a single settings key.
 *
 * `GSettings`' underlying `changed` signal fires for the schema as a whole —
 * this filters down to the one key the caller asked about. It fires both for
 * writes made through `setSetting` from this same window and for external
 * changes (another app, `dconf-editor`, `gsettings set` from a terminal).
 *
 * Returns an unsubscribe function. Outside a WebKitGTK bridge this still
 * returns a valid unsubscribe function, it just never fires — there is no
 * live `GSettings` source to watch.
 */
export function onSettingChanged<T = unknown>(
  key: string,
  handler: (value: T) => void,
): () => void {
  return onNativeEvent<{ key: string; value: T }>(CHANGED_EVENT, (detail) => {
    if (detail.key === key) {
      handler(detail.value);
    }
  });
}
