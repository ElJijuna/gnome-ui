import { onNotificationAction, sendNotification, withdrawNotification } from '@gnome-ui/platform';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useNotification } from './index';

vi.mock('@gnome-ui/platform', () => ({
  sendNotification: vi.fn(),
  withdrawNotification: vi.fn(),
  onNotificationAction: vi.fn(),
}));

describe('useNotification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(sendNotification).mockResolvedValue('notification-1');
    vi.mocked(withdrawNotification).mockResolvedValue(undefined);
    vi.mocked(onNotificationAction).mockReturnValue(vi.fn());
  });

  describe('send', () => {
    it('forwards options to sendNotification, minus onAction', async () => {
      const { result } = renderHook(() => useNotification());

      await act(async () => {
        await result.current.send({ title: 'Download complete', body: 'report.pdf' });
      });

      expect(sendNotification).toHaveBeenCalledWith({
        title: 'Download complete',
        body: 'report.pdf',
      });
    });

    it('resolves with the id returned by sendNotification', async () => {
      vi.mocked(sendNotification).mockResolvedValue('custom-id');
      const { result } = renderHook(() => useNotification());

      let id: string | undefined;

      await act(async () => {
        id = await result.current.send({ title: 'Hello' });
      });

      expect(id).toBe('custom-id');
    });

    it('subscribes onAction via onNotificationAction, scoped to the returned id', async () => {
      const handler = vi.fn();
      const { result } = renderHook(() => useNotification());

      await act(async () => {
        await result.current.send({ title: 'Hello', onAction: handler });
      });

      expect(onNotificationAction).toHaveBeenCalledWith('notification-1', handler);
    });

    it('does not call onNotificationAction when onAction is omitted', async () => {
      const { result } = renderHook(() => useNotification());

      await act(async () => {
        await result.current.send({ title: 'Hello' });
      });

      expect(onNotificationAction).not.toHaveBeenCalled();
    });

    it('propagates a rejection from sendNotification', async () => {
      vi.mocked(sendNotification).mockRejectedValue(new Error('not supported'));
      const { result } = renderHook(() => useNotification());

      await expect(result.current.send({ title: 'Hello' })).rejects.toThrow('not supported');
    });
  });

  describe('dismiss', () => {
    it('calls withdrawNotification with the given id', async () => {
      const { result } = renderHook(() => useNotification());

      await act(async () => {
        await result.current.dismiss('notification-1');
      });

      expect(withdrawNotification).toHaveBeenCalledWith('notification-1');
    });

    it('unsubscribes the onAction listener for that notification', async () => {
      const unsubscribe = vi.fn();

      vi.mocked(onNotificationAction).mockReturnValue(unsubscribe);
      const { result } = renderHook(() => useNotification());

      await act(async () => {
        await result.current.send({ title: 'Hello', onAction: vi.fn() });
      });
      await act(async () => {
        await result.current.dismiss('notification-1');
      });

      expect(unsubscribe).toHaveBeenCalled();
    });

    it('does not unsubscribe an unrelated notification when dismissing one without a listener', async () => {
      const unsubscribe = vi.fn();

      vi.mocked(onNotificationAction).mockReturnValue(unsubscribe);
      const { result } = renderHook(() => useNotification());

      await act(async () => {
        await result.current.send({ title: 'Hello', onAction: vi.fn() });
      });
      await act(async () => {
        await result.current.dismiss('some-other-id');
      });

      expect(unsubscribe).not.toHaveBeenCalled();
    });
  });

  describe('unmount cleanup', () => {
    it('withdraws every notification sent through this hook instance', async () => {
      vi.mocked(sendNotification)
        .mockResolvedValueOnce('notification-1')
        .mockResolvedValueOnce('notification-2');

      const { result, unmount } = renderHook(() => useNotification());

      await act(async () => {
        await result.current.send({ title: 'First' });
        await result.current.send({ title: 'Second' });
      });

      unmount();

      expect(withdrawNotification).toHaveBeenCalledWith('notification-1');
      expect(withdrawNotification).toHaveBeenCalledWith('notification-2');
    });

    it('unsubscribes every onAction listener', async () => {
      const unsubscribe = vi.fn();

      vi.mocked(onNotificationAction).mockReturnValue(unsubscribe);
      const { result, unmount } = renderHook(() => useNotification());

      await act(async () => {
        await result.current.send({ title: 'Hello', onAction: vi.fn() });
      });

      unmount();

      expect(unsubscribe).toHaveBeenCalled();
    });

    it('does not withdraw a notification that was already dismissed', async () => {
      const { result, unmount } = renderHook(() => useNotification());

      await act(async () => {
        await result.current.send({ title: 'Hello' });
      });
      await act(async () => {
        await result.current.dismiss('notification-1');
      });

      vi.mocked(withdrawNotification).mockClear();
      unmount();

      expect(withdrawNotification).not.toHaveBeenCalled();
    });
  });

  it('returns stable send/dismiss references across re-renders', () => {
    const { result, rerender } = renderHook(() => useNotification());
    const first = result.current;

    rerender();

    expect(result.current.send).toBe(first.send);
    expect(result.current.dismiss).toBe(first.dismiss);
  });
});
