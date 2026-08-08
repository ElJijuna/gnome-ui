import { getSetting, onSettingChanged, setSetting } from '@gnome-ui/platform';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSettings } from './index';

vi.mock('@gnome-ui/platform', () => ({
  getSetting: vi.fn(),
  setSetting: vi.fn(),
  onSettingChanged: vi.fn(),
}));

describe('useSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(onSettingChanged).mockReturnValue(vi.fn());
  });

  describe('initial read', () => {
    it('starts at defaultValue with loading=true', () => {
      vi.mocked(getSetting).mockReturnValue(new Promise(() => {}));
      const { result } = renderHook(() => useSettings('prefer-dark', false));

      expect(result.current.value).toBe(false);
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('calls getSetting with the given key', () => {
      vi.mocked(getSetting).mockReturnValue(new Promise(() => {}));
      renderHook(() => useSettings('prefer-dark', false));

      expect(getSetting).toHaveBeenCalledWith('prefer-dark');
    });

    it('updates value and clears loading once the read resolves', async () => {
      vi.mocked(getSetting).mockResolvedValue(true);
      const { result } = renderHook(() => useSettings('prefer-dark', false));

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.value).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('sets error and keeps defaultValue when the read rejects', async () => {
      vi.mocked(getSetting).mockRejectedValue(new Error('not supported'));
      const { result } = renderHook(() => useSettings('prefer-dark', false));

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.value).toBe(false);
      expect(result.current.error).toEqual(new Error('not supported'));
    });

    it('wraps a non-Error rejection in an Error', async () => {
      vi.mocked(getSetting).mockRejectedValue('denied');
      const { result } = renderHook(() => useSettings('prefer-dark', false));

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toEqual(new Error('denied'));
    });
  });

  describe('external changes', () => {
    it('updates value when onSettingChanged fires', async () => {
      vi.mocked(getSetting).mockResolvedValue(false);

      let handler: ((value: boolean) => void) | undefined;

      vi.mocked(onSettingChanged).mockImplementation((_key, cb) => {
        handler = cb as (value: boolean) => void;

        return vi.fn();
      });

      const { result } = renderHook(() => useSettings('prefer-dark', false));

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        handler?.(true);
      });

      expect(result.current.value).toBe(true);
    });

    it('unsubscribes on unmount', () => {
      const unsubscribe = vi.fn();

      vi.mocked(getSetting).mockReturnValue(new Promise(() => {}));
      vi.mocked(onSettingChanged).mockReturnValue(unsubscribe);

      const { unmount } = renderHook(() => useSettings('prefer-dark', false));

      unmount();

      expect(unsubscribe).toHaveBeenCalled();
    });

    it('re-subscribes when the key changes', async () => {
      vi.mocked(getSetting).mockResolvedValue(false);
      const { result, rerender } = renderHook(({ key }) => useSettings(key, false), {
        initialProps: { key: 'prefer-dark' },
      });

      expect(getSetting).toHaveBeenCalledWith('prefer-dark');
      // Flush the pending getSetting() resolution before rerendering — left
      // unawaited, it settles later and updates state outside act().
      await waitFor(() => expect(result.current.loading).toBe(false));

      rerender({ key: 'accent-color' });

      expect(getSetting).toHaveBeenCalledWith('accent-color');
      await waitFor(() => expect(result.current.loading).toBe(false));
    });
  });

  describe('setValue', () => {
    it('updates value optimistically before the write resolves', () => {
      vi.mocked(getSetting).mockReturnValue(new Promise(() => {}));
      vi.mocked(setSetting).mockReturnValue(new Promise(() => {}));
      const { result } = renderHook(() => useSettings('prefer-dark', false));

      act(() => {
        result.current.setValue(true);
      });

      expect(result.current.value).toBe(true);
      expect(setSetting).toHaveBeenCalledWith('prefer-dark', true);
    });

    it('sets error when the write rejects', async () => {
      vi.mocked(getSetting).mockReturnValue(new Promise(() => {}));
      vi.mocked(setSetting).mockRejectedValue(new Error('write failed'));
      const { result } = renderHook(() => useSettings('prefer-dark', false));

      act(() => {
        result.current.setValue(true);
      });

      await waitFor(() => expect(result.current.error).toEqual(new Error('write failed')));
    });

    it('clears a previous error once a write succeeds', async () => {
      vi.mocked(getSetting).mockReturnValue(new Promise(() => {}));
      vi.mocked(setSetting).mockRejectedValueOnce(new Error('write failed'));
      const { result } = renderHook(() => useSettings('prefer-dark', false));

      act(() => {
        result.current.setValue(true);
      });
      await waitFor(() => expect(result.current.error).toEqual(new Error('write failed')));

      vi.mocked(setSetting).mockResolvedValueOnce(undefined);
      act(() => {
        result.current.setValue(false);
      });
      await waitFor(() => expect(result.current.error).toBeNull());
    });
  });
});
