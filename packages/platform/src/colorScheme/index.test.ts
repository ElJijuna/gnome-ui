import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getColorScheme, onColorSchemeChanged, setColorScheme } from './index.ts';

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

function respond(requestId: string, scheme: 'light' | 'dark') {
  window.dispatchEvent(
    new CustomEvent('gnome:color-scheme-get-result', { detail: { requestId, scheme } }),
  );
}

/**
 * The package-wide `matchMedia` stub in `src/test/setup.ts` always reports
 * `matches: false` and never actually fires `change` — good enough for
 * everything else in the package, not enough to exercise a live
 * subscription. This installs a controllable, dispatchable stand-in.
 */
function installMatchMedia(initialMatches: boolean) {
  let matches = initialMatches;
  let listener: ((event: MediaQueryListEvent) => void) | null = null;

  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) =>
      ({
        get matches() {
          return matches;
        },
        media: query,
        addEventListener: (type: string, cb: (event: MediaQueryListEvent) => void) => {
          if (type === 'change') {
            listener = cb;
          }
        },
        removeEventListener: (type: string, cb: (event: MediaQueryListEvent) => void) => {
          if (type === 'change' && listener === cb) {
            listener = null;
          }
        },
      }) as MediaQueryList,
  );

  return {
    setMatches(next: boolean) {
      matches = next;
      listener?.({ matches: next } as MediaQueryListEvent);
    },
  };
}

describe('getColorScheme', () => {
  beforeEach(clearWebKit);
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('resolves with the scheme from the bridge response in a WebKit environment', async () => {
    const spy = vi.fn((payload: { requestId: string }) => {
      respond(payload.requestId, 'dark');
    });

    setWebKit({ colorScheme: { postMessage: spy } });

    await expect(getColorScheme()).resolves.toBe('dark');
    expect(spy).toHaveBeenCalledWith({ action: 'get', requestId: expect.any(String) });
  });

  it('rejects if the host never responds', async () => {
    vi.useFakeTimers();
    setWebKit({ colorScheme: { postMessage: vi.fn() } });

    const pending = getColorScheme();
    const assertion = expect(pending).rejects.toThrow(/Timed out waiting/);

    await vi.advanceTimersByTimeAsync(5000);
    await assertion;
  });

  it('resolves "dark" from the real media query in a browser environment', async () => {
    installMatchMedia(true);

    await expect(getColorScheme()).resolves.toBe('dark');
  });

  it('resolves "light" from the real media query in a browser environment', async () => {
    installMatchMedia(false);

    await expect(getColorScheme()).resolves.toBe('light');
  });
});

describe('setColorScheme', () => {
  beforeEach(clearWebKit);

  it('forwards the preference to the colorScheme bridge channel', async () => {
    const spy = vi.fn();

    setWebKit({ colorScheme: { postMessage: spy } });
    await setColorScheme('dark');

    expect(spy).toHaveBeenCalledWith({ action: 'set', scheme: 'dark' });
  });

  it('rejects outside a WebKit environment — theme forcing is GnomeProvider’s job in a browser', async () => {
    await expect(setColorScheme('dark')).rejects.toThrow(
      'setColorScheme is not supported outside a WebKitGTK environment',
    );
  });
});

describe('onColorSchemeChanged', () => {
  afterEach(() => {
    clearWebKit();
    vi.restoreAllMocks();
  });

  it('calls the handler when the host dispatches a change event', () => {
    setWebKit({});
    const handler = vi.fn();
    const off = onColorSchemeChanged(handler);

    window.dispatchEvent(
      new CustomEvent('gnome:color-scheme-changed', { detail: { scheme: 'dark' } }),
    );

    expect(handler).toHaveBeenCalledWith('dark');
    off();
  });

  it('stops firing after unsubscribing in a WebKit environment', () => {
    setWebKit({});
    const handler = vi.fn();
    const off = onColorSchemeChanged(handler);

    off();
    window.dispatchEvent(
      new CustomEvent('gnome:color-scheme-changed', { detail: { scheme: 'dark' } }),
    );

    expect(handler).not.toHaveBeenCalled();
  });

  it('calls the handler with the mapped scheme when the real media query changes', () => {
    const mql = installMatchMedia(false);
    const handler = vi.fn();
    const off = onColorSchemeChanged(handler);

    mql.setMatches(true);
    expect(handler).toHaveBeenCalledWith('dark');

    mql.setMatches(false);
    expect(handler).toHaveBeenCalledWith('light');

    off();
  });

  it('stops firing after unsubscribing in a browser environment', () => {
    const mql = installMatchMedia(false);
    const handler = vi.fn();
    const off = onColorSchemeChanged(handler);

    off();
    mql.setMatches(true);

    expect(handler).not.toHaveBeenCalled();
  });
});
