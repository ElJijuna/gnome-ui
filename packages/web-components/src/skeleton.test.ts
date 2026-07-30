import { describe, expect, it } from 'vitest';

import { GnomeSkeletonElement } from './skeleton';

function renderSkeleton(attrs: Record<string, string> = {}) {
  const skeleton = document.createElement('gnome-skeleton');

  for (const [name, value] of Object.entries(attrs)) {
    skeleton.setAttribute(name, value);
  }

  document.body.append(skeleton);

  return skeleton;
}

describe('GnomeSkeletonElement', () => {
  it('registers the custom element and defaults to an animated rect with aria-hidden', () => {
    const skeleton = renderSkeleton();

    expect(customElements.get('gnome-skeleton')).toBe(GnomeSkeletonElement);
    expect(skeleton.getAttribute('aria-hidden')).toBe('true');
    expect(skeleton.dataset.variant).toBe('rect');
    expect(skeleton.hasAttribute('data-animated')).toBe(true);
    expect(skeleton.style.width).toBe('100%');
    expect(skeleton.style.height).toBe('16px');
  });

  it('appends "px" to numeric width/height but leaves other CSS units alone', () => {
    const numeric = renderSkeleton({ height: '20', width: '200' });

    expect(numeric.style.width).toBe('200px');
    expect(numeric.style.height).toBe('20px');

    const withUnits = renderSkeleton({ height: '2em', width: '12rem' });

    expect(withUnits.style.width).toBe('12rem');
    expect(withUnits.style.height).toBe('2em');
  });

  it('sizes a circle from the size attribute instead of width/height', () => {
    const skeleton = renderSkeleton({ size: '48', variant: 'circle' });

    expect(skeleton.dataset.variant).toBe('circle');
    expect(skeleton.style.width).toBe('48px');
    expect(skeleton.style.height).toBe('48px');
  });

  it('renders 3 lines by default for the text variant, with the last one narrowed', () => {
    const skeleton = renderSkeleton({ variant: 'text' });
    const lines = skeleton.querySelectorAll<HTMLSpanElement>('[data-slot="skeleton-line"]');

    expect(lines).toHaveLength(3);
    expect(lines[0].style.getPropertyValue('--gnome-skeleton-line-width')).toBe('');
    expect(lines[2].style.getPropertyValue('--gnome-skeleton-line-width')).toBe('60%');
  });

  it('clamps lines to a minimum of 1 and floors fractional values', () => {
    const zero = renderSkeleton({ lines: '0', variant: 'text' });
    expect(zero.querySelectorAll('[data-slot="skeleton-line"]')).toHaveLength(1);

    const fractional = renderSkeleton({ lines: '2.9', variant: 'text' });
    expect(fractional.querySelectorAll('[data-slot="skeleton-line"]')).toHaveLength(2);
  });

  it('adds or removes line elements when the lines attribute changes', () => {
    const skeleton = renderSkeleton({ lines: '2', variant: 'text' });
    expect(skeleton.querySelectorAll('[data-slot="skeleton-line"]')).toHaveLength(2);

    skeleton.setAttribute('lines', '4');
    expect(skeleton.querySelectorAll('[data-slot="skeleton-line"]')).toHaveLength(4);

    skeleton.setAttribute('lines', '1');
    expect(skeleton.querySelectorAll('[data-slot="skeleton-line"]')).toHaveLength(1);
  });

  it('removes line elements and restores width/height when switching away from text', () => {
    const skeleton = renderSkeleton({ variant: 'text' });
    expect(skeleton.querySelectorAll('[data-slot="skeleton-line"]')).toHaveLength(3);

    skeleton.setAttribute('variant', 'rect');
    expect(skeleton.querySelectorAll('[data-slot="skeleton-line"]')).toHaveLength(0);
    expect(skeleton.style.width).toBe('100%');
    expect(skeleton.style.height).toBe('16px');
  });

  it('disables the animated flag only when explicitly set to "false"', () => {
    const animated = renderSkeleton();
    expect(animated.hasAttribute('data-animated')).toBe(true);

    const disabled = renderSkeleton({ animated: 'false' });
    expect(disabled.hasAttribute('data-animated')).toBe(false);
  });

  it('reflects the animated property to the attribute', () => {
    const skeleton = renderSkeleton();

    skeleton.animated = false;
    expect(skeleton.getAttribute('animated')).toBe('false');
    expect(skeleton.hasAttribute('data-animated')).toBe(false);

    skeleton.animated = true;
    expect(skeleton.hasAttribute('animated')).toBe(false);
    expect(skeleton.hasAttribute('data-animated')).toBe(true);
  });
});
