import { afterEach, describe, expect, it, vi } from 'vitest';

import { GnomeCopyButtonElement } from './copy-button';

function renderCopyButton(setup?: (el: GnomeCopyButtonElement) => void) {
  const copyButton = document.createElement('gnome-copy-button') as GnomeCopyButtonElement;
  setup?.(copyButton);
  document.body.append(copyButton);

  return copyButton;
}

function control(copyButton: GnomeCopyButtonElement) {
  return copyButton.querySelector<HTMLButtonElement>('[data-slot="icon-button-control"]');
}

function status(copyButton: GnomeCopyButtonElement) {
  return copyButton.querySelector<HTMLElement>('[data-slot="copy-button-status"]');
}

function stubClipboard(writeText: (text: string) => Promise<void>) {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  });
}

afterEach(() => {
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
});

describe('GnomeCopyButtonElement', () => {
  it('registers the custom element', () => {
    renderCopyButton();
    expect(customElements.get('gnome-copy-button')).toBe(GnomeCopyButtonElement);
  });

  it('builds an internal icon button with the default label', () => {
    const copyButton = renderCopyButton((el) => {
      el.value = 'hello';
    });

    expect(copyButton.querySelector('gnome-icon-button')).not.toBeNull();
    expect(control(copyButton)?.getAttribute('aria-label')).toBe('Copy');
    expect(status(copyButton)?.getAttribute('role')).toBe('status');
    expect(status(copyButton)?.getAttribute('aria-live')).toBe('polite');
    expect(status(copyButton)?.textContent).toBe('');
  });

  it('accepts a custom label', () => {
    const copyButton = renderCopyButton((el) => {
      el.label = 'Copy CVE ID';
    });

    expect(control(copyButton)?.getAttribute('aria-label')).toBe('Copy CVE ID');
  });

  it('writes the value to the clipboard when the control is clicked', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard(writeText);

    const copyButton = renderCopyButton((el) => {
      el.value = 'CVE-2024-3094';
    });

    control(copyButton)?.click();
    await vi.waitFor(() => expect(writeText).toHaveBeenCalledExactlyOnceWith('CVE-2024-3094'));
  });

  it('switches to the copied state and announces it after a successful copy', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard(writeText);

    const onCopied = vi.fn();
    const copyButton = renderCopyButton((el) => {
      el.value = 'hello';
      el.addEventListener('gnome-copied', onCopied);
    });

    control(copyButton)?.click();

    await vi.waitFor(() => {
      expect(control(copyButton)?.getAttribute('aria-label')).toBe('Copied!');
    });
    expect(copyButton.copied).toBe(true);
    expect(copyButton.hasAttribute('data-copied')).toBe(true);
    expect(status(copyButton)?.textContent).toBe('Copied!');
    expect(onCopied).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ detail: { value: 'hello' } }),
    );
  });

  it('accepts a custom copied label', async () => {
    stubClipboard(vi.fn().mockResolvedValue(undefined));

    const copyButton = renderCopyButton((el) => {
      el.value = 'hello';
      el.copiedLabel = 'Added to clipboard';
    });

    control(copyButton)?.click();

    await vi.waitFor(() => {
      expect(control(copyButton)?.getAttribute('aria-label')).toBe('Added to clipboard');
    });
    expect(status(copyButton)?.textContent).toBe('Added to clipboard');
  });

  it('reverts to the default label after resetDelay elapses', async () => {
    stubClipboard(vi.fn().mockResolvedValue(undefined));
    vi.useFakeTimers();

    const copyButton = renderCopyButton((el) => {
      el.value = 'hello';
      el.resetDelay = 20;
    });

    control(copyButton)?.click();
    await vi.advanceTimersByTimeAsync(0);
    expect(control(copyButton)?.getAttribute('aria-label')).toBe('Copied!');

    await vi.advanceTimersByTimeAsync(20);
    expect(control(copyButton)?.getAttribute('aria-label')).toBe('Copy');
    expect(copyButton.copied).toBe(false);
    expect(copyButton.hasAttribute('data-copied')).toBe(false);
    expect(status(copyButton)?.textContent).toBe('');
  });

  it('restarts the reset timer when clicked again before it elapses', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard(writeText);
    vi.useFakeTimers();

    const copyButton = renderCopyButton((el) => {
      el.value = 'hello';
      el.resetDelay = 40;
    });

    control(copyButton)?.click();
    await vi.advanceTimersByTimeAsync(0);
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(copyButton.copied).toBe(true);

    await vi.advanceTimersByTimeAsync(25);
    control(copyButton)?.click();
    await vi.advanceTimersByTimeAsync(0);
    expect(writeText).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(25);
    expect(copyButton.copied).toBe(true);

    await vi.advanceTimersByTimeAsync(20);
    expect(copyButton.copied).toBe(false);
  });

  it('dispatches gnome-copy-error and keeps the default label when the clipboard write rejects', async () => {
    const error = new Error('denied');
    stubClipboard(vi.fn().mockRejectedValue(error));

    const onCopyError = vi.fn();
    const onCopied = vi.fn();
    const copyButton = renderCopyButton((el) => {
      el.value = 'hello';
      el.addEventListener('gnome-copy-error', onCopyError);
      el.addEventListener('gnome-copied', onCopied);
    });

    control(copyButton)?.click();

    await vi.waitFor(() =>
      expect(onCopyError).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({ detail: { error } }),
      ),
    );
    expect(onCopied).not.toHaveBeenCalled();
    expect(copyButton.copied).toBe(false);
    expect(control(copyButton)?.getAttribute('aria-label')).toBe('Copy');
  });

  it('dispatches gnome-copy-error when the Clipboard API is unavailable', async () => {
    const onCopyError = vi.fn();
    const copyButton = renderCopyButton((el) => {
      el.value = 'hello';
      el.addEventListener('gnome-copy-error', onCopyError);
    });

    control(copyButton)?.click();

    await vi.waitFor(() => expect(onCopyError).toHaveBeenCalledOnce());
    expect(copyButton.copied).toBe(false);
  });

  it('forwards variant, size, disabled, and osd to the internal icon button', () => {
    const copyButton = renderCopyButton((el) => {
      el.variant = 'flat';
      el.size = 'sm';
      el.disabled = true;
      el.osd = true;
    });

    const iconButton = copyButton.querySelector('gnome-icon-button');
    expect(iconButton?.getAttribute('variant')).toBe('flat');
    expect(iconButton?.getAttribute('size')).toBe('sm');
    expect(iconButton?.hasAttribute('disabled')).toBe(true);
    expect(iconButton?.hasAttribute('osd')).toBe(true);
    expect(copyButton.dataset.variant).toBe('flat');
    expect(copyButton.dataset.size).toBe('sm');
  });

  it('clears the pending reset timer on disconnect without throwing', async () => {
    stubClipboard(vi.fn().mockResolvedValue(undefined));

    const copyButton = renderCopyButton((el) => {
      el.value = 'hello';
      el.resetDelay = 5000;
    });

    control(copyButton)?.click();
    await vi.waitFor(() => expect(copyButton.copied).toBe(true));

    expect(() => copyButton.remove()).not.toThrow();
  });

  it('proxies focus and click to the internal control', () => {
    const copyButton = renderCopyButton();

    copyButton.focus();
    expect(document.activeElement).toBe(control(copyButton));

    const clickListener = vi.fn();
    control(copyButton)?.addEventListener('click', clickListener);
    copyButton.click();
    expect(clickListener).toHaveBeenCalledOnce();
  });
});
