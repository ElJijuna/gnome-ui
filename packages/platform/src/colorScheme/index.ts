import { isWebKitBridge, onNativeEvent, postMessage, postMessageAndWait } from '../bridge';

export type ColorScheme = 'light' | 'dark';
export type ColorSchemePreference = ColorScheme | 'system';

const GET_RESPONSE_EVENT = 'color-scheme-get-result';
const CHANGED_EVENT = 'color-scheme-changed';
const DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)';

/**
 * Returns the color scheme this app is currently rendering with.
 *
 * - **WebKitGTK**: reads `Adw.StyleManager.get_default().dark` host-side via
 *   `postMessageAndWait` — this is the *resolved* scheme, accounting for
 *   both the desktop-wide preference and any override set through
 *   `setColorScheme`.
 * - **Browser / PWA**: uses the real `(prefers-color-scheme: dark)` media
 *   query — the same mechanism `GnomeProvider` already reads directly for
 *   its own `colorScheme="system"` resolution.
 */
export async function getColorScheme(): Promise<ColorScheme> {
  if (isWebKitBridge()) {
    const detail = await postMessageAndWait<{ requestId: string; scheme: ColorScheme }>(
      'colorScheme',
      { action: 'get' },
      GET_RESPONSE_EVENT,
    );

    return detail.scheme;
  }

  const prefersDark = typeof window !== 'undefined' && window.matchMedia(DARK_MEDIA_QUERY).matches;

  return prefersDark ? 'dark' : 'light';
}

/**
 * Sets this app's color scheme preference.
 *
 * **This changes only this app's rendering, never the desktop-wide
 * preference** — it maps to `Adw.StyleManager.set_color_scheme()`
 * (`'system'` → `Adw.ColorScheme.DEFAULT`, i.e. follow the desktop; `'light'`
 * / `'dark'` force that scheme for this app regardless of the desktop
 * setting). A sandboxed app has no way to change the user's actual desktop
 * theme, and a well-behaved one shouldn't try to.
 *
 * Fire-and-forget, matching `postMessage`'s contract. Rejects outside a
 * WebKitGTK environment — in a browser, forcing a theme is `GnomeProvider`'s
 * job (its `colorScheme` prop plus a `data-theme` attribute), not this
 * bridge's — there is no JS API to force the browser's own rendering into a
 * scheme.
 */
export async function setColorScheme(preference: ColorSchemePreference): Promise<void> {
  if (!isWebKitBridge()) {
    throw new Error(
      'setColorScheme is not supported outside a WebKitGTK environment — use the colorScheme prop on GnomeProvider instead.',
    );
  }

  await postMessage('colorScheme', { action: 'set', scheme: preference });
}

/**
 * Subscribes to the resolved color scheme changing — either because the
 * desktop-wide preference changed (e.g. GNOME's scheduled Night Light dark
 * mode) or because this app's own override was changed via `setColorScheme`.
 *
 * - **WebKitGTK**: the GJS host dispatches `gnome:color-scheme-changed`
 *   (`{ scheme }`), mirroring `Adw.StyleManager`'s `notify::dark` signal.
 * - **Browser / PWA**: uses the real `matchMedia('(prefers-color-scheme:
 *   dark)').addEventListener('change', …)`.
 *
 * Returns an unsubscribe function.
 */
export function onColorSchemeChanged(handler: (scheme: ColorScheme) => void): () => void {
  if (isWebKitBridge()) {
    return onNativeEvent<{ scheme: ColorScheme }>(CHANGED_EVENT, (detail) =>
      handler(detail.scheme),
    );
  }

  if (typeof window === 'undefined') {
    return () => {};
  }

  const mq = window.matchMedia(DARK_MEDIA_QUERY);
  const listener = (event: MediaQueryListEvent) => handler(event.matches ? 'dark' : 'light');

  mq.addEventListener('change', listener);

  return () => mq.removeEventListener('change', listener);
}
