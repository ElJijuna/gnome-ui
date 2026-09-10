import { describe, expect, it } from 'vitest';

import { GnomeBinElement } from './bin';

function renderBin() {
  const bin = document.createElement('gnome-bin');
  document.body.append(bin);

  return bin;
}

describe('GnomeBinElement', () => {
  it('registers the custom element', () => {
    const bin = renderBin();

    expect(customElements.get('gnome-bin')).toBe(GnomeBinElement);
    expect(bin).toBeInstanceOf(GnomeBinElement);
  });

  it('sets no attributes or role of its own', () => {
    const bin = renderBin();

    expect(bin.attributes).toHaveLength(0);
  });

  it('keeps consumer-authored light-DOM children in place, in order', () => {
    const bin = renderBin();
    bin.innerHTML = '<p>first</p><p>second</p>';

    expect(bin.children).toHaveLength(2);
    expect(bin.children[0].textContent).toBe('first');
    expect(bin.children[1].textContent).toBe('second');
  });

  it('forwards arbitrary attributes set directly on the host', () => {
    const bin = renderBin();
    bin.setAttribute('data-testid', 'wrapper');
    bin.style.maxWidth = '480px';

    expect(bin.getAttribute('data-testid')).toBe('wrapper');
    expect(bin.style.maxWidth).toBe('480px');
  });
});
