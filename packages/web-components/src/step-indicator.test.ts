import { describe, expect, it, vi } from 'vitest';

import { GnomeStepIndicatorElement, type GnomeStepIndicatorSelectDetail } from './step-indicator';

function renderStepIndicator() {
  const stepIndicator = document.createElement('gnome-step-indicator');
  document.body.append(stepIndicator);

  return stepIndicator;
}

describe('GnomeStepIndicatorElement', () => {
  it('registers the custom element and defaults role/label', () => {
    const stepIndicator = renderStepIndicator();

    expect(customElements.get('gnome-step-indicator')).toBe(GnomeStepIndicatorElement);
    expect(stepIndicator.getAttribute('role')).toBe('navigation');
    expect(stepIndicator.getAttribute('aria-label')).toBe('Progress');
  });

  it('renders an unlabelled sequence with a caption when steps is a plain count', () => {
    const stepIndicator = renderStepIndicator();
    stepIndicator.setAttribute('steps', '4');
    stepIndicator.current = 1;

    const caption = stepIndicator.querySelector('[data-slot="step-indicator-caption"]');
    expect(caption?.textContent).toBe('Step 2 of 4');

    const items = stepIndicator.querySelectorAll('[data-slot="step-item"]');
    expect(items).toHaveLength(4);
    expect(items[0].hasAttribute('data-completed')).toBe(true);
    expect(items[1].hasAttribute('data-current')).toBe(true);
    expect(items[2].hasAttribute('data-completed')).toBe(false);
  });

  it('renders labelled steps from a comma-separated list, without a caption', () => {
    const stepIndicator = renderStepIndicator();
    stepIndicator.setAttribute('steps', 'Account, Profile, Confirm');
    stepIndicator.current = 0;

    expect(stepIndicator.querySelector('[data-slot="step-indicator-caption"]')).toBeNull();

    const labels = Array.from(stepIndicator.querySelectorAll('[data-slot="step-label"]')).map(
      (el) => el.textContent,
    );
    expect(labels).toEqual(['Account', 'Profile', 'Confirm']);
  });

  it('shows a checkmark (no number text) for completed steps, a number for the rest', () => {
    const stepIndicator = renderStepIndicator();
    stepIndicator.setAttribute('steps', '3');
    stepIndicator.current = 2;

    const circles = stepIndicator.querySelectorAll('[data-slot="step-circle"]');
    expect(circles[0].textContent).toBe('');
    expect(circles[1].textContent).toBe('');
    expect(circles[2].textContent).toBe('3');
  });

  it('clamps current to the valid step range', () => {
    const stepIndicator = renderStepIndicator();
    stepIndicator.setAttribute('steps', '3');

    stepIndicator.current = 99;
    expect(stepIndicator.current).toBe(2);

    stepIndicator.current = -5;
    expect(stepIndicator.current).toBe(0);
  });

  it('renders plain spans (not buttons) for completed steps when clickable is unset', () => {
    const stepIndicator = renderStepIndicator();
    stepIndicator.setAttribute('steps', '3');
    stepIndicator.current = 2;

    const circles = stepIndicator.querySelectorAll('[data-slot="step-circle"]');
    expect(circles[0].tagName).toBe('SPAN');
  });

  it('renders completed steps as buttons and emits gnome-select on click when clickable', () => {
    const stepIndicator = renderStepIndicator();
    stepIndicator.setAttribute('steps', '3');
    stepIndicator.current = 2;
    stepIndicator.clickable = true;

    const listener = vi.fn<(event: CustomEvent<GnomeStepIndicatorSelectDetail>) => void>();
    stepIndicator.addEventListener('gnome-select', listener);

    const circles = stepIndicator.querySelectorAll<HTMLElement>('[data-slot="step-circle"]');
    expect(circles[0].tagName).toBe('BUTTON');
    expect(circles[2].tagName).toBe('SPAN');

    circles[0].click();
    expect(listener.mock.calls[0]?.[0].detail).toEqual({ step: 0 });
  });

  it('never makes the current or upcoming steps clickable', () => {
    const stepIndicator = renderStepIndicator();
    stepIndicator.setAttribute('steps', '3');
    stepIndicator.current = 1;
    stepIndicator.clickable = true;

    const listener = vi.fn();
    stepIndicator.addEventListener('gnome-select', listener);

    const circles = stepIndicator.querySelectorAll<HTMLElement>('[data-slot="step-circle"]');
    expect(circles[1].tagName).toBe('SPAN');
    expect(circles[2].tagName).toBe('SPAN');
  });
});
