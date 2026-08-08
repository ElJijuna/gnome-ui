import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { readText, writeText } from './index.ts';

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

function setNavigatorClipboard(clipboard: Partial<Clipboard> | undefined) {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: clipboard,
  });
}

function respond(requestId: string, text: string) {
  window.dispatchEvent(
    new CustomEvent('gnome:clipboard-read-text-result', { detail: { requestId, text } }),
  );
}

describe('writeText', () => {
  beforeEach(() => {
    clearWebKit();
    setNavigatorClipboard(undefined);
  });

  it('forwards to the clipboard bridge channel in a WebKit environment', async () => {
    const spy = vi.fn();

    setWebKit({ clipboard: { postMessage: spy } });
    await writeText('hello');

    expect(spy).toHaveBeenCalledWith({ action: 'writeText', text: 'hello' });
  });

  it('uses navigator.clipboard.writeText in a browser environment', async () => {
    const spy = vi.fn().mockResolvedValue(undefined);

    setNavigatorClipboard({ writeText: spy });
    await writeText('hello');

    expect(spy).toHaveBeenCalledWith('hello');
  });

  it('prefers the WebKit bridge over navigator.clipboard when both are present', async () => {
    const bridgeSpy = vi.fn();
    const navigatorSpy = vi.fn().mockResolvedValue(undefined);

    setWebKit({ clipboard: { postMessage: bridgeSpy } });
    setNavigatorClipboard({ writeText: navigatorSpy });
    await writeText('hello');

    expect(bridgeSpy).toHaveBeenCalled();
    expect(navigatorSpy).not.toHaveBeenCalled();
  });

  it('rejects when neither the bridge nor navigator.clipboard is available', async () => {
    await expect(writeText('hello')).rejects.toThrow(
      'Clipboard write is not supported in this environment.',
    );
  });
});

describe('readText', () => {
  beforeEach(() => {
    clearWebKit();
    setNavigatorClipboard(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('resolves with the text from navigator.clipboard.readText in a browser environment', async () => {
    setNavigatorClipboard({ readText: vi.fn().mockResolvedValue('from clipboard') });

    await expect(readText()).resolves.toBe('from clipboard');
  });

  it('rejects when neither the bridge nor navigator.clipboard is available', async () => {
    await expect(readText()).rejects.toThrow(
      'Clipboard read is not supported in this environment.',
    );
  });

  it('resolves once the host dispatches a matching read-result event', async () => {
    const spy = vi.fn((payload: { requestId: string }) => {
      respond(payload.requestId, 'from GDK');
    });

    setWebKit({ clipboard: { postMessage: spy } });

    await expect(readText()).resolves.toBe('from GDK');
    expect(spy).toHaveBeenCalledWith({ action: 'readText', requestId: expect.any(String) });
  });

  it('matches concurrent reads to their own response by requestId', async () => {
    const requestIds: string[] = [];

    setWebKit({
      clipboard: {
        postMessage: vi.fn((payload: { requestId: string }) => {
          requestIds.push(payload.requestId);
        }),
      },
    });

    const first = readText();
    const second = readText();

    expect(requestIds).toHaveLength(2);
    expect(requestIds[0]).not.toBe(requestIds[1]);

    // Resolve out of order to prove the id — not call order — decides the match.
    respond(requestIds[1], 'second');
    respond(requestIds[0], 'first');

    await expect(first).resolves.toBe('first');
    await expect(second).resolves.toBe('second');
  });

  it('ignores a read-result event carrying an unrelated requestId', async () => {
    let requestId = '';

    setWebKit({
      clipboard: {
        postMessage: vi.fn((payload: { requestId: string }) => {
          ({ requestId } = payload);
        }),
      },
    });

    const pending = readText();

    respond('some-other-request', 'wrong text');
    respond(requestId, 'right text');

    await expect(pending).resolves.toBe('right text');
  });

  it('rejects if the host never responds', async () => {
    vi.useFakeTimers();
    setWebKit({ clipboard: { postMessage: vi.fn() } });

    const pending = readText();
    const assertion = expect(pending).rejects.toThrow(
      'Timed out waiting for the clipboard read response from the host.',
    );

    await vi.advanceTimersByTimeAsync(5000);
    await assertion;
  });
});
