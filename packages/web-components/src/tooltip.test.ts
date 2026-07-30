import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GnomeTooltipElement } from './tooltip';

function renderTooltip(markup: string, attrs: Record<string, string> = {}) {
  const tooltip = document.createElement('gnome-tooltip');

  for (const [name, value] of Object.entries(attrs)) {
    tooltip.setAttribute(name, value);
  }

  tooltip.innerHTML = markup;
  document.body.append(tooltip);

  return {
    content: tooltip.querySelector<HTMLElement>('[data-slot="tooltip-content"]'),
    tooltip,
    trigger: tooltip.querySelector<HTMLElement>('[data-slot="tooltip-trigger"]'),
  };
}

const MARKUP =
  '<button type="button" data-slot="tooltip-trigger">Save</button>' +
  '<span data-slot="tooltip-content">Save file</span>';

describe('GnomeTooltipElement', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('registers the custom element and defaults role=tooltip/placement=top/delay=500', () => {
    const { tooltip, content, trigger } = renderTooltip(MARKUP);

    expect(customElements.get('gnome-tooltip')).toBe(GnomeTooltipElement);
    expect(content?.getAttribute('role')).toBe('tooltip');
    expect(tooltip.placement).toBe('top');
    expect(tooltip.delay).toBe(500);
    expect(trigger?.getAttribute('aria-describedby')).toBe(content?.id);
    expect(tooltip.dataset.state).toBe('closed');
  });

  it('wires aria-describedby from the trigger to the content id', () => {
    const { content, trigger } = renderTooltip(MARKUP);

    expect(content?.id).toBeTruthy();
    expect(trigger?.getAttribute('aria-describedby')).toBe(content?.id);
  });

  it('respects a consumer-authored aria-describedby instead of overwriting it', () => {
    const { trigger } = renderTooltip(
      '<button type="button" data-slot="tooltip-trigger" aria-describedby="external-hint">Save</button>' +
        '<span data-slot="tooltip-content">Save file</span>',
    );

    expect(trigger?.getAttribute('aria-describedby')).toBe('external-hint');
  });

  it('shows after the default 500ms delay on mouseenter and hides immediately on mouseleave', () => {
    const { tooltip, content, trigger } = renderTooltip(MARKUP);

    trigger?.dispatchEvent(new MouseEvent('mouseenter'));
    expect(tooltip.dataset.state).toBe('closed');

    vi.advanceTimersByTime(499);
    expect(tooltip.dataset.state).toBe('closed');

    vi.advanceTimersByTime(1);
    expect(tooltip.dataset.state).toBe('open');
    expect(content?.dataset.state).toBe('open');

    trigger?.dispatchEvent(new MouseEvent('mouseleave'));
    expect(tooltip.dataset.state).toBe('closed');
    expect(content?.dataset.state).toBe('closed');
  });

  it('shows instantly when delay="0"', () => {
    const { tooltip, trigger } = renderTooltip(MARKUP, { delay: '0' });

    trigger?.dispatchEvent(new MouseEvent('mouseenter'));
    expect(tooltip.dataset.state).toBe('open');
  });

  it('cancels a pending show timer if the pointer leaves before the delay elapses', () => {
    const { tooltip, trigger } = renderTooltip(MARKUP);

    trigger?.dispatchEvent(new MouseEvent('mouseenter'));
    vi.advanceTimersByTime(200);
    trigger?.dispatchEvent(new MouseEvent('mouseleave'));
    vi.advanceTimersByTime(500);

    expect(tooltip.dataset.state).toBe('closed');
  });

  it('shows on trigger focus and hides on blur', () => {
    const { tooltip, trigger } = renderTooltip(MARKUP, { delay: '0' });

    trigger?.dispatchEvent(new FocusEvent('focus'));
    expect(tooltip.dataset.state).toBe('open');

    trigger?.dispatchEvent(new FocusEvent('blur'));
    expect(tooltip.dataset.state).toBe('closed');
  });

  it('hides on Escape while visible', () => {
    const { tooltip, trigger } = renderTooltip(MARKUP, { delay: '0' });

    trigger?.dispatchEvent(new MouseEvent('mouseenter'));
    expect(tooltip.dataset.state).toBe('open');

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(tooltip.dataset.state).toBe('closed');
  });

  it('sets data-placement from the placement attribute once shown', () => {
    const { content, trigger } = renderTooltip(MARKUP, {
      delay: '0',
      placement: 'right',
    });

    trigger?.dispatchEvent(new MouseEvent('mouseenter'));
    expect(content?.dataset.placement).toBe('right');
  });

  it('show()/hide() work programmatically without a hover/focus event', () => {
    const { tooltip } = renderTooltip(MARKUP);

    tooltip.show();
    expect(tooltip.dataset.state).toBe('open');

    tooltip.hide();
    expect(tooltip.dataset.state).toBe('closed');
  });

  it('reflects placement/delay properties to attributes', () => {
    const { tooltip } = renderTooltip(MARKUP);

    tooltip.placement = 'bottom';
    expect(tooltip.getAttribute('placement')).toBe('bottom');

    tooltip.delay = 1200;
    expect(tooltip.getAttribute('delay')).toBe('1200');
  });

  it('falls back to defaults for invalid placement/delay attribute values', () => {
    const { tooltip } = renderTooltip(MARKUP, { delay: '-50', placement: 'diagonal' });

    expect(tooltip.placement).toBe('top');
    expect(tooltip.delay).toBe(500);
  });

  it('does nothing when there is no matching trigger/content pair', () => {
    const { tooltip } = renderTooltip('<span>Just text</span>');

    expect(() => tooltip.show()).not.toThrow();
    expect(tooltip.dataset.state).toBe('closed');
  });
});
