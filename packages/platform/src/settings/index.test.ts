import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getSetting, onSettingChanged, setSetting } from './index.ts';

type WebKitWindow = Window & {
  webkit?: {
    messageHandlers: Record<string, { postMessage: (payload: unknown) => void }>;
  };
};

function setWebKit(handlers: Record<string, { postMessage: (payload: unknown) => void }>) {
  (window as WebKitWindow).webkit = { messageHandlers: handlers };
}

function clearWebKit() {
  delete (window as WebKitWindow).webkit;
}

function respondToGet(requestId: string, value: unknown) {
  window.dispatchEvent(
    new CustomEvent('gnome:settings-get-result', { detail: { requestId, value } }),
  );
}

function emitChanged(key: string, value: unknown) {
  window.dispatchEvent(new CustomEvent('gnome:settings-changed', { detail: { key, value } }));
}

describe('getSetting', () => {
  beforeEach(clearWebKit);
  afterEach(() => {
    vi.useRealTimers();
  });

  it('rejects outside a WebKit environment — there is no browser fallback', async () => {
    await expect(getSetting('color-scheme')).rejects.toThrow(
      'Settings are not supported in this environment.',
    );
  });

  it('resolves with the value from a matching get-result event', async () => {
    const spy = vi.fn((payload: { requestId: string; action: string; key: string }) => {
      respondToGet(payload.requestId, 'dark');
    });

    setWebKit({ settings: { postMessage: spy } });

    await expect(getSetting<string>('color-scheme')).resolves.toBe('dark');
    expect(spy).toHaveBeenCalledWith({
      action: 'get',
      key: 'color-scheme',
      requestId: expect.any(String),
    });
  });

  it('matches concurrent reads of different keys to their own response', async () => {
    const requestIdByKey = new Map<string, string>();

    setWebKit({
      settings: {
        postMessage: vi.fn((payload: { requestId: string; key: string }) => {
          requestIdByKey.set(payload.key, payload.requestId);
        }),
      },
    });

    const fontSize = getSetting<number>('font-size');
    const colorScheme = getSetting<string>('color-scheme');

    // Resolve out of order to prove matching is by requestId, not call order.
    respondToGet(requestIdByKey.get('color-scheme')!, 'light');
    respondToGet(requestIdByKey.get('font-size')!, 14);

    await expect(fontSize).resolves.toBe(14);
    await expect(colorScheme).resolves.toBe('light');
  });

  it('rejects if the host never responds', async () => {
    vi.useFakeTimers();
    setWebKit({ settings: { postMessage: vi.fn() } });

    const pending = getSetting('color-scheme');
    const assertion = expect(pending).rejects.toThrow(/Timed out waiting/);

    await vi.advanceTimersByTimeAsync(5000);
    await assertion;
  });
});

describe('setSetting', () => {
  beforeEach(clearWebKit);

  it('rejects outside a WebKit environment — there is no browser fallback', async () => {
    await expect(setSetting('color-scheme', 'dark')).rejects.toThrow(
      'Settings are not supported in this environment.',
    );
  });

  it('forwards the key and value to the settings bridge channel', async () => {
    const spy = vi.fn();

    setWebKit({ settings: { postMessage: spy } });
    await setSetting('color-scheme', 'dark');

    expect(spy).toHaveBeenCalledWith({ action: 'set', key: 'color-scheme', value: 'dark' });
  });
});

describe('onSettingChanged', () => {
  it('calls the handler when the changed event matches the subscribed key', () => {
    const handler = vi.fn();
    const off = onSettingChanged('color-scheme', handler);

    emitChanged('color-scheme', 'dark');
    expect(handler).toHaveBeenCalledWith('dark');
    off();
  });

  it('ignores changes to a different key', () => {
    const handler = vi.fn();
    const off = onSettingChanged('color-scheme', handler);

    emitChanged('font-size', 14);
    expect(handler).not.toHaveBeenCalled();
    off();
  });

  it('stops firing after unsubscribing', () => {
    const handler = vi.fn();
    const off = onSettingChanged('color-scheme', handler);

    off();
    emitChanged('color-scheme', 'dark');
    expect(handler).not.toHaveBeenCalled();
  });

  it('fires again for a later external change to the same key (e.g. dconf-editor)', () => {
    const handler = vi.fn();
    const off = onSettingChanged('color-scheme', handler);

    emitChanged('color-scheme', 'dark');
    emitChanged('color-scheme', 'light');

    expect(handler).toHaveBeenNthCalledWith(1, 'dark');
    expect(handler).toHaveBeenNthCalledWith(2, 'light');
    off();
  });
});
