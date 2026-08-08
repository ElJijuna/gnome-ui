import { onPortalSignal } from '@gnome-ui/platform';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { usePortalSignal } from './index';

vi.mock('@gnome-ui/platform', () => ({
  onPortalSignal: vi.fn(),
}));

describe('usePortalSignal', () => {
  const unsubscribe = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(onPortalSignal).mockReturnValue(unsubscribe);
  });

  it('subscribes to the given interface/signal pair on mount', () => {
    renderHook(() => usePortalSignal('org.freedesktop.portal.Settings', 'SettingChanged', vi.fn()));

    expect(onPortalSignal).toHaveBeenCalledWith(
      'org.freedesktop.portal.Settings',
      'SettingChanged',
      expect.any(Function),
    );
  });

  it('invokes the handler with the signal payload', () => {
    let capturedCallback: ((payload: unknown) => void) | undefined;

    vi.mocked(onPortalSignal).mockImplementation((_interfaceName, _signal, fn) => {
      capturedCallback = fn;

      return unsubscribe;
    });

    const handler = vi.fn();

    renderHook(() => usePortalSignal('org.freedesktop.portal.Settings', 'SettingChanged', handler));
    capturedCallback?.({ namespace: 'org.gnome.desktop.interface', key: 'color-scheme' });

    expect(handler).toHaveBeenCalledWith({
      namespace: 'org.gnome.desktop.interface',
      key: 'color-scheme',
    });
  });

  it('always calls the latest handler without re-subscribing', () => {
    let capturedCallback: ((payload: unknown) => void) | undefined;

    vi.mocked(onPortalSignal).mockImplementation((_interfaceName, _signal, fn) => {
      capturedCallback = fn;

      return unsubscribe;
    });

    const firstHandler = vi.fn();
    const secondHandler = vi.fn();
    const { rerender } = renderHook(
      ({ handler }: { handler: (p: unknown) => void }) =>
        usePortalSignal('org.freedesktop.portal.Settings', 'SettingChanged', handler),
      { initialProps: { handler: firstHandler } },
    );

    rerender({ handler: secondHandler });
    capturedCallback?.({ key: 'color-scheme' });

    expect(secondHandler).toHaveBeenCalledWith({ key: 'color-scheme' });
    expect(firstHandler).not.toHaveBeenCalled();
    expect(onPortalSignal).toHaveBeenCalledTimes(1);
  });

  it('calls the unsubscribe function on unmount', () => {
    const { unmount } = renderHook(() =>
      usePortalSignal('org.freedesktop.portal.Settings', 'SettingChanged', vi.fn()),
    );

    unmount();
    expect(unsubscribe).toHaveBeenCalledOnce();
  });

  it('re-subscribes when the interface changes', () => {
    const { rerender } = renderHook(
      ({ interfaceName }: { interfaceName: string }) =>
        usePortalSignal(interfaceName, 'SettingChanged', vi.fn()),
      { initialProps: { interfaceName: 'org.freedesktop.portal.Settings' } },
    );

    rerender({ interfaceName: 'org.freedesktop.portal.ScreenCast' });

    expect(onPortalSignal).toHaveBeenCalledTimes(2);
    expect(onPortalSignal).toHaveBeenLastCalledWith(
      'org.freedesktop.portal.ScreenCast',
      'SettingChanged',
      expect.any(Function),
    );
  });

  it('re-subscribes when the signal changes', () => {
    const { rerender } = renderHook(
      ({ signal }: { signal: string }) =>
        usePortalSignal('org.freedesktop.portal.Settings', signal, vi.fn()),
      { initialProps: { signal: 'SettingChanged' } },
    );

    rerender({ signal: 'Other' });

    expect(onPortalSignal).toHaveBeenCalledTimes(2);
  });

  it('unsubscribes from the old pair when the interface changes', () => {
    const { rerender } = renderHook(
      ({ interfaceName }: { interfaceName: string }) =>
        usePortalSignal(interfaceName, 'SettingChanged', vi.fn()),
      { initialProps: { interfaceName: 'org.freedesktop.portal.Settings' } },
    );

    expect(unsubscribe).not.toHaveBeenCalled();
    rerender({ interfaceName: 'org.freedesktop.portal.ScreenCast' });
    expect(unsubscribe).toHaveBeenCalledOnce();
  });

  it('does not re-subscribe when only the handler changes', () => {
    const { rerender } = renderHook(
      ({ handler }: { handler: () => void }) =>
        usePortalSignal('org.freedesktop.portal.Settings', 'SettingChanged', handler),
      { initialProps: { handler: vi.fn() } },
    );

    rerender({ handler: vi.fn() });
    expect(onPortalSignal).toHaveBeenCalledTimes(1);
  });
});
