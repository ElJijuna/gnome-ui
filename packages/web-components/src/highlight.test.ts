import { describe, expect, it } from 'vitest';

import { GnomeHighlightElement } from './highlight';

function renderHighlight(text: string, query: string, caseSensitive = false) {
  const highlight = document.createElement('gnome-highlight');
  highlight.text = text;
  highlight.query = query;
  highlight.caseSensitive = caseSensitive;
  document.body.append(highlight);

  return highlight;
}

describe('GnomeHighlightElement', () => {
  it('registers the custom element', () => {
    renderHighlight('hello', '');
    expect(customElements.get('gnome-highlight')).toBe(GnomeHighlightElement);
  });

  it('renders plain text when query is empty', () => {
    const highlight = renderHighlight('The quick brown fox', '');

    expect(highlight.textContent).toBe('The quick brown fox');
    expect(highlight.querySelector('mark')).toBeNull();
  });

  it('wraps a single matching term in <mark>, case-insensitively by default', () => {
    const highlight = renderHighlight('The Quick Brown Fox', 'quick');
    const marks = Array.from(highlight.querySelectorAll('mark'));

    expect(marks).toHaveLength(1);
    expect(marks[0].textContent).toBe('Quick');
    expect(highlight.textContent).toBe('The Quick Brown Fox');
  });

  it('wraps every word of a multi-word query as separate marks', () => {
    const highlight = renderHighlight('The quick brown fox jumps', 'quick fox');
    const marks = Array.from(highlight.querySelectorAll('mark')).map((mark) => mark.textContent);

    expect(marks).toEqual(['quick', 'fox']);
  });

  it('respects case-sensitive matching', () => {
    const insensitive = renderHighlight('Fox fox FOX', 'fox');
    expect(insensitive.querySelectorAll('mark')).toHaveLength(3);

    const sensitive = renderHighlight('Fox fox FOX', 'fox', true);
    const marks = Array.from(sensitive.querySelectorAll('mark'));
    expect(marks).toHaveLength(1);
    expect(marks[0].textContent).toBe('fox');
  });

  it('re-renders when text or query change after connecting', () => {
    const highlight = renderHighlight('alpha beta', 'alpha');
    expect(highlight.querySelectorAll('mark')).toHaveLength(1);

    highlight.query = 'beta';
    const marks = Array.from(highlight.querySelectorAll('mark'));
    expect(marks).toHaveLength(1);
    expect(marks[0].textContent).toBe('beta');

    highlight.text = 'gamma delta';
    highlight.query = 'delta';
    expect(highlight.querySelector('mark')?.textContent).toBe('delta');
  });

  it('ignores whitespace-only or blank query terms', () => {
    const highlight = renderHighlight('hello world', '   ');

    expect(highlight.querySelectorAll('mark')).toHaveLength(0);
    expect(highlight.textContent).toBe('hello world');
  });
});
