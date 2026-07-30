import { describe, expect, it, vi } from 'vitest';

import { GnomeButtonElement } from './button';

function renderButton(
  controlMarkup = '<button type="button" data-slot="button-control">Save</button>',
) {
  const button = document.createElement('gnome-button');
  button.innerHTML = controlMarkup;
  document.body.append(button);

  return {
    button,
    control: button.querySelector<HTMLButtonElement>('[data-slot="button-control"]'),
  };
}

describe('GnomeButtonElement', () => {
  it('registers the custom element and exposes normalized defaults', () => {
    const { button, control } = renderButton();

    expect(customElements.get('gnome-button')).toBe(GnomeButtonElement);
    expect(button.control).toBe(control);
    expect(button.variant).toBe('default');
    expect(button.size).toBe('md');
    expect(button.shape).toBe('default');
    expect(button.dataset.variant).toBe('default');
    expect(button.dataset.size).toBe('md');
    expect(button.dataset.shape).toBe('default');
    expect(button.dataset.state).toBe('ready');
  });

  it('reflects variants, sizes, shapes, and OSD state', () => {
    const { button } = renderButton();

    button.variant = 'suggested';
    button.size = 'lg';
    button.shape = 'pill';
    button.osd = true;

    expect(button.dataset.variant).toBe('suggested');
    expect(button.dataset.size).toBe('lg');
    expect(button.dataset.shape).toBe('pill');
    expect(button.hasAttribute('data-osd')).toBe(true);
  });

  it('maps disabled and loading state to the native control', () => {
    const { button, control } = renderButton();

    button.loading = true;
    expect(button.dataset.state).toBe('loading');
    expect(button.hasAttribute('data-loading')).toBe(true);
    expect(control?.disabled).toBe(true);
    expect(control?.getAttribute('aria-busy')).toBe('true');

    button.loading = false;
    expect(button.dataset.state).toBe('ready');
    expect(control?.disabled).toBe(false);
    expect(control?.hasAttribute('aria-busy')).toBe(false);

    button.disabled = true;
    expect(button.dataset.state).toBe('disabled');
    expect(button.hasAttribute('data-disabled')).toBe(true);
    expect(control?.disabled).toBe(true);
  });

  it('preserves consumer-owned disabled and aria-busy state', async () => {
    const { button, control } = renderButton(
      '<button type="button" data-slot="button-control" disabled aria-busy="false">Save</button>',
    );

    button.loading = true;
    expect(control?.getAttribute('aria-busy')).toBe('true');

    button.loading = false;
    expect(control?.disabled).toBe(true);
    expect(control?.getAttribute('aria-busy')).toBe('false');

    control?.removeAttribute('disabled');
    await Promise.resolve();
    button.disabled = true;
    button.disabled = false;

    expect(control?.disabled).toBe(false);
  });

  it('proxies focus and click while preserving native form submission', () => {
    const form = document.createElement('form');
    const button = document.createElement('gnome-button');
    button.innerHTML = '<button type="submit" data-slot="button-control">Save</button>';
    form.append(button);
    document.body.append(form);

    const submitListener = vi.fn<(event: SubmitEvent) => void>((event) => event.preventDefault());
    const clickListener = vi.fn();
    form.addEventListener('submit', submitListener);
    button.addEventListener('click', clickListener);

    button.focus();
    expect(document.activeElement).toBe(button.control);

    button.click();
    expect(clickListener).toHaveBeenCalledOnce();
    expect(submitListener).toHaveBeenCalledOnce();
  });

  it('restores and reconnects native state after an htmx-style control swap', async () => {
    const { button, control: original } = renderButton();
    button.loading = true;

    const replacement = document.createElement('button');
    replacement.type = 'button';
    replacement.dataset.slot = 'button-control';
    replacement.textContent = 'Updated action';
    original?.replaceWith(replacement);
    await Promise.resolve();

    expect(original?.disabled).toBe(false);
    expect(original?.hasAttribute('aria-busy')).toBe(false);
    expect(button.control).toBe(replacement);
    expect(replacement.disabled).toBe(true);
    expect(replacement.getAttribute('aria-busy')).toBe('true');
  });
});
