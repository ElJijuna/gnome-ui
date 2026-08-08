import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { openFile, saveFile, selectFolder } from './index.ts';

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

function respond(requestId: string, detail: Record<string, unknown>) {
  window.dispatchEvent(
    new CustomEvent('gnome:file-chooser-result', { detail: { requestId, ...detail } }),
  );
}

function withCapturedRequest() {
  let requestId = '';
  const postMessage = vi.fn((payload: { requestId: string }) => {
    ({ requestId } = payload);
  });

  setWebKit({ fileChooser: { postMessage } });

  return { postMessage, getRequestId: () => requestId };
}

describe('openFile', () => {
  beforeEach(clearWebKit);
  afterEach(() => {
    vi.useRealTimers();
  });

  it('rejects outside a WebKit environment — there is no browser fallback', async () => {
    await expect(openFile()).rejects.toThrow(
      'File dialogs are not supported outside a WebKitGTK environment',
    );
  });

  it('sends an "open" action with the given options', async () => {
    const { postMessage, getRequestId } = withCapturedRequest();

    const pending = openFile({ title: 'Choose a file', multiple: true });

    respond(getRequestId(), { canceled: false, paths: ['/home/user/a.txt'] });
    await pending;

    expect(postMessage).toHaveBeenCalledWith({
      action: 'open',
      title: 'Choose a file',
      multiple: true,
      requestId: getRequestId(),
    });
  });

  it('resolves with the chosen paths', async () => {
    const { getRequestId } = withCapturedRequest();

    const pending = openFile({ multiple: true });

    respond(getRequestId(), { canceled: false, paths: ['/a.txt', '/b.txt'] });

    await expect(pending).resolves.toEqual({ canceled: false, paths: ['/a.txt', '/b.txt'] });
  });

  it('resolves with canceled: true and no paths when the user dismisses the dialog', async () => {
    const { getRequestId } = withCapturedRequest();

    const pending = openFile();

    respond(getRequestId(), { canceled: true, paths: [] });

    await expect(pending).resolves.toEqual({ canceled: true, paths: [] });
  });

  it('rejects if the host never responds', async () => {
    vi.useFakeTimers();
    withCapturedRequest();

    const pending = openFile();
    const assertion = expect(pending).rejects.toThrow(/Timed out waiting/);

    await vi.advanceTimersByTimeAsync(5000);
    await assertion;
  });
});

describe('saveFile', () => {
  beforeEach(clearWebKit);

  it('rejects outside a WebKit environment — there is no browser fallback', async () => {
    await expect(saveFile()).rejects.toThrow(
      'File dialogs are not supported outside a WebKitGTK environment',
    );
  });

  it('sends a "save" action with the given options', async () => {
    const { postMessage, getRequestId } = withCapturedRequest();

    const pending = saveFile({ currentName: 'report.pdf' });

    respond(getRequestId(), { canceled: false, path: '/home/user/report.pdf' });
    await pending;

    expect(postMessage).toHaveBeenCalledWith({
      action: 'save',
      currentName: 'report.pdf',
      requestId: getRequestId(),
    });
  });

  it('resolves with the chosen destination path', async () => {
    const { getRequestId } = withCapturedRequest();

    const pending = saveFile();

    respond(getRequestId(), { canceled: false, path: '/home/user/report.pdf' });

    await expect(pending).resolves.toEqual({ canceled: false, path: '/home/user/report.pdf' });
  });

  it('resolves with canceled: true and a null path when the user dismisses the dialog', async () => {
    const { getRequestId } = withCapturedRequest();

    const pending = saveFile();

    respond(getRequestId(), { canceled: true, path: null });

    await expect(pending).resolves.toEqual({ canceled: true, path: null });
  });
});

describe('selectFolder', () => {
  beforeEach(clearWebKit);

  it('rejects outside a WebKit environment — there is no browser fallback', async () => {
    await expect(selectFolder()).rejects.toThrow(
      'File dialogs are not supported outside a WebKitGTK environment',
    );
  });

  it('sends a "selectFolder" action with the given options', async () => {
    const { postMessage, getRequestId } = withCapturedRequest();

    const pending = selectFolder({ currentFolder: '/home/user' });

    respond(getRequestId(), { canceled: false, path: '/home/user/Projects' });
    await pending;

    expect(postMessage).toHaveBeenCalledWith({
      action: 'selectFolder',
      currentFolder: '/home/user',
      requestId: getRequestId(),
    });
  });

  it('resolves with the chosen folder path', async () => {
    const { getRequestId } = withCapturedRequest();

    const pending = selectFolder();

    respond(getRequestId(), { canceled: false, path: '/home/user/Projects' });

    await expect(pending).resolves.toEqual({ canceled: false, path: '/home/user/Projects' });
  });
});

describe('concurrency', () => {
  beforeEach(clearWebKit);

  it('matches an openFile and a saveFile in flight at the same time to their own responses', async () => {
    const requestIds: string[] = [];

    setWebKit({
      fileChooser: {
        postMessage: vi.fn((payload: { requestId: string }) => {
          requestIds.push(payload.requestId);
        }),
      },
    });

    const open = openFile();
    const save = saveFile();

    expect(requestIds).toHaveLength(2);

    // Resolve out of order to prove matching is by requestId, not call order.
    respond(requestIds[1], { canceled: false, path: '/saved.txt' });
    respond(requestIds[0], { canceled: false, paths: ['/opened.txt'] });

    await expect(open).resolves.toEqual({ canceled: false, paths: ['/opened.txt'] });
    await expect(save).resolves.toEqual({ canceled: false, path: '/saved.txt' });
  });
});
