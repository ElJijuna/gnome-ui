import { openFile, saveFile, selectFolder } from '@gnome-ui/platform';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useFileChooser } from './index';

vi.mock('@gnome-ui/platform', () => ({
  openFile: vi.fn(),
  saveFile: vi.fn(),
  selectFolder: vi.fn(),
}));

describe('useFileChooser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('starts with path=null, paths=[], loading=false, error=null', () => {
      const { result } = renderHook(() => useFileChooser());

      expect(result.current.path).toBeNull();
      expect(result.current.paths).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('open', () => {
    it('forwards options to platform.openFile', async () => {
      vi.mocked(openFile).mockResolvedValue({ canceled: false, paths: ['/a.txt'] });
      const { result } = renderHook(() => useFileChooser());

      await act(async () => {
        await result.current.open({ multiple: true });
      });

      expect(openFile).toHaveBeenCalledWith({ multiple: true });
    });

    it('sets path to the first entry and paths to all entries on success', async () => {
      vi.mocked(openFile).mockResolvedValue({ canceled: false, paths: ['/a.txt', '/b.txt'] });
      const { result } = renderHook(() => useFileChooser());

      await act(async () => {
        await result.current.open();
      });

      expect(result.current.path).toBe('/a.txt');
      expect(result.current.paths).toEqual(['/a.txt', '/b.txt']);
    });

    it('leaves path/paths unchanged when the user cancels', async () => {
      vi.mocked(openFile)
        .mockResolvedValueOnce({ canceled: false, paths: ['/a.txt'] })
        .mockResolvedValueOnce({ canceled: true, paths: [] });

      const { result } = renderHook(() => useFileChooser());

      await act(async () => {
        await result.current.open();
      });
      await act(async () => {
        await result.current.open();
      });

      expect(result.current.path).toBe('/a.txt');
      expect(result.current.paths).toEqual(['/a.txt']);
    });

    it('sets error and rejects when openFile rejects, without touching path', async () => {
      vi.mocked(openFile).mockRejectedValue(new Error('not supported'));
      const { result } = renderHook(() => useFileChooser());

      await act(async () => {
        await expect(result.current.open()).rejects.toThrow('not supported');
      });

      expect(result.current.error).toEqual(new Error('not supported'));
      expect(result.current.path).toBeNull();
    });

    it('loading is true while the call is pending and false once it settles', async () => {
      let resolveOpen: (value: { canceled: boolean; paths: string[] }) => void = () => {};

      vi.mocked(openFile).mockReturnValue(
        new Promise((resolve) => {
          resolveOpen = resolve;
        }),
      );

      const { result } = renderHook(() => useFileChooser());

      let pending!: Promise<unknown>;

      act(() => {
        pending = result.current.open();
      });

      expect(result.current.loading).toBe(true);

      await act(async () => {
        resolveOpen({ canceled: true, paths: [] });
        await pending;
      });

      expect(result.current.loading).toBe(false);
    });
  });

  describe('save', () => {
    it('forwards options to platform.saveFile', async () => {
      vi.mocked(saveFile).mockResolvedValue({ canceled: false, path: '/report.pdf' });
      const { result } = renderHook(() => useFileChooser());

      await act(async () => {
        await result.current.save({ currentName: 'report.pdf' });
      });

      expect(saveFile).toHaveBeenCalledWith({ currentName: 'report.pdf' });
    });

    it('sets path on success', async () => {
      vi.mocked(saveFile).mockResolvedValue({ canceled: false, path: '/report.pdf' });
      const { result } = renderHook(() => useFileChooser());

      await act(async () => {
        await result.current.save();
      });

      expect(result.current.path).toBe('/report.pdf');
    });

    it('leaves path unchanged when the user cancels', async () => {
      vi.mocked(saveFile).mockResolvedValue({ canceled: true, path: null });
      const { result } = renderHook(() => useFileChooser());

      await act(async () => {
        await result.current.save();
      });

      expect(result.current.path).toBeNull();
    });
  });

  describe('selectFolder', () => {
    it('forwards options to platform.selectFolder', async () => {
      vi.mocked(selectFolder).mockResolvedValue({ canceled: false, path: '/home/user/Projects' });
      const { result } = renderHook(() => useFileChooser());

      await act(async () => {
        await result.current.selectFolder({ currentFolder: '/home/user' });
      });

      expect(selectFolder).toHaveBeenCalledWith({ currentFolder: '/home/user' });
    });

    it('sets path on success', async () => {
      vi.mocked(selectFolder).mockResolvedValue({ canceled: false, path: '/home/user/Projects' });
      const { result } = renderHook(() => useFileChooser());

      await act(async () => {
        await result.current.selectFolder();
      });

      expect(result.current.path).toBe('/home/user/Projects');
    });
  });

  it('clears a previous error once a later call succeeds', async () => {
    vi.mocked(openFile).mockRejectedValueOnce(new Error('boom'));
    const { result } = renderHook(() => useFileChooser());

    await act(async () => {
      await expect(result.current.open()).rejects.toThrow('boom');
    });
    expect(result.current.error).toEqual(new Error('boom'));

    vi.mocked(openFile).mockResolvedValueOnce({ canceled: true, paths: [] });
    await act(async () => {
      await result.current.open();
    });

    expect(result.current.error).toBeNull();
  });

  it('returns stable open/save/selectFolder references across re-renders', () => {
    const { result, rerender } = renderHook(() => useFileChooser());
    const first = result.current;

    rerender();

    expect(result.current.open).toBe(first.open);
    expect(result.current.save).toBe(first.save);
    expect(result.current.selectFolder).toBe(first.selectFolder);
  });
});
