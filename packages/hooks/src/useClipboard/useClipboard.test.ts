import { readText, writeText } from '@gnome-ui/platform';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useClipboard } from './index';

vi.mock('@gnome-ui/platform', () => ({
  readText: vi.fn(),
  writeText: vi.fn(),
}));

describe('useClipboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('starts with value=null, loading=false, error=null', () => {
      const { result } = renderHook(() => useClipboard());

      expect(result.current.value).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('copy', () => {
    it('calls platform.writeText with the given text', async () => {
      vi.mocked(writeText).mockResolvedValue(undefined);
      const { result } = renderHook(() => useClipboard());

      await act(async () => {
        await result.current.copy('hello');
      });

      expect(writeText).toHaveBeenCalledWith('hello');
    });

    it('sets value to the copied text on success', async () => {
      vi.mocked(writeText).mockResolvedValue(undefined);
      const { result } = renderHook(() => useClipboard());

      await act(async () => {
        await result.current.copy('hello');
      });

      expect(result.current.value).toBe('hello');
    });

    it('sets error and rejects when writeText rejects, without touching value', async () => {
      vi.mocked(writeText).mockRejectedValue(new Error('not supported'));
      const { result } = renderHook(() => useClipboard());

      await act(async () => {
        await expect(result.current.copy('hello')).rejects.toThrow('not supported');
      });

      expect(result.current.error).toEqual(new Error('not supported'));
      expect(result.current.value).toBeNull();
    });

    it('wraps a non-Error rejection in an Error', async () => {
      vi.mocked(writeText).mockRejectedValue('denied');
      const { result } = renderHook(() => useClipboard());

      await act(async () => {
        await expect(result.current.copy('hello')).rejects.toBe('denied');
      });

      expect(result.current.error).toEqual(new Error('denied'));
    });
  });

  describe('paste', () => {
    it('calls platform.readText and resolves with its value', async () => {
      vi.mocked(readText).mockResolvedValue('from clipboard');
      const { result } = renderHook(() => useClipboard());

      let pasted = '';

      await act(async () => {
        pasted = await result.current.paste();
      });

      expect(readText).toHaveBeenCalled();
      expect(pasted).toBe('from clipboard');
    });

    it('sets value to the pasted text', async () => {
      vi.mocked(readText).mockResolvedValue('from clipboard');
      const { result } = renderHook(() => useClipboard());

      await act(async () => {
        await result.current.paste();
      });

      expect(result.current.value).toBe('from clipboard');
    });

    it('sets error and rejects when readText rejects', async () => {
      vi.mocked(readText).mockRejectedValue(new Error('not supported'));
      const { result } = renderHook(() => useClipboard());

      await act(async () => {
        await expect(result.current.paste()).rejects.toThrow('not supported');
      });

      expect(result.current.error).toEqual(new Error('not supported'));
    });
  });

  describe('loading', () => {
    it('is true while a copy call is pending and false once it settles', async () => {
      let resolveWrite: () => void = () => {};

      vi.mocked(writeText).mockReturnValue(
        new Promise((resolve) => {
          resolveWrite = resolve;
        }),
      );

      const { result } = renderHook(() => useClipboard());

      let pending!: Promise<unknown>;

      act(() => {
        pending = result.current.copy('hello');
      });

      expect(result.current.loading).toBe(true);

      await act(async () => {
        resolveWrite();
        await pending;
      });

      expect(result.current.loading).toBe(false);
    });
  });

  it('clears a previous error once a later call succeeds', async () => {
    vi.mocked(writeText).mockRejectedValueOnce(new Error('boom'));
    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await expect(result.current.copy('hello')).rejects.toThrow('boom');
    });
    expect(result.current.error).toEqual(new Error('boom'));

    vi.mocked(writeText).mockResolvedValueOnce(undefined);
    await act(async () => {
      await result.current.copy('hello again');
    });

    expect(result.current.error).toBeNull();
  });

  it('returns stable copy/paste references across re-renders', () => {
    const { result, rerender } = renderHook(() => useClipboard());
    const first = result.current;

    rerender();

    expect(result.current.copy).toBe(first.copy);
    expect(result.current.paste).toBe(first.paste);
  });
});
