import { describe, expect, it, vi } from 'vitest';

import { GnomeRatingStarsElement } from './rating-stars';

function renderRatingStars(setup?: (el: GnomeRatingStarsElement) => void) {
  const el = document.createElement('gnome-rating-stars') as GnomeRatingStarsElement;
  setup?.(el);
  document.body.append(el);

  return el;
}

function stars(el: GnomeRatingStarsElement) {
  return Array.from(el.querySelectorAll<SVGElement>('[data-slot="rating-star"]'));
}

function radios(el: GnomeRatingStarsElement) {
  return Array.from(el.querySelectorAll<HTMLButtonElement>('[data-slot="rating-star-control"]'));
}

describe('GnomeRatingStarsElement', () => {
  it('registers the custom element', () => {
    renderRatingStars();
    expect(customElements.get('gnome-rating-stars')).toBe(GnomeRatingStarsElement);
  });

  describe('read-only mode (readonly attribute)', () => {
    it('renders as role=img', () => {
      const el = renderRatingStars((node) => {
        node.value = 3;
        node.readonly = true;
      });

      expect(el.getAttribute('role')).toBe('img');
    });

    it('generates a default aria-label describing the rating', () => {
      const el = renderRatingStars((node) => {
        node.value = 3;
        node.max = 5;
        node.readonly = true;
      });

      expect(el.getAttribute('aria-label')).toBe('3 out of 5 stars');
    });

    it('accepts a custom aria-label and never overwrites it', () => {
      const el = renderRatingStars((node) => {
        node.setAttribute('aria-label', 'Average rating');
        node.value = 3;
        node.readonly = true;
      });

      expect(el.getAttribute('aria-label')).toBe('Average rating');

      el.value = 4;
      expect(el.getAttribute('aria-label')).toBe('Average rating');
    });

    it('renders max stars, filled up to value', () => {
      const el = renderRatingStars((node) => {
        node.value = 3;
        node.max = 5;
        node.readonly = true;
      });

      expect(stars(el)).toHaveLength(5);
      expect(el.querySelectorAll('[data-slot="rating-star"][data-filled="true"]')).toHaveLength(3);
      expect(el.querySelectorAll('[data-slot="rating-star"][data-filled="false"]')).toHaveLength(2);
    });

    it('renders no interactive elements', () => {
      const el = renderRatingStars((node) => {
        node.value = 3;
        node.readonly = true;
      });

      expect(radios(el)).toHaveLength(0);
    });

    it('clamps a value above max', () => {
      const el = renderRatingStars((node) => {
        node.value = 9;
        node.max = 5;
        node.readonly = true;
      });

      expect(el.value).toBe(5);
      expect(el.getAttribute('aria-label')).toBe('5 out of 5 stars');
    });

    it('clamps a negative value to 0', () => {
      const el = renderRatingStars((node) => {
        node.value = -2;
        node.max = 5;
        node.readonly = true;
      });

      expect(el.value).toBe(0);
      expect(el.getAttribute('aria-label')).toBe('0 out of 5 stars');
    });

    it('renders as read-only when disabled, even alongside a gnome-change listener', () => {
      const el = renderRatingStars((node) => {
        node.value = 3;
        node.disabled = true;
        node.addEventListener('gnome-change', vi.fn());
      });

      expect(el.getAttribute('role')).toBe('img');
      expect(radios(el)).toHaveLength(0);
    });
  });

  describe('interactive mode (readonly absent, not disabled)', () => {
    it('renders as role=radiogroup with role=radio stars', () => {
      const el = renderRatingStars((node) => {
        node.value = 3;
      });

      expect(el.getAttribute('role')).toBe('radiogroup');
      expect(radios(el)).toHaveLength(5);
      expect(radios(el).every((radio) => radio.getAttribute('role') === 'radio')).toBe(true);
    });

    it('defaults the aria-label to "Rating"', () => {
      const el = renderRatingStars((node) => {
        node.value = 3;
      });

      expect(el.getAttribute('aria-label')).toBe('Rating');
    });

    it('marks only the current value as checked', () => {
      const el = renderRatingStars((node) => {
        node.value = 3;
      });

      const [, , third, fourth] = radios(el);
      expect(third.getAttribute('aria-checked')).toBe('true');
      expect(fourth.getAttribute('aria-checked')).toBe('false');
    });

    it('uses singular "star" label for the value 1', () => {
      const el = renderRatingStars((node) => {
        node.value = 0;
      });

      expect(radios(el)[0].getAttribute('aria-label')).toBe('1 star');
      expect(radios(el)[1].getAttribute('aria-label')).toBe('2 stars');
    });

    it('emits gnome-change with the clicked star value', () => {
      const onChange = vi.fn();
      const el = renderRatingStars((node) => {
        node.value = 2;
        node.addEventListener('gnome-change', onChange);
      });

      radios(el)[3].click();

      expect(onChange).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({ detail: { value: 4 } }),
      );
      expect(el.value).toBe(4);
    });

    it('gives only the current-value star tabIndex 0 (roving tabindex)', () => {
      const el = renderRatingStars((node) => {
        node.value = 3;
      });

      expect(radios(el)[2].tabIndex).toBe(0);
      expect(radios(el)[0].tabIndex).toBe(-1);
    });

    it('rolls the roving tabindex onto the first star when value is 0', () => {
      const el = renderRatingStars((node) => {
        node.value = 0;
      });

      expect(radios(el)[0].tabIndex).toBe(0);
    });

    describe('keyboard navigation', () => {
      it('ArrowRight moves focus to and selects the next star', () => {
        const el = renderRatingStars((node) => {
          node.value = 2;
        });

        radios(el)[1].focus();
        radios(el)[1].dispatchEvent(
          new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
        );

        expect(document.activeElement).toBe(radios(el)[2]);
        expect(el.value).toBe(3);
      });

      it('ArrowLeft moves to and selects the previous star', () => {
        const onChange = vi.fn();
        const el = renderRatingStars((node) => {
          node.value = 3;
          node.addEventListener('gnome-change', onChange);
        });

        radios(el)[2].focus();
        radios(el)[2].dispatchEvent(
          new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }),
        );

        expect(onChange).toHaveBeenCalledExactlyOnceWith(
          expect.objectContaining({ detail: { value: 2 } }),
        );
      });

      it('does not go below the first star', () => {
        const onChange = vi.fn();
        const el = renderRatingStars((node) => {
          node.value = 1;
          node.addEventListener('gnome-change', onChange);
        });

        radios(el)[0].focus();
        radios(el)[0].dispatchEvent(
          new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }),
        );

        expect(onChange).not.toHaveBeenCalled();
      });

      it('does not go above the last star', () => {
        const onChange = vi.fn();
        const el = renderRatingStars((node) => {
          node.value = 5;
          node.max = 5;
          node.addEventListener('gnome-change', onChange);
        });

        radios(el)[4].focus();
        radios(el)[4].dispatchEvent(
          new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
        );

        expect(onChange).not.toHaveBeenCalled();
      });

      it('Home jumps to and selects the first star', () => {
        const onChange = vi.fn();
        const el = renderRatingStars((node) => {
          node.value = 4;
          node.addEventListener('gnome-change', onChange);
        });

        radios(el)[3].focus();
        radios(el)[3].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));

        expect(onChange).toHaveBeenCalledExactlyOnceWith(
          expect.objectContaining({ detail: { value: 1 } }),
        );
      });

      it('End jumps to and selects the last star', () => {
        const onChange = vi.fn();
        const el = renderRatingStars((node) => {
          node.value = 2;
          node.max = 5;
          node.addEventListener('gnome-change', onChange);
        });

        radios(el)[1].focus();
        radios(el)[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));

        expect(onChange).toHaveBeenCalledExactlyOnceWith(
          expect.objectContaining({ detail: { value: 5 } }),
        );
      });
    });

    describe('hover preview', () => {
      it('previews the hovered star fill without changing value or emitting gnome-change', () => {
        const onChange = vi.fn();
        const el = renderRatingStars((node) => {
          node.value = 2;
          node.addEventListener('gnome-change', onChange);
        });

        radios(el)[3].dispatchEvent(new MouseEvent('mouseenter'));

        expect(el.querySelectorAll('[data-slot="rating-star"][data-filled="true"]')).toHaveLength(
          4,
        );
        expect(onChange).not.toHaveBeenCalled();
        expect(el.value).toBe(2);
      });

      it('reverts to the actual value when the pointer leaves', () => {
        const el = renderRatingStars((node) => {
          node.value = 2;
        });

        radios(el)[3].dispatchEvent(new MouseEvent('mouseenter'));
        radios(el)[3].dispatchEvent(new MouseEvent('mouseleave'));

        expect(el.querySelectorAll('[data-slot="rating-star"][data-filled="true"]')).toHaveLength(
          2,
        );
      });
    });
  });

  describe('sizes', () => {
    it('forwards the size attribute to the underlying icons', () => {
      const el = renderRatingStars((node) => {
        node.value = 3;
        node.size = 'lg';
      });

      expect(stars(el)[0].getAttribute('width')).toBe('20');
    });
  });

  describe('HTML attribute forwarding', () => {
    it('preserves class in read-only mode', () => {
      const el = renderRatingStars((node) => {
        node.value = 3;
        node.className = 'custom';
      });

      expect(el.className).toBe('custom');
    });

    it('preserves class in interactive mode', () => {
      const el = renderRatingStars((node) => {
        node.value = 3;
        node.className = 'custom';
      });

      expect(el.getAttribute('role')).toBe('radiogroup');
      expect(el.className).toBe('custom');
    });
  });
});
