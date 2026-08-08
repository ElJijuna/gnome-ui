import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { readFiles, readImage, readText, writeFiles, writeImage, writeText } from './index.ts';

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
      'Timed out waiting for a "clipboard-read-text-result" response to a "clipboard" request.',
    );

    await vi.advanceTimersByTimeAsync(5000);
    await assertion;
  });
});

describe('readImage', () => {
  beforeEach(() => {
    clearWebKit();
    setNavigatorClipboard(undefined);
  });

  it('resolves with the dataUrl from a matching read-image-result event in a WebKit environment', async () => {
    const spy = vi.fn((payload: { requestId: string }) => {
      window.dispatchEvent(
        new CustomEvent('gnome:clipboard-read-image-result', {
          detail: { requestId: payload.requestId, dataUrl: 'data:image/png;base64,AAA=' },
        }),
      );
    });

    setWebKit({ clipboard: { postMessage: spy } });

    await expect(readImage()).resolves.toBe('data:image/png;base64,AAA=');
    expect(spy).toHaveBeenCalledWith({ action: 'readImage', requestId: expect.any(String) });
  });

  it('resolves with the first image ClipboardItem converted to a dataUrl in a browser environment', async () => {
    const blob = new Blob(['fake-png-bytes'], { type: 'image/png' });

    setNavigatorClipboard({
      read: vi.fn().mockResolvedValue([
        { types: ['text/plain'], getType: vi.fn() },
        { types: ['image/png'], getType: vi.fn().mockResolvedValue(blob) },
      ]),
    });

    const dataUrl = await readImage();

    expect(dataUrl).toMatch(/^data:image\/png;base64,/);
  });

  it('resolves null when the clipboard has no image in a browser environment', async () => {
    setNavigatorClipboard({
      read: vi.fn().mockResolvedValue([{ types: ['text/plain'], getType: vi.fn() }]),
    });

    await expect(readImage()).resolves.toBeNull();
  });

  it('rejects when neither the bridge nor navigator.clipboard is available', async () => {
    await expect(readImage()).rejects.toThrow(
      'Clipboard image read is not supported in this environment.',
    );
  });
});

describe('writeImage', () => {
  beforeEach(() => {
    clearWebKit();
    setNavigatorClipboard(undefined);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('forwards the dataUrl to the clipboard bridge channel in a WebKit environment', async () => {
    const spy = vi.fn();

    setWebKit({ clipboard: { postMessage: spy } });
    await writeImage('data:image/png;base64,AAA=');

    expect(spy).toHaveBeenCalledWith({
      action: 'writeImage',
      dataUrl: 'data:image/png;base64,AAA=',
    });
  });

  it('converts the dataUrl to a Blob and writes it via navigator.clipboard.write in a browser environment', async () => {
    class MockClipboardItem {
      types: string[];
      private data: Record<string, Blob>;

      constructor(data: Record<string, Blob>) {
        this.data = data;
        this.types = Object.keys(data);
      }

      async getType(type: string): Promise<Blob> {
        return this.data[type];
      }
    }

    vi.stubGlobal('ClipboardItem', MockClipboardItem);
    const writeSpy = vi.fn().mockResolvedValue(undefined);

    setNavigatorClipboard({ write: writeSpy });

    // A syntactically valid data URL — byte content doesn't need to be a
    // real PNG since nothing here decodes image pixels, only moves bytes.
    await writeImage('data:image/png;base64,aGVsbG8=');

    expect(writeSpy).toHaveBeenCalledTimes(1);
    const [item] = writeSpy.mock.calls[0][0] as [InstanceType<typeof MockClipboardItem>];

    expect(item.types).toEqual(['image/png']);
    const blob = await item.getType('image/png');

    await expect(blob.text()).resolves.toBe('hello');
  });

  it('rejects when neither the bridge nor navigator.clipboard is available', async () => {
    await expect(writeImage('data:image/png;base64,AAA=')).rejects.toThrow(
      'Clipboard image write is not supported in this environment.',
    );
  });
});

describe('readFiles', () => {
  beforeEach(clearWebKit);

  it('resolves with the paths from a matching read-files-result event', async () => {
    const spy = vi.fn((payload: { requestId: string }) => {
      window.dispatchEvent(
        new CustomEvent('gnome:clipboard-read-files-result', {
          detail: { requestId: payload.requestId, paths: ['/home/user/a.txt', '/home/user/b.txt'] },
        }),
      );
    });

    setWebKit({ clipboard: { postMessage: spy } });

    await expect(readFiles()).resolves.toEqual(['/home/user/a.txt', '/home/user/b.txt']);
    expect(spy).toHaveBeenCalledWith({ action: 'readFiles', requestId: expect.any(String) });
  });

  it('rejects outside a WebKit environment — there is no browser fallback', async () => {
    await expect(readFiles()).rejects.toThrow(
      'Clipboard file read is not supported outside a WebKitGTK environment',
    );
  });
});

describe('writeFiles', () => {
  beforeEach(clearWebKit);

  it('forwards the paths to the clipboard bridge channel', async () => {
    const spy = vi.fn();

    setWebKit({ clipboard: { postMessage: spy } });
    await writeFiles(['/home/user/a.txt']);

    expect(spy).toHaveBeenCalledWith({ action: 'writeFiles', paths: ['/home/user/a.txt'] });
  });

  it('rejects outside a WebKit environment — there is no browser fallback', async () => {
    await expect(writeFiles(['/home/user/a.txt'])).rejects.toThrow(
      'Clipboard file write is not supported outside a WebKitGTK environment',
    );
  });
});
