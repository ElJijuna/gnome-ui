import { describe, expect, it, vi } from 'vitest';

import {
  computePopoverPosition,
  type GnomePopoverCloseDetail,
  GnomePopoverElement,
} from './popover';

function renderPopover() {
  const popover = document.createElement('gnome-popover');
  popover.innerHTML = `
    <button type="button" data-slot="popover-trigger">Options</button>
    <section data-slot="popover-content">
      <button type="button">First action</button>
    </section>
  `;
  document.body.append(popover);

  const trigger = popover.querySelector<HTMLElement>('[data-slot="popover-trigger"]');
  const content = popover.querySelector<HTMLElement>('[data-slot="popover-content"]');

  return { content, popover, trigger };
}

describe('GnomePopoverElement', () => {
  it('registers the custom element', () => {
    expect(customElements.get('gnome-popover')).toBe(GnomePopoverElement);
  });

  it('opens from its trigger and wires accessible relationships', async () => {
    const { content, popover, trigger } = renderPopover();

    trigger?.click();
    await Promise.resolve();

    expect(popover.open).toBe(true);
    expect(trigger?.getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger?.getAttribute('aria-expanded')).toBe('true');
    expect(trigger?.getAttribute('aria-controls')).toBe(content?.id);
    expect(content?.getAttribute('role')).toBe('dialog');
    expect(content?.getAttribute('aria-labelledby')).toBe(trigger?.id);
    expect(content?.hidden).toBe(false);
    expect(document.activeElement?.textContent).toBe('First action');
  });

  it('closes on Escape and restores trigger focus', async () => {
    const { content, popover, trigger } = renderPopover();
    const closeListener = vi.fn<(event: CustomEvent<GnomePopoverCloseDetail>) => void>();
    popover.addEventListener('gnome-close', closeListener as EventListener);
    trigger?.click();
    await Promise.resolve();

    content?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));

    expect(popover.open).toBe(false);
    expect(document.activeElement).toBe(trigger);
    expect(closeListener.mock.calls[0]?.[0].detail).toEqual({ reason: 'escape' });
  });

  it('closes on an outside pointer and allows canceling it', () => {
    const { popover } = renderPopover();
    popover.show();
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    expect(popover.open).toBe(false);

    popover.show();
    popover.addEventListener('gnome-cancel', (event) => event.preventDefault(), {
      once: true,
    });
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    expect(popover.open).toBe(true);
  });

  it('flips and clamps content to the viewport', () => {
    const trigger = new DOMRect(90, 90, 20, 10);
    const content = new DOMRect(0, 0, 80, 60);
    const position = computePopoverPosition(trigger, content, 'bottom', {
      height: 120,
      width: 120,
    });

    expect(position.placement).toBe('top');
    expect(position.left).toBeGreaterThanOrEqual(8);
    expect(position.left + content.width).toBeLessThanOrEqual(112);
  });

  it('restores outside-pointer handling when reconnected while open', () => {
    const { popover } = renderPopover();
    popover.show();
    popover.remove();
    document.body.append(popover);

    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));

    expect(popover.open).toBe(false);
  });
});
