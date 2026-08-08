import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  closeWindow,
  getWindowState,
  minimizeWindow,
  onWindowStateChanged,
  setFullscreen,
  setMaximized,
} from './index.ts';

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

function setFullscreenElement(value: Element | null) {
  Object.defineProperty(document, 'fullscreenElement', { configurable: true, value });
}

function setDocumentFocused(focused: boolean) {
  vi.spyOn(document, 'hasFocus').mockReturnValue(focused);
}

describe('getWindowState', () => {
  beforeEach(clearWebKit);
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    setFullscreenElement(null);
  });

  it('resolves with the state from the bridge response in a WebKit environment', async () => {
    const spy = vi.fn((payload: { requestId: string }) => {
      window.dispatchEvent(
        new CustomEvent('gnome:window-state-get-result', {
          detail: {
            requestId: payload.requestId,
            maximized: true,
            fullscreen: false,
            focused: true,
          },
        }),
      );
    });

    setWebKit({ window: { postMessage: spy } });

    await expect(getWindowState()).resolves.toEqual({
      maximized: true,
      fullscreen: false,
      focused: true,
    });
    expect(spy).toHaveBeenCalledWith({ action: 'get', requestId: expect.any(String) });
  });

  it('rejects if the host never responds', async () => {
    vi.useFakeTimers();
    setWebKit({ window: { postMessage: vi.fn() } });

    const pending = getWindowState();
    const assertion = expect(pending).rejects.toThrow(/Timed out waiting/);

    await vi.advanceTimersByTimeAsync(5000);
    await assertion;
  });

  it('reports fullscreen and focused from real document state in a browser environment, maximized always false', async () => {
    setFullscreenElement(document.documentElement);
    setDocumentFocused(true);

    await expect(getWindowState()).resolves.toEqual({
      maximized: false,
      fullscreen: true,
      focused: true,
    });
  });

  it('reports fullscreen: false and focused: false when neither is active', async () => {
    setFullscreenElement(null);
    setDocumentFocused(false);

    await expect(getWindowState()).resolves.toEqual({
      maximized: false,
      fullscreen: false,
      focused: false,
    });
  });
});

describe('setMaximized', () => {
  beforeEach(clearWebKit);

  it('posts "maximize" when true', async () => {
    const spy = vi.fn();

    setWebKit({ window: { postMessage: spy } });
    await setMaximized(true);

    expect(spy).toHaveBeenCalledWith({ action: 'maximize' });
  });

  it('posts "unmaximize" when false', async () => {
    const spy = vi.fn();

    setWebKit({ window: { postMessage: spy } });
    await setMaximized(false);

    expect(spy).toHaveBeenCalledWith({ action: 'unmaximize' });
  });

  it('rejects outside a WebKit environment — there is no browser equivalent', async () => {
    await expect(setMaximized(true)).rejects.toThrow(
      'setMaximized is not supported outside a WebKitGTK environment.',
    );
  });
});

describe('setFullscreen', () => {
  beforeEach(clearWebKit);
  afterEach(() => {
    vi.restoreAllMocks();
    setFullscreenElement(null);
  });

  it('posts "fullscreen" when true in a WebKit environment', async () => {
    const spy = vi.fn();

    setWebKit({ window: { postMessage: spy } });
    await setFullscreen(true);

    expect(spy).toHaveBeenCalledWith({ action: 'fullscreen' });
  });

  it('posts "unfullscreen" when false in a WebKit environment', async () => {
    const spy = vi.fn();

    setWebKit({ window: { postMessage: spy } });
    await setFullscreen(false);

    expect(spy).toHaveBeenCalledWith({ action: 'unfullscreen' });
  });

  // jsdom does not implement the Fullscreen API at all (not even as a stub),
  // so `vi.spyOn` has nothing to wrap — assign a fake directly instead.

  it('calls the real requestFullscreen() when true in a browser environment', async () => {
    const requestFullscreen = vi.fn().mockResolvedValue(undefined);

    document.documentElement.requestFullscreen = requestFullscreen;

    await setFullscreen(true);

    expect(requestFullscreen).toHaveBeenCalled();
  });

  it('calls the real exitFullscreen() when false and currently fullscreen in a browser environment', async () => {
    setFullscreenElement(document.documentElement);
    const exitFullscreen = vi.fn().mockResolvedValue(undefined);

    document.exitFullscreen = exitFullscreen;
    await setFullscreen(false);

    expect(exitFullscreen).toHaveBeenCalled();
  });

  it('does not call exitFullscreen() when false and not currently fullscreen', async () => {
    setFullscreenElement(null);
    const exitFullscreen = vi.fn().mockResolvedValue(undefined);

    document.exitFullscreen = exitFullscreen;
    await setFullscreen(false);

    expect(exitFullscreen).not.toHaveBeenCalled();
  });
});

