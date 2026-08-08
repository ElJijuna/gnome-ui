import { getColorScheme, onColorSchemeChanged, setColorScheme } from '@gnome-ui/platform';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useColorScheme } from './index';

vi.mock('@gnome-ui/platform', () => ({
  getColorScheme: vi.fn(),
  setColorScheme: vi.fn(),
  onColorSchemeChanged: vi.fn(),
}));

describe('useColorScheme', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(onColorSchemeChanged).mockReturnValue(vi.fn());
  });

  describe('initial read', () => {
    it('starts at "light" with loading=true', () => {
      vi.mocked(getColorScheme).mockReturnValue(new Promise(() => {}));
      const { result } = renderHook(() => useColorScheme());

      expect(result.current.scheme).toBe('light');
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('updates scheme and clears loading once the read resolves', async () => {
      vi.mocked(getColorScheme).mockResolvedValue('dark');
      const { result } = renderHook(() => useColorScheme());

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.scheme).toBe('dark');
      expect(result.current.error).toBeNull();
    });

    it('sets error and keeps "light" when the read rejects', async () => {
      vi.mocked(getColorScheme).mockRejectedValue(new Error('not supported'));
      const { result } = renderHook(() => useColorScheme());

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.scheme).toBe('light');
      expect(result.current.error).toEqual(new Error('not supported'));
    });
  });

  describe('external changes', () => {
    it('updates scheme when onColorSchemeChanged fires', async () => {
      vi.mocked(getColorScheme).mockResolvedValue('light');

      let handler: ((scheme: 'light' | 'dark') => void) | undefined;

      vi.mocked(onColorSchemeChanged).mockImplementation((cb) => {
        handler = cb;

        return vi.fn();
      });

      const { result } = renderHook(() => useColorScheme());

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        handler?.('dark');
      });

      expect(result.current.scheme).toBe('dark');
    });

    it('unsubscribes on unmount', () => {
      const unsubscribe = vi.fn();

      vi.mocked(getColorScheme).mockReturnValue(new Promise(() => {}));
      vi.mocked(onColorSchemeChanged).mockReturnValue(unsubscribe);

      const { unmount } = renderHook(() => useColorScheme());

      unmount();

      expect(unsubscribe).toHaveBeenCalled();
    });
  });

  describe('setScheme', () => {
    it('forwards the preference to setColorScheme', () => {
      vi.mocked(getColorScheme).mockReturnValue(new Promise(() => {}));
      vi.mocked(setColorScheme).mockReturnValue(new Promise(() => {}));
      const { result } = renderHook(() => useColorScheme());

      act(() => {
        result.current.setScheme('dark');
      });

      expect(setColorScheme).toHaveBeenCalledWith('dark');
    });

    it('does not change scheme by itself — waits for the real onColorSchemeChanged echo', () => {
      vi.mocked(getColorScheme).mockReturnValue(new Promise(() => {}));
      vi.mocked(setColorScheme).mockReturnValue(new Promise(() => {}));
      const { result } = renderHook(() => useColorScheme());

      act(() => {
        result.current.setScheme('dark');
      });

      expect(result.current.scheme).toBe('light');
    });

    it('sets error when the write rejects', async () => {
      vi.mocked(getColorScheme).mockReturnValue(new Promise(() => {}));
      vi.mocked(setColorScheme).mockRejectedValue(new Error('write failed'));
      const { result } = renderHook(() => useColorScheme());

      act(() => {
        result.current.setScheme('dark');
      });

      await waitFor(() => expect(result.current.error).toEqual(new Error('write failed')));
    });

    it('clears a previous error once a write succeeds', async () => {
      vi.mocked(getColorScheme).mockReturnValue(new Promise(() => {}));
      vi.mocked(setColorScheme).mockRejectedValueOnce(new Error('write failed'));
      const { result } = renderHook(() => useColorScheme());

      act(() => {
        result.current.setScheme('dark');
      });
      await waitFor(() => expect(result.current.error).toEqual(new Error('write failed')));

      vi.mocked(setColorScheme).mockResolvedValueOnce(undefined);
      act(() => {
        result.current.setScheme('light');
      });
      await waitFor(() => expect(result.current.error).toBeNull());
    });
  });

  it('returns a stable setScheme reference across re-renders', () => {
    vi.mocked(getColorScheme).mockReturnValue(new Promise(() => {}));
    const { result, rerender } = renderHook(() => useColorScheme());
    const first = result.current.setScheme;

    rerender();

    expect(result.current.setScheme).toBe(first);
  });
});
