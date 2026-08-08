import {
  closeWindow,
  getWindowState,
  minimizeWindow,
  onWindowStateChanged,
  setFullscreen,
  setMaximized,
} from '@gnome-ui/platform';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useWindowState } from './index';

vi.mock('@gnome-ui/platform', () => ({
  getWindowState: vi.fn(),
  setMaximized: vi.fn(),
  setFullscreen: vi.fn(),
  minimizeWindow: vi.fn(),
  closeWindow: vi.fn(),
  onWindowStateChanged: vi.fn(),
}));

describe('useWindowState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(onWindowStateChanged).mockReturnValue(vi.fn());
  });

  describe('initial read', () => {
    it('starts at maximized/fullscreen/focused=false with loading=true', () => {
      vi.mocked(getWindowState).mockReturnValue(new Promise(() => {}));
      const { result } = renderHook(() => useWindowState());

      expect(result.current.maximized).toBe(false);
      expect(result.current.fullscreen).toBe(false);
      expect(result.current.focused).toBe(false);
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('updates state and clears loading once the read resolves', async () => {
      vi.mocked(getWindowState).mockResolvedValue({
        maximized: true,
        fullscreen: false,
        focused: true,
      });
      const { result } = renderHook(() => useWindowState());

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.maximized).toBe(true);
      expect(result.current.fullscreen).toBe(false);
      expect(result.current.focused).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('sets error and keeps the initial state when the read rejects', async () => {
      vi.mocked(getWindowState).mockRejectedValue(new Error('not supported'));
      const { result } = renderHook(() => useWindowState());

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.maximized).toBe(false);
      expect(result.current.error).toEqual(new Error('not supported'));
    });

    it('wraps a non-Error rejection in an Error', async () => {
      vi.mocked(getWindowState).mockRejectedValue('denied');
      const { result } = renderHook(() => useWindowState());

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toEqual(new Error('denied'));
    });
  });

  describe('external changes', () => {
    it('updates state when onWindowStateChanged fires', async () => {
      vi.mocked(getWindowState).mockResolvedValue({
        maximized: false,
        fullscreen: false,
        focused: false,
      });

      let handler:
        | ((state: { maximized: boolean; fullscreen: boolean; focused: boolean }) => void)
        | undefined;

      vi.mocked(onWindowStateChanged).mockImplementation((cb) => {
        handler = cb;

        return vi.fn();
      });

      const { result } = renderHook(() => useWindowState());

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        handler?.({ maximized: true, fullscreen: true, focused: false });
      });

      expect(result.current.maximized).toBe(true);
      expect(result.current.fullscreen).toBe(true);
      expect(result.current.focused).toBe(false);
    });

    it('unsubscribes on unmount', () => {
      const unsubscribe = vi.fn();

      vi.mocked(getWindowState).mockReturnValue(new Promise(() => {}));
      vi.mocked(onWindowStateChanged).mockReturnValue(unsubscribe);

      const { unmount } = renderHook(() => useWindowState());

      unmount();

      expect(unsubscribe).toHaveBeenCalled();
    });
  });

  describe('actions', () => {
    beforeEach(() => {
      vi.mocked(getWindowState).mockReturnValue(new Promise(() => {}));
    });

    it('setMaximized forwards to platform.setMaximized', () => {
      vi.mocked(setMaximized).mockResolvedValue(undefined);
      const { result } = renderHook(() => useWindowState());

      act(() => {
        result.current.setMaximized(true);
      });

      expect(setMaximized).toHaveBeenCalledWith(true);
    });

    it('setFullscreen forwards to platform.setFullscreen', () => {
      vi.mocked(setFullscreen).mockResolvedValue(undefined);
      const { result } = renderHook(() => useWindowState());

      act(() => {
        result.current.setFullscreen(true);
      });

      expect(setFullscreen).toHaveBeenCalledWith(true);
    });

    it('minimize calls platform.minimizeWindow', () => {
      vi.mocked(minimizeWindow).mockResolvedValue(undefined);
      const { result } = renderHook(() => useWindowState());

      act(() => {
        result.current.minimize();
      });

      expect(minimizeWindow).toHaveBeenCalled();
    });

    it('close calls platform.closeWindow', () => {
      vi.mocked(closeWindow).mockResolvedValue(undefined);
      const { result } = renderHook(() => useWindowState());

      act(() => {
        result.current.close();
      });

      expect(closeWindow).toHaveBeenCalled();
    });

    it('sets error when an action rejects', async () => {
      vi.mocked(setMaximized).mockRejectedValue(new Error('not supported'));
      const { result } = renderHook(() => useWindowState());

      act(() => {
        result.current.setMaximized(true);
      });

      await waitFor(() => expect(result.current.error).toEqual(new Error('not supported')));
    });

    it('clears a previous error once an action succeeds', async () => {
      vi.mocked(setMaximized).mockRejectedValueOnce(new Error('boom'));
      const { result } = renderHook(() => useWindowState());

      act(() => {
        result.current.setMaximized(true);
      });
      await waitFor(() => expect(result.current.error).toEqual(new Error('boom')));

      vi.mocked(setFullscreen).mockResolvedValueOnce(undefined);
      act(() => {
        result.current.setFullscreen(true);
      });
      await waitFor(() => expect(result.current.error).toBeNull());
    });
  });

  it('returns stable action references across re-renders', () => {
    vi.mocked(getWindowState).mockReturnValue(new Promise(() => {}));
    const { result, rerender } = renderHook(() => useWindowState());
    const first = result.current;

    rerender();

    expect(result.current.setMaximized).toBe(first.setMaximized);
    expect(result.current.setFullscreen).toBe(first.setFullscreen);
    expect(result.current.minimize).toBe(first.minimize);
    expect(result.current.close).toBe(first.close);
  });
});
