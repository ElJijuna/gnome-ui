import type { SendNotificationOptions } from '@gnome-ui/platform';
import { onNotificationAction, sendNotification, withdrawNotification } from '@gnome-ui/platform';
import { useCallback, useEffect, useRef } from 'react';

export interface UseNotificationSendOptions extends SendNotificationOptions {
  /**
   * Called when the user picks one of `actions` (WebKitGTK), or clicks the
   * notification body — the browser fallback has no separate action
   * buttons, so it fires this with `actionId: "default"`. Automatically
   * unsubscribed when the component unmounts or the notification is
   * dismissed.
   */
  onAction?: (actionId: string) => void;
}

export interface UseNotificationResult {
  /** Sends a notification. Resolves with its id — auto-withdrawn when the component unmounts. */
  send: (options: UseNotificationSendOptions) => Promise<string>;
  /** Withdraws a previously sent notification by id. */
  dismiss: (id: string) => Promise<void>;
}

/**
 * Send and dismiss desktop notifications, scoped to the component's
 * lifetime: every notification sent through this hook is withdrawn, and
 * every `onAction` listener unsubscribed, when the component unmounts —
 * `@gnome-ui/platform`'s `sendNotification`/`onNotificationAction` don't do
 * that for you, since they have no concept of a React component.
 *
 * @example
 * const { send, dismiss } = useNotification();
 *
 * async function notifyDownloadDone() {
 *   const id = await send({
 *     title: "Download complete",
 *     body: "report.pdf",
 *     actions: [{ id: "open", label: "Open" }],
 *     onAction: (actionId) => {
 *       if (actionId === "open") openFile("report.pdf");
 *     },
 *   });
 *
 *   setTimeout(() => dismiss(id), 5000);
 * }
 */
export function useNotification(): UseNotificationResult {
  const cleanupRef = useRef(new Map<string, () => void>());

  useEffect(() => {
    const cleanup = cleanupRef.current;

    return () => {
      for (const [id, unsubscribe] of cleanup) {
        unsubscribe();
        void withdrawNotification(id);
      }
      cleanup.clear();
    };
  }, []);

  const send = useCallback(async (options: UseNotificationSendOptions) => {
    const { onAction, ...rest } = options;
    const id = await sendNotification(rest);

    cleanupRef.current.set(id, onAction ? onNotificationAction(id, onAction) : () => {});

    return id;
  }, []);

  const dismiss = useCallback(async (id: string) => {
    cleanupRef.current.get(id)?.();
    cleanupRef.current.delete(id);
    await withdrawNotification(id);
  }, []);

  return { send, dismiss };
}
