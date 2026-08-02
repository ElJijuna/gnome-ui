import { describe, expect, it } from 'vitest';

import { GnomeLevelBarElement } from './level-bar';

function renderLevelBar() {
  const levelBar = document.createElement('gnome-level-bar');
  document.body.append(levelBar);

  return levelBar;
}

describe('GnomeLevelBarElement', () => {
  it('registers the custom element and exposes normalized defaults', () => {
    const levelBar = renderLevelBar();

    expect(customElements.get('gnome-level-bar')).toBe(GnomeLevelBarElement);
    expect(levelBar.getAttribute('role')).toBe('meter');
    expect(levelBar.min).toBe(0);
    expect(levelBar.max).toBe(1);
    expect(levelBar.variant).toBe('accent');
    expect(levelBar.discrete).toBe(false);
    expect(levelBar.numBlocks).toBe(10);
    expect(levelBar.dataset.variant).toBe('accent');
  });

  it('computes aria-value* and the continuous fill custom property', () => {
    const levelBar = renderLevelBar();

    levelBar.min = 0;
    levelBar.max = 200;
    levelBar.value = 50;

    expect(levelBar.getAttribute('aria-valuenow')).toBe('50');
    expect(levelBar.getAttribute('aria-valuemin')).toBe('0');
    expect(levelBar.getAttribute('aria-valuemax')).toBe('200');
    expect(levelBar.style.getPropertyValue('--gnome-level-value')).toBe('25%');
  });

  it('clamps value to the min/max range', () => {
    const levelBar = renderLevelBar();

    levelBar.max = 10;
    levelBar.value = 999;
    expect(levelBar.getAttribute('aria-valuenow')).toBe('10');

    levelBar.value = -50;
    expect(levelBar.getAttribute('aria-valuenow')).toBe('0');
  });

  it('resolves the low/high threshold variant', () => {
    const levelBar = renderLevelBar();

    levelBar.low = 0.2;
    levelBar.high = 0.8;
    levelBar.lowVariant = 'warning';
    levelBar.highVariant = 'error';

    levelBar.value = 0.1;
    expect(levelBar.dataset.variant).toBe('warning');

    levelBar.value = 0.5;
    expect(levelBar.dataset.variant).toBe('accent');

    levelBar.value = 0.9;
    expect(levelBar.dataset.variant).toBe('error');
  });

  it('derives discrete blocks from num-blocks, filling up to the current fraction', () => {
    const levelBar = renderLevelBar();

    levelBar.discrete = true;
    levelBar.numBlocks = 4;
    levelBar.value = 0.5;

    const blocks = levelBar.querySelectorAll('[data-slot="level-block"]');
    expect(blocks).toHaveLength(4);
    expect(Array.from(blocks).map((block) => block.hasAttribute('data-filled'))).toEqual([
      true,
      true,
      false,
      false,
    ]);
  });

  it('removes excess blocks when num-blocks shrinks, and clears blocks when discrete is removed', () => {
    const levelBar = renderLevelBar();

    levelBar.discrete = true;
    levelBar.numBlocks = 5;
    levelBar.value = 1;
    expect(levelBar.querySelectorAll('[data-slot="level-block"]')).toHaveLength(5);

    levelBar.numBlocks = 2;
    expect(levelBar.querySelectorAll('[data-slot="level-block"]')).toHaveLength(2);

    levelBar.discrete = false;
    expect(levelBar.querySelectorAll('[data-slot="level-block"]')).toHaveLength(0);
    expect(levelBar.style.getPropertyValue('--gnome-level-value')).toBe('100%');
  });
});
