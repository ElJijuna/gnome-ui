import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { usePrefersReducedMotion } from './index';

// ─── matchMedia mock ──────────────────────────────────────────────────────────
// jsdom does not implement matchMedia, so we define it via Object.defineProperty.

type ChangeHandler = () => void;

function mockMatchMedia(matches: boolean) {
  const listeners: ChangeHandler[] = [];
  const mql = {
    matches,
    addEventListener: vi.fn((_: string, fn: ChangeHandler) => listeners.push(fn)),
    removeEventListener: vi.fn((_: string, fn: ChangeHandler) => {
      const i = listeners.indexOf(fn);

      if (i !== -1) {
        listeners.splice(i, 1);
      }
    }),
    trigger(nextMatches: boolean) {
      mql.matches = nextMatches;
      listeners.forEach((fn) => fn());
    },
  };

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn(() => mql),
  });

  return mql;
}

afterEach(() => vi.restoreAllMocks());

describe('usePrefersReducedMotion', () => {
  it('returns false when the OS setting is off', () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => usePrefersReducedMotion());

    expect(result.current).toBe(false);
  });

  it('returns true when the OS setting is on', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => usePrefersReducedMotion());

    expect(result.current).toBe(true);
  });

  it('queries the correct media feature', () => {
    mockMatchMedia(false);
    renderHook(() => usePrefersReducedMotion());

    expect(window.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
  });

  it('updates reactively when the setting changes', () => {
    const mql = mockMatchMedia(false);
    const { result } = renderHook(() => usePrefersReducedMotion());

    act(() => mql.trigger(true));

    expect(result.current).toBe(true);
  });

  it('removes the listener on unmount', () => {
    const mql = mockMatchMedia(false);
    const { unmount } = renderHook(() => usePrefersReducedMotion());

    unmount();

    expect(mql.removeEventListener).toHaveBeenCalledOnce();
  });

  it('returns false when matchMedia is unavailable', () => {
    Object.defineProperty(window, 'matchMedia', { writable: true, value: undefined });

    const { result } = renderHook(() => usePrefersReducedMotion());

    expect(result.current).toBe(false);
  });
});