describe('minimizeWindow', () => {
  beforeEach(clearWebKit);

  it('posts "minimize" in a WebKit environment', async () => {
    const spy = vi.fn();

    setWebKit({ window: { postMessage: spy } });
    await minimizeWindow();

    expect(spy).toHaveBeenCalledWith({ action: 'minimize' });
  });

  it('rejects outside a WebKit environment — there is no browser equivalent', async () => {
    await expect(minimizeWindow()).rejects.toThrow(
      'minimizeWindow is not supported outside a WebKitGTK environment.',
    );
  });
});

describe('closeWindow', () => {
  beforeEach(clearWebKit);
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('posts "close" in a WebKit environment', async () => {
    const spy = vi.fn();

    setWebKit({ window: { postMessage: spy } });
    await closeWindow();

    expect(spy).toHaveBeenCalledWith({ action: 'close' });
  });

  it('calls the real window.close() in a browser environment', async () => {
    const closeSpy = vi.spyOn(window, 'close').mockImplementation(() => {});

    await closeWindow();

    expect(closeSpy).toHaveBeenCalled();
  });
});

describe('onWindowStateChanged', () => {
  afterEach(() => {
    clearWebKit();
    vi.restoreAllMocks();
    setFullscreenElement(null);
  });

  it('calls the handler when the host dispatches a window-state-changed event', () => {
    setWebKit({});
    const handler = vi.fn();
    const off = onWindowStateChanged(handler);

    window.dispatchEvent(
      new CustomEvent('gnome:window-state-changed', {
        detail: { maximized: true, fullscreen: false, focused: true },
      }),
    );

    expect(handler).toHaveBeenCalledWith({ maximized: true, fullscreen: false, focused: true });
    off();
  });

  it('stops firing after unsubscribing in a WebKit environment', () => {
    setWebKit({});
    const handler = vi.fn();
    const off = onWindowStateChanged(handler);

    off();
    window.dispatchEvent(
      new CustomEvent('gnome:window-state-changed', {
        detail: { maximized: true, fullscreen: false, focused: true },
      }),
    );

    expect(handler).not.toHaveBeenCalled();
  });

  it('calls the handler with the composed state on a real fullscreenchange event', () => {
    setDocumentFocused(true);
    const handler = vi.fn();
    const off = onWindowStateChanged(handler);

    setFullscreenElement(document.documentElement);
    document.dispatchEvent(new Event('fullscreenchange'));

    expect(handler).toHaveBeenCalledWith({ maximized: false, fullscreen: true, focused: true });
    off();
  });

  it('calls the handler with the composed state on real focus/blur events', () => {
    setDocumentFocused(true);
    const handler = vi.fn();
    const off = onWindowStateChanged(handler);

    window.dispatchEvent(new Event('focus'));
    expect(handler).toHaveBeenLastCalledWith({
      maximized: false,
      fullscreen: false,
      focused: true,
    });

    setDocumentFocused(false);
    window.dispatchEvent(new Event('blur'));
    expect(handler).toHaveBeenLastCalledWith({
      maximized: false,
      fullscreen: false,
      focused: false,
    });

    off();
  });

  it('stops firing after unsubscribing in a browser environment', () => {
    setDocumentFocused(true);
    const handler = vi.fn();
    const off = onWindowStateChanged(handler);

    off();
    window.dispatchEvent(new Event('focus'));
    document.dispatchEvent(new Event('fullscreenchange'));

    expect(handler).not.toHaveBeenCalled();
  });
});
