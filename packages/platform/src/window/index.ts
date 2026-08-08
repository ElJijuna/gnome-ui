import { isWebKitBridge, onNativeEvent, postMessage, postMessageAndWait } from '../bridge';

export interface WindowState {
  maximized: boolean;
  fullscreen: boolean;
  focused: boolean;
}

const GET_RESPONSE_EVENT = 'window-state-get-result';
const CHANGED_EVENT = 'window-state-changed';

/**
 * Returns a snapshot of the current window state.
 *
 * - **WebKitGTK**: reads `Gtk.Window`'s `maximized`, `fullscreened`, and
 *   `is-active` properties host-side via `postMessageAndWait`.
 * - **Browser / PWA**: `fullscreen` uses the real Fullscreen API
 *   (`document.fullscreenElement`) and `focused` uses the real
 *   `document.hasFocus()` — both genuine equivalents. `maximized` has no
 *   browser equivalent at all (there is no standard way for page script to
 *   ask whether the OS window chrome is maximized) and is always `false`.
 */
export async function getWindowState(): Promise<WindowState> {
  if (isWebKitBridge()) {
    const detail = await postMessageAndWait<{ requestId: string } & WindowState>(
      'window',
      { action: 'get' },
      GET_RESPONSE_EVENT,
    );

    return {
      maximized: detail.maximized,
      fullscreen: detail.fullscreen,
      focused: detail.focused,
    };
  }

  return {
    maximized: false,
    fullscreen: typeof document !== 'undefined' && document.fullscreenElement !== null,
    focused: typeof document !== 'undefined' && document.hasFocus(),
  };
}

/**
 * Maximizes or restores the window.
 *
 * WebKitGTK only, fire-and-forget — there is no browser equivalent, since
 * page script cannot resize or maximize the actual OS window chrome.
 */
export async function setMaximized(maximized: boolean): Promise<void> {
  if (!isWebKitBridge()) {
    throw new Error('setMaximized is not supported outside a WebKitGTK environment.');
  }

  await postMessage('window', { action: maximized ? 'maximize' : 'unmaximize' });
}

/**
 * Enters or exits fullscreen.
 *
 * - **WebKitGTK**: forwards to `Gtk.Window.fullscreen()` /
 *   `Gtk.Window.unfullscreen()`. Fire-and-forget.
 * - **Browser / PWA**: uses the real Fullscreen API
 *   (`Element.requestFullscreen()` / `document.exitFullscreen()`).
 */
export async function setFullscreen(fullscreen: boolean): Promise<void> {
  if (isWebKitBridge()) {
    await postMessage('window', { action: fullscreen ? 'fullscreen' : 'unfullscreen' });

    return;
  }

  if (typeof document === 'undefined') {
    throw new Error('setFullscreen is not supported in this environment.');
  }

  if (fullscreen) {
    await document.documentElement.requestFullscreen();
  } else if (document.fullscreenElement) {
    await document.exitFullscreen();
  }
}

/**
 * Minimizes the window.
 *
 * WebKitGTK only, fire-and-forget — there is no browser equivalent, since
 * page script cannot minimize the actual OS window chrome.
 */
export async function minimizeWindow(): Promise<void> {
  if (!isWebKitBridge()) {
    throw new Error('minimizeWindow is not supported outside a WebKitGTK environment.');
  }

  await postMessage('window', { action: 'minimize' });
}

/**
 * Requests that the window close (respects the app's own close handling,
 * e.g. an "unsaved changes" confirmation — same as clicking the window's
 * own close button).
 *
 * - **WebKitGTK**: forwards to `Gtk.Window.close()`. Fire-and-forget.
 * - **Browser / PWA**: calls the real `window.close()` — browsers only honor
 *   this for windows opened by script (or in some installed-PWA contexts)
 *   and silently ignore it otherwise; that's the browser's own security
 *   restriction, not something this module can work around.
 */
export async function closeWindow(): Promise<void> {
  if (isWebKitBridge()) {
    await postMessage('window', { action: 'close' });

    return;
  }

  if (typeof window === 'undefined') {
    throw new Error('closeWindow is not supported in this environment.');
  }

  window.close();
}

/**
 * Subscribes to window state changes.
 *
 * - **WebKitGTK**: the GJS host dispatches `gnome:window-state-changed` with
 *   the full current state whenever any of `Gtk.Window`'s
 *   `notify::maximized`, `notify::fullscreened`, or `notify::is-active`
 *   signals fire — bundled into one event (rather than three) since callers
 *   (e.g. a `useWindowState` hook) generally want to set one state object,
 *   not track three signals separately.
 * - **Browser / PWA**: composes the real `fullscreenchange`, `focus`, and
 *   `blur` events into the same `WindowState` shape (`maximized` always
 *   `false` — see `getWindowState`).
 *
 * Returns an unsubscribe function.
 */
export function onWindowStateChanged(handler: (state: WindowState) => void): () => void {
  if (isWebKitBridge()) {
    return onNativeEvent<WindowState>(CHANGED_EVENT, handler);
  }

  if (typeof document === 'undefined') {
    return () => {};
  }

  const emit = () => {
    handler({
      maximized: false,
      fullscreen: document.fullscreenElement !== null,
      focused: document.hasFocus(),
    });
  };

  document.addEventListener('fullscreenchange', emit);
  window.addEventListener('focus', emit);
  window.addEventListener('blur', emit);

  return () => {
    document.removeEventListener('fullscreenchange', emit);
    window.removeEventListener('focus', emit);
    window.removeEventListener('blur', emit);
  };
}
