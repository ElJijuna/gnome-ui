import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { callPortal, onPortalSignal } from './index.ts';

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

function respond(requestId: string, result: unknown) {
  window.dispatchEvent(
    new CustomEvent('gnome:portal-call-result', { detail: { requestId, result } }),
  );
}

function emitSignal(interfaceName: string, signal: string, payload: unknown) {
  window.dispatchEvent(
    new CustomEvent('gnome:portal-signal', {
      detail: { interface: interfaceName, signal, payload },
    }),
  );
}

describe('callPortal', () => {
  beforeEach(clearWebKit);
  afterEach(() => {
    vi.useRealTimers();
  });

  it('rejects outside a WebKit environment — portals are meaningless without a sandboxed host', async () => {
    await expect(
      callPortal({ interface: 'org.freedesktop.portal.OpenURI', method: 'OpenURI' }),
    ).rejects.toThrow('Portal access is not supported outside a WebKitGTK environment.');
  });

  it('forwards the interface, method, and args to the portals bridge channel', async () => {
    const spy = vi.fn((payload: { requestId: string }) => {
      respond(payload.requestId, { ok: true });
    });

    setWebKit({ portals: { postMessage: spy } });

    await callPortal({
      interface: 'org.freedesktop.portal.OpenURI',
      method: 'OpenURI',
      args: { uri: 'https://example.com' },
    });

    expect(spy).toHaveBeenCalledWith({
      interface: 'org.freedesktop.portal.OpenURI',
      method: 'OpenURI',
      args: { uri: 'https://example.com' },
      requestId: expect.any(String),
    });
  });

  it('defaults args to an empty object when omitted', async () => {
    const spy = vi.fn((payload: { requestId: string }) => {
      respond(payload.requestId, null);
    });

    setWebKit({ portals: { postMessage: spy } });
    await callPortal({ interface: 'org.freedesktop.portal.Account', method: 'GetUserInformation' });

    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ args: {} }));
  });

  it('resolves with the result from a matching response', async () => {
    const spy = vi.fn((payload: { requestId: string }) => {
      respond(payload.requestId, { name: 'Ada' });
    });

    setWebKit({ portals: { postMessage: spy } });

    await expect(
      callPortal<{ name: string }>({
        interface: 'org.freedesktop.portal.Account',
        method: 'GetUserInformation',
      }),
    ).resolves.toEqual({ name: 'Ada' });
  });

  it('matches concurrent calls to different portal methods to their own response', async () => {
    const requestIds: string[] = [];

    setWebKit({
      portals: {
        postMessage: vi.fn((payload: { requestId: string }) => {
          requestIds.push(payload.requestId);
        }),
      },
    });

    const openUri = callPortal({ interface: 'org.freedesktop.portal.OpenURI', method: 'OpenURI' });
    const account = callPortal({
      interface: 'org.freedesktop.portal.Account',
      method: 'GetUserInformation',
    });

    expect(requestIds).toHaveLength(2);

    // Resolve out of order to prove matching is by requestId, not call order.
    respond(requestIds[1], { name: 'Ada' });
    respond(requestIds[0], { handle: 'ok' });

    await expect(openUri).resolves.toEqual({ handle: 'ok' });
    await expect(account).resolves.toEqual({ name: 'Ada' });
  });

  it('rejects if the host never responds', async () => {
    vi.useFakeTimers();
    setWebKit({ portals: { postMessage: vi.fn() } });

    const pending = callPortal({ interface: 'org.freedesktop.portal.OpenURI', method: 'OpenURI' });
    const assertion = expect(pending).rejects.toThrow(/Timed out waiting/);

    await vi.advanceTimersByTimeAsync(5000);
    await assertion;
  });
});

describe('onPortalSignal', () => {
  it('calls the handler when interface and signal both match', () => {
    const handler = vi.fn();
    const off = onPortalSignal('org.freedesktop.portal.Settings', 'SettingChanged', handler);

    emitSignal('org.freedesktop.portal.Settings', 'SettingChanged', { key: 'color-scheme' });

    expect(handler).toHaveBeenCalledWith({ key: 'color-scheme' });
    off();
  });

  it('ignores a signal from a different interface', () => {
    const handler = vi.fn();
    const off = onPortalSignal('org.freedesktop.portal.Settings', 'SettingChanged', handler);

    emitSignal('org.freedesktop.portal.ScreenCast', 'SettingChanged', {});

    expect(handler).not.toHaveBeenCalled();
    off();
  });

  it('ignores a different signal on the same interface', () => {
    const handler = vi.fn();
    const off = onPortalSignal('org.freedesktop.portal.Settings', 'SettingChanged', handler);

    emitSignal('org.freedesktop.portal.Settings', 'SomeOtherSignal', {});

    expect(handler).not.toHaveBeenCalled();
    off();
  });

  it('stops firing after unsubscribing', () => {
    const handler = vi.fn();
    const off = onPortalSignal('org.freedesktop.portal.Settings', 'SettingChanged', handler);

    off();
    emitSignal('org.freedesktop.portal.Settings', 'SettingChanged', {});

    expect(handler).not.toHaveBeenCalled();
  });
});
