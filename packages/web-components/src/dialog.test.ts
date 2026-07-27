import { describe, expect, it, vi } from 'vitest';

import { type GnomeDialogCloseDetail, GnomeDialogElement } from './dialog';

function renderDialog() {
  const trigger = document.createElement('button');
  trigger.textContent = 'Open';
  document.body.append(trigger);
  trigger.focus();

  const dialog = document.createElement('gnome-dialog');
  dialog.innerHTML = `
    <section data-slot="dialog-surface">
      <header data-slot="dialog-header">
        <h2 data-slot="dialog-title">Delete item?</h2>
        <p data-slot="dialog-description">This cannot be undone.</p>
      </header>
      <div data-slot="dialog-actions">
        <button type="button" autofocus>Cancel</button>
        <button type="button">Delete</button>
      </div>
    </section>
  `;
  document.body.append(dialog);

  return { dialog, trigger };
}

describe('GnomeDialogElement', () => {
  it('registers the custom element', () => {
    expect(customElements.get('gnome-dialog')).toBe(GnomeDialogElement);
  });

  it('opens with dialog semantics, locks scroll, and focuses its content', async () => {
    const { dialog } = renderDialog();
    const surface = dialog.querySelector<HTMLElement>('[data-slot="dialog-surface"]');
    const title = dialog.querySelector<HTMLElement>('[data-slot="dialog-title"]');
    const description = dialog.querySelector<HTMLElement>('[data-slot="dialog-description"]');

    dialog.showModal();
    await Promise.resolve();

    expect(dialog.open).toBe(true);
    expect(dialog.dataset.state).toBe('open');
    expect(surface?.getAttribute('role')).toBe('dialog');
    expect(surface?.getAttribute('aria-modal')).toBe('true');
    expect(surface?.getAttribute('aria-labelledby')).toBe(title?.id);
    expect(surface?.getAttribute('aria-describedby')).toBe(description?.id);
    expect(document.body.style.overflow).toBe('hidden');
    expect(document.activeElement?.textContent).toBe('Cancel');
  });

  it('closes on Escape and restores focus', async () => {
    const { dialog, trigger } = renderDialog();
    const closeListener = vi.fn<(event: CustomEvent<GnomeDialogCloseDetail>) => void>();
    dialog.addEventListener('gnome-close', closeListener as EventListener);
    dialog.show();
    await Promise.resolve();

    dialog.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));

    expect(dialog.open).toBe(false);
    expect(document.activeElement).toBe(trigger);
    expect(closeListener.mock.calls[0]?.[0].detail).toEqual({ reason: 'escape' });
    expect(document.body.style.overflow).toBe('');
  });

  it('allows consumers to cancel user-initiated closing', async () => {
    const { dialog } = renderDialog();
    dialog.addEventListener('gnome-cancel', (event) => event.preventDefault());
    dialog.show();
    await Promise.resolve();

    dialog.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));

    expect(dialog.open).toBe(true);
  });

  it('only closes from the backdrop when opted in', () => {
    const { dialog } = renderDialog();
    dialog.show();
    dialog.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(dialog.open).toBe(true);

    dialog.setAttribute('close-on-backdrop', '');
    dialog.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(dialog.open).toBe(false);
  });

  it('wraps simple light-DOM content without cloning it', () => {
    const dialog = document.createElement('gnome-dialog');
    const button = document.createElement('button');
    const listener = vi.fn();
    button.addEventListener('click', listener);
    dialog.append(button);
    document.body.append(dialog);

    const surface = dialog.querySelector('[data-slot="dialog-surface"]');
    expect(surface?.firstElementChild).toBe(button);

    button.click();
    expect(listener).toHaveBeenCalledOnce();
  });

  it('restores its open lifecycle when reconnected', () => {
    const { dialog } = renderDialog();
    dialog.show();
    expect(document.body.style.overflow).toBe('hidden');

    dialog.remove();
    expect(document.body.style.overflow).toBe('');

    document.body.append(dialog);
    expect(document.body.style.overflow).toBe('hidden');
  });
});
