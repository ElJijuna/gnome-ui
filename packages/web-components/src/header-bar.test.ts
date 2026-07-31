import { describe, expect, it } from 'vitest';

import { GnomeHeaderBarElement } from './header-bar';

function renderHeaderBar(markup: string, attrs: Record<string, string> = {}) {
  const bar = document.createElement('gnome-header-bar');

  for (const [name, value] of Object.entries(attrs)) {
    bar.setAttribute(name, value);
  }

  bar.innerHTML = markup;
  document.body.append(bar);

  return {
    bar,
    end: bar.querySelector<HTMLElement>('[data-slot="header-end"]'),
    start: bar.querySelector<HTMLElement>('[data-slot="header-start"]'),
    title: bar.querySelector<HTMLElement>('[data-slot="header-title"]'),
  };
}

describe('GnomeHeaderBarElement', () => {
  it('registers the custom element and defaults to non-flat', () => {
    const { bar } = renderHeaderBar('<span data-slot="header-title">Inbox</span>');

    expect(customElements.get('gnome-header-bar')).toBe(GnomeHeaderBarElement);
    expect(bar.flat).toBe(false);
  });

  it('renders start/title/end slot content', () => {
    const { end, start, title } = renderHeaderBar(
      '<button data-slot="header-start" type="button">Back</button>' +
        '<span data-slot="header-title">Contacts</span>' +
        '<button data-slot="header-end" type="button">Add</button>',
    );

    expect(start?.textContent).toBe('Back');
    expect(title?.textContent).toBe('Contacts');
    expect(end?.textContent).toBe('Add');
  });

  it('gives the title aria-live=polite', () => {
    const { title } = renderHeaderBar('<span data-slot="header-title">Inbox</span>');

    expect(title?.getAttribute('aria-live')).toBe('polite');
  });

  it('respects a consumer-authored aria-live on the title instead of overwriting it', () => {
    const { title } = renderHeaderBar(
      '<span data-slot="header-title" aria-live="assertive">Inbox</span>',
    );

    expect(title?.getAttribute('aria-live')).toBe('assertive');
  });

  it('applies aria-live to a title swapped in after connection (htmx-style)', async () => {
    const { bar, title } = renderHeaderBar('<span data-slot="header-title">Inbox</span>');

    const replacement = document.createElement('span');
    replacement.dataset.slot = 'header-title';
    replacement.textContent = 'Sent';
    title?.replaceWith(replacement);

    await new Promise((resolve) => queueMicrotask(resolve));

    expect(replacement.getAttribute('aria-live')).toBe('polite');
    expect(bar.querySelector('[data-slot="header-title"]')).toBe(replacement);
  });

  it('does not throw and leaves flat false when there is no title at all', () => {
    const { bar } = renderHeaderBar('<button data-slot="header-start" type="button">Back</button>');

    expect(bar.querySelector('[data-slot="header-title"]')).toBeNull();
  });

  it('reflects the flat property to the attribute', () => {
    const { bar } = renderHeaderBar('<span data-slot="header-title">Inbox</span>');

    bar.flat = true;
    expect(bar.hasAttribute('flat')).toBe(true);

    bar.flat = false;
    expect(bar.hasAttribute('flat')).toBe(false);
  });

  it('stops observing children after being disconnected', async () => {
    const { bar } = renderHeaderBar('');
    bar.remove();

    const title = document.createElement('span');
    title.dataset.slot = 'header-title';
    bar.append(title);

    await new Promise((resolve) => queueMicrotask(resolve));

    expect(title.hasAttribute('aria-live')).toBe(false);
  });
});
