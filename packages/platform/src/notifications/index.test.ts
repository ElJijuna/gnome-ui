import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { onNotificationAction, sendNotification, withdrawNotification } from './index.ts';

type WebKitWindow = Window & {
  webkit?: {
    messageHandlers: Record<string, { postMessage: (payload: unknown) => void }>;
  };
};

function setWebKit(handlers: Record<string, { postMessage: (payload: unknown) => void }>) {
  (window as WebKitWindow).webkit = { messageHandlers: handlers };
}

function clearWebKit() {
  delete (window as WebKitWindow).webkit;
}

class MockNotification {
  static permission: NotificationPermission = 'granted';
  static requestPermission = vi.fn<() => Promise<NotificationPermission>>(
    async () => MockNotification.permission,
  );

  onclick: (() => void) | null = null;
  onclose: (() => void) | null = null;
  closed = false;

  constructor(
    public title: string,
    public options?: NotificationOptions,
  ) {
    instances.push(this);
  }

  close() {
    this.closed = true;
    this.onclose?.();
  }
}

let instances: MockNotification[] = [];

function installMockNotification() {
  instances = [];
  MockNotification.permission = 'granted';
  MockNotification.requestPermission = vi.fn(async () => MockNotification.permission);
  vi.stubGlobal('Notification', MockNotification);
}

describe('sendNotification', () => {
  beforeEach(() => {
    clearWebKit();
    vi.unstubAllGlobals();
  });

  it('forwards to the notifications bridge channel in a WebKit environment', async () => {
    const spy = vi.fn();

    setWebKit({ notifications: { postMessage: spy } });
    const id = await sendNotification({ id: 'download-done', title: 'Download complete' });

    expect(id).toBe('download-done');
    expect(spy).toHaveBeenCalledWith({
      action: 'send',
      id: 'download-done',
      title: 'Download complete',
      body: undefined,
      icon: undefined,
      priority: 'normal',
      actions: [],
    });
  });

  it('auto-generates an id when none is provided', async () => {
    setWebKit({ notifications: { postMessage: vi.fn() } });

    const id = await sendNotification({ title: 'Hello' });

    expect(id).toBeTruthy();
  });

  it('shows a real Notification when permission is already granted', async () => {
    installMockNotification();

    await sendNotification({ id: 'n1', title: 'Hello', body: 'World' });

    expect(instances).toHaveLength(1);
    expect(instances[0].title).toBe('Hello');
    expect(instances[0].options).toMatchObject({ body: 'World' });
  });

  it('requests permission first when it has not been decided yet', async () => {
    installMockNotification();
    MockNotification.permission = 'default';
    MockNotification.requestPermission = vi.fn(async () => 'granted');

    await sendNotification({ title: 'Hello' });

    expect(MockNotification.requestPermission).toHaveBeenCalled();
    expect(instances).toHaveLength(1);
  });

  it('resolves without showing anything when permission is denied', async () => {
    installMockNotification();
    MockNotification.permission = 'denied';

    const id = await sendNotification({ title: 'Hello' });

    expect(id).toBeTruthy();
    expect(instances).toHaveLength(0);
  });

  it('rejects when neither the bridge nor the Notification API is available', async () => {
    await expect(sendNotification({ title: 'Hello' })).rejects.toThrow(
      'Notifications are not supported in this environment.',
    );
  });

  it('routes a click on the browser fallback through onNotificationAction as "default"', async () => {
    installMockNotification();
    const handler = vi.fn();

    const id = await sendNotification({ id: 'n1', title: 'Hello' });
    const off = onNotificationAction(id, handler);

    instances[0].onclick?.();

    expect(handler).toHaveBeenCalledWith('default');
    off();
  });
});

describe('withdrawNotification', () => {
  beforeEach(() => {
    clearWebKit();
    vi.unstubAllGlobals();
  });

  it('forwards the id to the notifications bridge channel in a WebKit environment', async () => {
    const spy = vi.fn();

    setWebKit({ notifications: { postMessage: spy } });
    await withdrawNotification('n1');

    expect(spy).toHaveBeenCalledWith({ action: 'withdraw', id: 'n1' });
  });

  it('closes the matching browser Notification instance', async () => {
    installMockNotification();

    const id = await sendNotification({ title: 'Hello' });
    await withdrawNotification(id);

    expect(instances[0].closed).toBe(true);
  });

  it('is a no-op for an id that was never sent through the browser fallback', async () => {
    installMockNotification();

    await expect(withdrawNotification('never-sent')).resolves.toBeUndefined();
  });
});

describe('onNotificationAction', () => {
  afterEach(clearWebKit);

  it('calls the handler when the action event matches the subscribed notification id', () => {
    const handler = vi.fn();
    const off = onNotificationAction('n1', handler);

    window.dispatchEvent(
      new CustomEvent('gnome:notification-action', {
        detail: { notificationId: 'n1', actionId: 'reply' },
      }),
    );

    expect(handler).toHaveBeenCalledWith('reply');
    off();
  });

  it('ignores action events for a different notification id', () => {
    const handler = vi.fn();
    const off = onNotificationAction('n1', handler);

    window.dispatchEvent(
      new CustomEvent('gnome:notification-action', {
        detail: { notificationId: 'n2', actionId: 'reply' },
      }),
    );

    expect(handler).not.toHaveBeenCalled();
    off();
  });

  it('stops firing after unsubscribing', () => {
    const handler = vi.fn();
    const off = onNotificationAction('n1', handler);

    off();
    window.dispatchEvent(
      new CustomEvent('gnome:notification-action', {
        detail: { notificationId: 'n1', actionId: 'reply' },
      }),
    );

    expect(handler).not.toHaveBeenCalled();
  });
});
