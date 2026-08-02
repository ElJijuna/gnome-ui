import { describe, expect, it, vi } from 'vitest';

import { GnomeIconButtonElement } from './icon-button';

function renderIconButton(
  controlMarkup = '<button type="button" data-slot="icon-button-control"><svg></svg></button>',
) {
  const iconButton = document.createElement('gnome-icon-button');
  iconButton.innerHTML = controlMarkup;
  document.body.append(iconButton);

  return {
    iconButton,
    control: iconButton.querySelector<HTMLButtonElement>('[data-slot="icon-button-control"]'),
  };
}

describe('GnomeIconButtonElement', () => {
  it('registers the custom element and exposes normalized defaults', () => {
    const { iconButton, control } = renderIconButton();

    expect(customElements.get('gnome-icon-button')).toBe(GnomeIconButtonElement);
    expect(iconButton.control).toBe(control);
    expect(iconButton.variant).toBe('default');
    expect(iconButton.size).toBe('md');
    expect(iconButton.label).toBe('');
    expect(iconButton.dataset.variant).toBe('default');
    expect(iconButton.dataset.size).toBe('md');
    expect(iconButton.dataset.state).toBe('ready');
  });

  it('reflects variants, sizes, and OSD state', () => {
    const { iconButton } = renderIconButton();

    iconButton.variant = 'suggested';
    iconButton.size = 'lg';
    iconButton.osd = true;

    expect(iconButton.dataset.variant).toBe('suggested');
    expect(iconButton.dataset.size).toBe('lg');
    expect(iconButton.hasAttribute('data-osd')).toBe(true);
  });

  it('syncs label onto the control aria-label and restores it once removed', () => {
    const { iconButton, control } = renderIconButton();

    iconButton.label = 'Copy to clipboard';
    expect(control?.getAttribute('aria-label')).toBe('Copy to clipboard');

    iconButton.label = 'Copied';
    expect(control?.getAttribute('aria-label')).toBe('Copied');

    iconButton.removeAttribute('label');
    expect(control?.hasAttribute('aria-label')).toBe(false);
  });

  it('preserves a consumer-authored aria-label when label is never set', () => {
    const { control } = renderIconButton(
      '<button type="button" data-slot="icon-button-control" aria-label="Close panel"><svg></svg></button>',
    );

    expect(control?.getAttribute('aria-label')).toBe('Close panel');
  });

  it('maps disabled and loading state to the native control', () => {
    const { iconButton, control } = renderIconButton();

    iconButton.loading = true;
    expect(iconButton.dataset.state).toBe('loading');
    expect(iconButton.hasAttribute('data-loading')).toBe(true);
    expect(control?.disabled).toBe(true);
    expect(control?.getAttribute('aria-busy')).toBe('true');

    iconButton.loading = false;
    expect(iconButton.dataset.state).toBe('ready');
    expect(control?.disabled).toBe(false);
    expect(control?.hasAttribute('aria-busy')).toBe(false);

    iconButton.disabled = true;
    expect(iconButton.dataset.state).toBe('disabled');
    expect(iconButton.hasAttribute('data-disabled')).toBe(true);
    expect(control?.disabled).toBe(true);
  });

  it('preserves consumer-owned disabled and aria-busy state', async () => {
    const { iconButton, control } = renderIconButton(
      '<button type="button" data-slot="icon-button-control" disabled aria-busy="false"><svg></svg></button>',
    );

    iconButton.loading = true;
    expect(control?.getAttribute('aria-busy')).toBe('true');

    iconButton.loading = false;
    expect(control?.disabled).toBe(true);
    expect(control?.getAttribute('aria-busy')).toBe('false');

    control?.removeAttribute('disabled');
    await Promise.resolve();
    iconButton.disabled = true;
    iconButton.disabled = false;

    expect(control?.disabled).toBe(false);
  });

  it('proxies focus and click to the native control', () => {
    const { iconButton, control } = renderIconButton();
    const clickListener = vi.fn();

    iconButton.addEventListener('click', clickListener);
    iconButton.focus();
    expect(document.activeElement).toBe(control);

    iconButton.click();
    expect(clickListener).toHaveBeenCalledOnce();
  });

  it('restores and reconnects native state after an htmx-style control swap', async () => {
    const { iconButton, control: original } = renderIconButton();
    iconButton.label = 'Delete';
    iconButton.loading = true;

    const replacement = document.createElement('button');
    replacement.type = 'button';
    replacement.dataset.slot = 'icon-button-control';
    replacement.innerHTML = '<svg></svg>';
    original?.replaceWith(replacement);
    await Promise.resolve();

    expect(original?.disabled).toBe(false);
    expect(original?.hasAttribute('aria-busy')).toBe(false);
    expect(original?.hasAttribute('aria-label')).toBe(false);
    expect(iconButton.control).toBe(replacement);
    expect(replacement.disabled).toBe(true);
    expect(replacement.getAttribute('aria-busy')).toBe('true');
    expect(replacement.getAttribute('aria-label')).toBe('Delete');
  });
});
