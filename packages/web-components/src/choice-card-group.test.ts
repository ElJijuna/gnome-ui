import { describe, expect, it, vi } from 'vitest';

import { GnomeChoiceCardGroupElement } from './choice-card-group';

function createCard(
  value: string,
  title: string,
  options: { checked?: boolean; disabled?: boolean } = {},
) {
  const card = document.createElement('button');
  card.type = 'button';
  card.setAttribute('role', 'radio');
  card.dataset.value = value;
  card.setAttribute('aria-checked', String(Boolean(options.checked)));

  if (options.disabled) {
    card.disabled = true;
  }

  const titleEl = document.createElement('span');
  titleEl.dataset.slot = 'choice-card-title';
  titleEl.textContent = title;
  card.append(titleEl);

  return card;
}

function renderGroup(setup?: (el: GnomeChoiceCardGroupElement) => void) {
  const group = document.createElement('gnome-choice-card-group') as GnomeChoiceCardGroupElement;
  const personal = createCard('personal', 'Personal', { checked: true });
  const team = createCard('team', 'Team');
  const enterprise = createCard('enterprise', 'Enterprise', { disabled: true });

  group.append(personal, team, enterprise);
  setup?.(group);
  document.body.append(group);

  return { group, personal, team, enterprise };
}

function fieldset(group: Element) {
  return group.querySelector<HTMLFieldSetElement>('[data-slot="choice-card-group-fieldset"]');
}

describe('GnomeChoiceCardGroupElement', () => {
  it('registers the custom element', () => {
    renderGroup();
    expect(customElements.get('gnome-choice-card-group')).toBe(GnomeChoiceCardGroupElement);
  });

  it('wraps a real <fieldset> with a role=radiogroup grid inside', () => {
    const { group } = renderGroup();
    const fs = fieldset(group);
    expect(fs?.tagName).toBe('FIELDSET');

    const grid = fs?.querySelector('[data-slot="choice-card-group-grid"]');
    expect(grid?.getAttribute('role')).toBe('radiogroup');
  });

  it('moves the original card buttons into the grid', () => {
    const { group, personal, team, enterprise } = renderGroup();
    const grid = fieldset(group)?.querySelector('[data-slot="choice-card-group-grid"]');

    expect(grid?.contains(personal)).toBe(true);
    expect(grid?.contains(team)).toBe(true);
    expect(grid?.contains(enterprise)).toBe(true);
  });

  it('renders the label as a legend and on the radiogroup aria-label', () => {
    const { group } = renderGroup((el) => {
      el.label = 'Account type';
    });

    const legend = fieldset(group)?.querySelector('[data-slot="choice-card-group-legend"]');
    expect(legend?.tagName).toBe('LEGEND');
    expect(legend?.textContent).toBe('Account type');

    const grid = fieldset(group)?.querySelector('[data-slot="choice-card-group-grid"]');
    expect(grid?.getAttribute('aria-label')).toBe('Account type');
  });

  it('injects a decorative radio dot into each card', () => {
    const { personal, team, enterprise } = renderGroup();

    for (const card of [personal, team, enterprise]) {
      const dot = card.querySelector('[data-slot="choice-card-dot"]');
      expect(dot).not.toBeNull();
      expect(dot?.getAttribute('aria-hidden')).toBe('true');
    }
  });

  it('does not duplicate the dot when already present', () => {
    const { personal } = renderGroup();
    const dots = personal.querySelectorAll('[data-slot="choice-card-dot"]');
    expect(dots).toHaveLength(1);
  });

  describe('helper text / error', () => {
    it('renders helper text', () => {
      const { group } = renderGroup((el) => {
        el.helperText = 'You can change this later.';
      });

      const hint = fieldset(group)?.querySelector('[data-slot="choice-card-group-hint"]');
      expect(hint?.textContent).toBe('You can change this later.');
    });

    it('renders error message instead of helper text with role=alert', () => {
      const { group } = renderGroup((el) => {
        el.helperText = 'Helper';
        el.error = 'Choose an option.';
      });

      const hint = fieldset(group)?.querySelector('[data-slot="choice-card-group-hint"]');
      expect(hint?.textContent).toBe('Choose an option.');
      expect(hint?.getAttribute('role')).toBe('alert');
    });

    it('sets aria-describedby on the fieldset when a hint is present', () => {
      const { group } = renderGroup((el) => {
        el.helperText = 'Helper';
      });

      expect(fieldset(group)?.hasAttribute('aria-describedby')).toBe(true);
    });
  });

  describe('disabled', () => {
    it('disables the fieldset', () => {
      const { group } = renderGroup((el) => {
        el.disabled = true;
      });

      expect(fieldset(group)?.disabled).toBe(true);
    });
  });

  describe('roving tabindex', () => {
    it('makes the checked card the only tabbable one', () => {
      const { personal, team, enterprise } = renderGroup();

      expect(personal.tabIndex).toBe(0);
      expect(team.tabIndex).toBe(-1);
      expect(enterprise.tabIndex).toBe(-1);
    });

    it('makes the first enabled card tabbable when none is checked', () => {
      const group = document.createElement(
        'gnome-choice-card-group',
      ) as GnomeChoiceCardGroupElement;
      const a = createCard('a', 'A');
      const b = createCard('b', 'B');
      group.append(a, b);
      document.body.append(group);

      expect(a.tabIndex).toBe(0);
      expect(b.tabIndex).toBe(-1);
    });

    it('updates roving tabindex when aria-checked changes', async () => {
      const { personal, team } = renderGroup();

      personal.setAttribute('aria-checked', 'false');
      team.setAttribute('aria-checked', 'true');
      await Promise.resolve();

      expect(personal.tabIndex).toBe(-1);
      expect(team.tabIndex).toBe(0);
    });
  });

  describe('keyboard navigation', () => {
    it('ArrowRight moves focus and clicks the next enabled card', () => {
      const { personal, team } = renderGroup();
      const listener = vi.fn();
      team.addEventListener('click', listener);

      personal.focus();
      personal.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));

      expect(document.activeElement).toBe(team);
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('skips a disabled card when moving forward, wrapping around', () => {
      const { team, personal } = renderGroup();
      const listener = vi.fn();
      personal.addEventListener('click', listener);

      team.focus();
      team.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));

      // wraps back to "personal", skipping the disabled "enterprise" card
      expect(document.activeElement).toBe(personal);
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('ArrowLeft moves focus to the previous enabled card', () => {
      const { personal, team } = renderGroup();

      team.focus();
      team.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));

      expect(document.activeElement).toBe(personal);
    });

    it('Home/End jump to the first/last enabled card', () => {
      const { personal, team } = renderGroup();

      team.focus();
      team.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
      expect(document.activeElement).toBe(personal);

      personal.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
      expect(document.activeElement).toBe(team);
    });
  });

  it('does not rebuild the fieldset on repeated attribute changes', () => {
    const { group } = renderGroup((el) => {
      el.label = 'Account type';
    });

    const first = fieldset(group);
    group.label = 'Updated';
    expect(fieldset(group)).toBe(first);
  });
});
