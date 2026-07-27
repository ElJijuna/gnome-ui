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
    dialog.addEventListener('gnome-close', closeListener);
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

  it('makes content outside the modal inert and restores its previous state', () => {
    const alreadyInert = document.createElement('aside');
    alreadyInert.inert = true;
    document.body.append(alreadyInert);
    const { dialog, trigger } = renderDialog();

    dialog.show();

    expect(trigger.inert).toBe(true);
    expect(alreadyInert.inert).toBe(true);

    dialog.close();

    expect(trigger.inert).toBe(false);
    expect(alreadyInert.inert).toBe(true);
  });

  it('isolates background nodes inserted while the modal is open', async () => {
    const { dialog } = renderDialog();
    dialog.show();
    const lateBackground = document.createElement('button');

    document.body.append(lateBackground);
    await Promise.resolve();

    expect(lateBackground.inert).toBe(true);
  });

  it('keeps only the topmost stacked dialog interactive', async () => {
    const { dialog: firstDialog } = renderDialog();
    firstDialog.show();
    await Promise.resolve();

    const secondDialog = document.createElement('gnome-dialog');
    secondDialog.innerHTML = `
      <section data-slot="dialog-surface">
        <h2 data-slot="dialog-title">Second dialog</h2>
        <button type="button" autofocus>Second action</button>
      </section>
    `;
    document.body.append(secondDialog);
    await Promise.resolve();

    expect(secondDialog.inert).toBe(true);

    secondDialog.show();
    await Promise.resolve();

    expect(firstDialog.inert).toBe(true);
    expect(secondDialog.inert).toBe(false);
    expect(document.activeElement?.textContent).toBe('Second action');

    firstDialog.dispatchEvent(
      new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }),
    );
    expect(firstDialog.open).toBe(true);

    secondDialog.dispatchEvent(
      new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }),
    );

    expect(secondDialog.open).toBe(false);
    expect(firstDialog.inert).toBe(false);
    expect(firstDialog.open).toBe(true);
    expect(document.activeElement?.textContent).toBe('Cancel');
  });

  it('refreshes its surface and accessible relationships after a light-DOM swap', async () => {
    const { dialog } = renderDialog();
    dialog.show();
    const originalSurface = dialog.querySelector<HTMLElement>('[data-slot="dialog-surface"]');
    const replacement = document.createElement('article');
    replacement.dataset.slot = 'dialog-surface';
    replacement.innerHTML = `
      <h2 data-slot="dialog-title">Updated title</h2>
      <p data-slot="dialog-description">Updated description</p>
      <button type="button">Continue</button>
    `;

    originalSurface?.replaceWith(replacement);
    await Promise.resolve();

    const title = replacement.querySelector<HTMLElement>('[data-slot="dialog-title"]');
    const description = replacement.querySelector<HTMLElement>('[data-slot="dialog-description"]');
    expect(replacement.hidden).toBe(false);
    expect(replacement.getAttribute('role')).toBe('dialog');
    expect(replacement.getAttribute('aria-labelledby')).toBe(title?.id);
    expect(replacement.getAttribute('aria-describedby')).toBe(description?.id);
  });

  it('removes stale accessible relationships when dynamic labels disappear', async () => {
    const { dialog } = renderDialog();
    const surface = dialog.querySelector<HTMLElement>('[data-slot="dialog-surface"]');
    dialog.show();

    dialog.querySelector('[data-slot="dialog-title"]')?.remove();
    dialog.querySelector('[data-slot="dialog-description"]')?.remove();
    await Promise.resolve();

    expect(surface?.hasAttribute('aria-labelledby')).toBe(false);
    expect(surface?.hasAttribute('aria-describedby')).toBe(false);
  });
});
