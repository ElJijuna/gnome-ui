import { describe, expect, it, vi } from 'vitest';

import {
  type GnomeToastDismissDetail,
  GnomeToastElement,
  type GnomeToastOpenChangeDetail,
} from './toast';

function renderToast(duration = 1000) {
  const toast = document.createElement('gnome-toast');
  toast.duration = duration;
  toast.innerHTML = `
    <span data-slot="toast-title">Saved</span>
    <span data-slot="toast-actions">
      <button type="button" data-action="undo">Undo</button>
      <button type="button" data-dismiss aria-label="Dismiss notification">×</button>
    </span>
  `;
  document.body.append(toast);
  return toast;
}

describe('GnomeToastElement', () => {
  it('registers the custom element', () => {
    expect(customElements.get('gnome-toast')).toBe(GnomeToastElement);
  });

  it('exposes polite live-region semantics', () => {
    const toast = renderToast();
    expect(toast.getAttribute('role')).toBe('status');
    expect(toast.getAttribute('aria-live')).toBe('polite');
    expect(toast.getAttribute('aria-atomic')).toBe('true');
  });

  it('auto-dismisses and reports state changes', () => {
    vi.useFakeTimers();
    const toast = renderToast();
    const dismissListener = vi.fn<(event: CustomEvent<GnomeToastDismissDetail>) => void>();
    const changeListener = vi.fn<(event: CustomEvent<GnomeToastOpenChangeDetail>) => void>();
    toast.addEventListener('gnome-dismiss', dismissListener as EventListener);
    toast.addEventListener('gnome-open-change', changeListener as EventListener);

    toast.show();
    vi.advanceTimersByTime(1000);

    expect(toast.open).toBe(false);
    expect(toast.hidden).toBe(true);
    expect(dismissListener.mock.calls[0]?.[0].detail).toEqual({ reason: 'timeout' });
    expect(changeListener.mock.calls.map(([event]) => event.detail.open)).toEqual([true, false]);
  });

  it('pauses its timer while hovered', () => {
    vi.useFakeTimers();
    const toast = renderToast();
    toast.show();

    vi.advanceTimersByTime(400);
    toast.dispatchEvent(new Event('pointerenter'));
    vi.advanceTimersByTime(1000);
    expect(toast.open).toBe(true);

    toast.dispatchEvent(new Event('pointerleave'));
    vi.advanceTimersByTime(599);
    expect(toast.open).toBe(true);
    vi.advanceTimersByTime(1);
    expect(toast.open).toBe(false);
  });

  it('emits a cancelable action event before dismissing', () => {
    const toast = renderToast(0);
    const action = toast.querySelector<HTMLButtonElement>('[data-action]');
    const preventAction = (event: Event) => event.preventDefault();
    toast.addEventListener('gnome-action', preventAction);
    toast.show();

    action?.click();
    expect(toast.open).toBe(true);

    toast.removeEventListener('gnome-action', preventAction);
    action?.click();
    expect(toast.open).toBe(false);
  });

  it('allows dismissal to be canceled', () => {
    const toast = renderToast(0);
    toast.show();
    toast.addEventListener('gnome-before-dismiss', (event) => event.preventDefault());

    toast.dismiss();

    expect(toast.open).toBe(true);
  });

  it('restarts auto-dismiss when reconnected while open', () => {
    vi.useFakeTimers();
    const toast = renderToast();
    toast.show();
    toast.remove();
    document.body.append(toast);

    vi.advanceTimersByTime(999);
    expect(toast.open).toBe(true);
    vi.advanceTimersByTime(1);
    expect(toast.open).toBe(false);
  });
});
