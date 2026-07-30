import { describe, expect, it } from 'vitest';

import { GnomeSliderElement } from './slider';

function renderSlider(controlAttrs = 'value="50" min="0" max="100" step="1"') {
  const slider = document.createElement('gnome-slider');
  slider.innerHTML = `
    <input type="range" data-slot="slider-control" aria-label="Brightness" ${controlAttrs} />
  `;
  document.body.append(slider);

  return {
    control: slider.querySelector<HTMLInputElement>('[data-slot="slider-control"]'),
    slider,
  };
}

describe('GnomeSliderElement', () => {
  it('registers the custom element and exposes the current numeric value', () => {
    const { slider, control } = renderSlider();

    expect(customElements.get('gnome-slider')).toBe(GnomeSliderElement);
    expect(slider.control).toBe(control);
    expect(slider.value).toBe(50);
  });

  it('computes the initial --gnome-slider-fill custom property from value/min/max', () => {
    const { slider } = renderSlider('value="25" min="0" max="100" step="1"');

    expect(slider.style.getPropertyValue('--gnome-slider-fill')).toBe('25%');
  });

  it('recomputes the fill percentage on native input events', () => {
    const { slider, control } = renderSlider('value="0" min="0" max="100" step="1"');

    control!.value = '80';
    control?.dispatchEvent(new Event('input', { bubbles: true }));

    expect(slider.style.getPropertyValue('--gnome-slider-fill')).toBe('80%');
  });

  it('setting value through the host property updates the control and the fill', () => {
    const { slider, control } = renderSlider('value="0" min="0" max="200" step="1"');

    slider.value = 150;
    expect(control?.value).toBe('150');
    expect(slider.style.getPropertyValue('--gnome-slider-fill')).toBe('75%');
  });

  it('respects a non-zero min when computing the fill percentage', () => {
    const { slider } = renderSlider('value="30" min="20" max="40" step="1"');

    expect(slider.style.getPropertyValue('--gnome-slider-fill')).toBe('50%');
  });

  it('maps disabled state to the native control', () => {
    const { slider, control } = renderSlider();

    slider.disabled = true;
    expect(slider.hasAttribute('data-disabled')).toBe(true);
    expect(control?.disabled).toBe(true);

    slider.disabled = false;
    expect(slider.hasAttribute('data-disabled')).toBe(false);
    expect(control?.disabled).toBe(false);
  });

  it('preserves consumer-owned disabled state', async () => {
    const { slider, control } = renderSlider('value="50" min="0" max="100" step="1" disabled');

    expect(control?.disabled).toBe(true);

    slider.disabled = true;
    slider.disabled = false;
    expect(control?.disabled).toBe(true);

    control?.removeAttribute('disabled');
    await Promise.resolve();
    slider.disabled = true;
    slider.disabled = false;

    expect(control?.disabled).toBe(false);
  });

  it('proxies focus to the native control', () => {
    const { slider, control } = renderSlider();

    slider.focus();
    expect(document.activeElement).toBe(control);
  });

  it('restores and reconnects native state after an htmx-style control swap', async () => {
    const { slider, control: original } = renderSlider('value="50" min="0" max="100" step="1"');
    slider.disabled = true;

    const replacement = document.createElement('input');
    replacement.type = 'range';
    replacement.dataset.slot = 'slider-control';
    replacement.value = '75';
    replacement.min = '0';
    replacement.max = '100';
    original?.replaceWith(replacement);
    await Promise.resolve();

    expect(original?.disabled).toBe(false);
    expect(slider.control).toBe(replacement);
    expect(replacement.disabled).toBe(true);
    expect(slider.style.getPropertyValue('--gnome-slider-fill')).toBe('75%');
  });
});
