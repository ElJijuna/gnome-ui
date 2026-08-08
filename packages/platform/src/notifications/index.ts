import { isWebKitBridge, onNativeEvent, postMessage } from '../bridge';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface NotificationAction {
  /** Reported back to `onNotificationAction` when the user picks this button. */
  id: string;
  /** Button label shown to the user. */
  label: string;
}

export interface SendNotificationOptions {
  /**
   * Stable identifier for this notification. Auto-generated when omitted —
   * capture the return value of `sendNotification()` to withdraw it or
   * subscribe to its actions later.
   */
  id?: string;
  title: string;
  body?: string;
  /** Icon name (WebKitGTK, resolved via the icon theme) or icon URL (browser fallback). */
  icon?: string;
  /** Defaults to `'normal'`. */
  priority?: NotificationPriority;
  /** Action buttons. WebKitGTK only — ignored by the browser `Notification` fallback. */
  actions?: NotificationAction[];
}

const ACTION_EVENT = 'notification-action';

let notificationCounter = 0;

function nextNotificationId(): string {
  notificationCounter += 1;

  return `notification-${notificationCounter}`;
}

// Tracks browser-fallback `Notification` instances by id so `withdrawNotification`
// can close the right one — WebKitGTK withdrawal is handled entirely host-side.
const browserNotifications = new Map<string, Notification>();

/**
 * Sends a desktop notification. Resolves with the notification's id (the one
 * passed as `options.id`, or an auto-generated one) — capture it to withdraw
 * the notification later or scope `onNotificationAction` to it.
 *
 * - **WebKitGTK**: forwards to the GJS host, which builds a `Gio.Notification`
 *   and calls `app.send_notification(id, notification)`. Fire-and-forget,
 *   matching `postMessage`'s contract.
 * - **Browser / PWA**: uses the real `Notification` API, requesting
 *   permission first if it hasn't been granted or denied yet. Action buttons
 *   are a WebKitGTK-only feature — plain `Notification` doesn't support them,
 *   so `options.actions` is ignored here. Clicking the notification focuses
 *   the window and fires `onNotificationAction(id, ...)` with a synthetic
 *   `'default'` action id.
 * - Resolves without showing anything if permission was previously denied —
 *   that's an expected user choice, not an error.
 * - Rejects only if neither the bridge nor the `Notification` API exists at all.
 */
export async function sendNotification(options: SendNotificationOptions): Promise<string> {
  const id = options.id ?? nextNotificationId();

  if (isWebKitBridge()) {
    await postMessage('notifications', {
      action: 'send',
      id,
      title: options.title,
      body: options.body,
      icon: options.icon,
      priority: options.priority ?? 'normal',
      actions: options.actions ?? [],
    });

    return id;
  }

  if (typeof Notification === 'undefined') {
    throw new Error('Notifications are not supported in this environment.');
  }

  let { permission } = Notification;

  if (permission === 'default') {
    permission = await Notification.requestPermission();
  }

  if (permission !== 'granted') {
    return id;
  }

  const notification = new Notification(options.title, {
    body: options.body,
    icon: options.icon,
  });

  notification.onclick = () => {
    window.focus?.();
    window.dispatchEvent(
      new CustomEvent(`gnome:${ACTION_EVENT}`, {
        detail: { notificationId: id, actionId: 'default' },
      }),
    );
  };
  notification.onclose = () => {
    browserNotifications.delete(id);
  };

  browserNotifications.set(id, notification);

  return id;
}

/**
 * Withdraws (dismisses) a previously sent notification by id.
 *
 * - **WebKitGTK**: forwards to the host, which calls
 *   `app.withdraw_notification(id)`. Fire-and-forget.
 * - **Browser / PWA**: closes the matching `Notification` instance created by
 *   `sendNotification`, if one is still tracked — a no-op if the user already
 *   dismissed it, or if the id was never created through this fallback.
 */
export async function withdrawNotification(id: string): Promise<void> {
  if (isWebKitBridge()) {
    await postMessage('notifications', { action: 'withdraw', id });

    return;
  }

  browserNotifications.get(id)?.close();
  browserNotifications.delete(id);
}

/**
 * Subscribes to action-button clicks on a specific notification.
 *
 * WebKitGTK dispatches `gnome:notification-action` (`{ notificationId,
 * actionId }`) when the user picks one of the buttons passed as
 * `options.actions` to `sendNotification`. The browser fallback synthesizes
 * the same event with `actionId: 'default'` when the notification itself is
 * clicked — plain `Notification` doesn't support separate action buttons.
 *
 * Returns an unsubscribe function.
 */
export function onNotificationAction(
  notificationId: string,
  handler: (actionId: string) => void,
): () => void {
  return onNativeEvent<{ notificationId: string; actionId: string }>(ACTION_EVENT, (detail) => {
    if (detail.notificationId === notificationId) {
      handler(detail.actionId);
    }
  });
}
