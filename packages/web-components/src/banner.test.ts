import { describe, expect, it, vi } from 'vitest';

import { GnomeBannerElement } from './banner';

function renderBanner(markup: string, attrs: Record<string, string> = {}) {
  const banner = document.createElement('gnome-banner');

  for (const [name, value] of Object.entries(attrs)) {
    banner.setAttribute(name, value);
  }

  banner.innerHTML = markup;
  document.body.append(banner);

  return banner;
}

describe('GnomeBannerElement', () => {
  it('registers the custom element and defaults role/aria-live/variant', () => {
    const banner = renderBanner('<span data-slot="banner-message">Message</span>');

    expect(customElements.get('gnome-banner')).toBe(GnomeBannerElement);
    expect(banner.getAttribute('role')).toBe('status');
    expect(banner.getAttribute('aria-live')).toBe('polite');
    expect(banner.variant).toBe('info');
  });

  it('respects a consumer-authored role/aria-live instead of overwriting them', () => {
    const banner = document.createElement('gnome-banner');
    banner.setAttribute('role', 'alert');
    banner.setAttribute('aria-live', 'assertive');
    document.body.append(banner);

    expect(banner.getAttribute('role')).toBe('alert');
    expect(banner.getAttribute('aria-live')).toBe('assertive');
  });

  it('reflects the variant property to the attribute and falls back to info for invalid values', () => {
    const banner = renderBanner('', { variant: 'warning' });
    expect(banner.variant).toBe('warning');

    banner.setAttribute('variant', 'ultraviolet');
    expect(banner.variant).toBe('info');

    banner.variant = 'success';
    expect(banner.getAttribute('variant')).toBe('success');
  });

  it('emits gnome-action (without dismissing) when a data-action control is clicked', () => {
    const banner = renderBanner(
      '<span data-slot="banner-actions"><button type="button" data-action="retry">Retry</button></span>',
    );
    const onAction = vi.fn();
    banner.addEventListener('gnome-action', onAction);

    banner.querySelector<HTMLButtonElement>('[data-action]')?.click();

    expect(onAction).toHaveBeenCalledOnce();
    expect(onAction.mock.calls[0][0].detail).toEqual({ action: 'retry' });
    expect(banner.hidden).toBe(false);
  });

  it('defaults the action name to "default" when data-action has no value', () => {
    const banner = renderBanner(
      '<span data-slot="banner-actions"><button type="button" data-action>Go</button></span>',
    );
    const onAction = vi.fn();
    banner.addEventListener('gnome-action', onAction);

    banner.querySelector<HTMLButtonElement>('[data-action]')?.click();

    expect(onAction.mock.calls[0][0].detail).toEqual({ action: 'default' });
  });

  it('dismisses (hides) the banner when a data-dismiss control is clicked', () => {
    const banner = renderBanner(
      '<span data-slot="banner-actions"><button type="button" data-dismiss>Dismiss</button></span>',
    );
    const onDismiss = vi.fn();
    banner.addEventListener('gnome-dismiss', onDismiss);

    banner.querySelector<HTMLButtonElement>('[data-dismiss]')?.click();

    expect(banner.hidden).toBe(true);
    expect(banner.dataset.state).toBe('dismissed');
    expect(onDismiss).toHaveBeenCalledOnce();
    expect(onDismiss.mock.calls[0][0].detail).toEqual({ reason: 'dismiss' });
  });

  it('allows gnome-before-dismiss to veto the dismissal', () => {
    const banner = renderBanner(
      '<span data-slot="banner-actions"><button type="button" data-dismiss>Dismiss</button></span>',
    );
    banner.addEventListener('gnome-before-dismiss', (event) => {
      event.preventDefault();
    });
    const onDismiss = vi.fn();
    banner.addEventListener('gnome-dismiss', onDismiss);

    banner.querySelector<HTMLButtonElement>('[data-dismiss]')?.click();

    expect(banner.hidden).toBe(false);
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('dismiss() is a no-op when already hidden', () => {
    const banner = renderBanner('');
    banner.hidden = true;

    const onBeforeDismiss = vi.fn();
    banner.addEventListener('gnome-before-dismiss', onBeforeDismiss);

    banner.dismiss();

    expect(onBeforeDismiss).not.toHaveBeenCalled();
  });

  it('dismiss() defaults to a "programmatic" reason', () => {
    const banner = renderBanner('');
    const onDismiss = vi.fn();
    banner.addEventListener('gnome-dismiss', onDismiss);

    banner.dismiss();

    expect(onDismiss.mock.calls[0][0].detail).toEqual({ reason: 'programmatic' });
  });

  it('ignores clicks outside of data-action/data-dismiss controls', () => {
    const banner = renderBanner('<span data-slot="banner-message">Message</span>');
    const onAction = vi.fn();
    const onDismiss = vi.fn();
    banner.addEventListener('gnome-action', onAction);
    banner.addEventListener('gnome-dismiss', onDismiss);

    banner
      .querySelector('[data-slot="banner-message"]')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(onAction).not.toHaveBeenCalled();
    expect(onDismiss).not.toHaveBeenCalled();
  });
});
