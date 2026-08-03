import { describe, expect, it, vi } from 'vitest';

import {
  type GnomeOtpInputChangeDetail,
  type GnomeOtpInputCompleteDetail,
  GnomeOtpInputElement,
} from './otp-input';

function renderOtpInput(setup?: (el: GnomeOtpInputElement) => void) {
  const otp = document.createElement('gnome-otp-input') as GnomeOtpInputElement;
  setup?.(otp);
  document.body.append(otp);

  return otp;
}

function cells(otp: GnomeOtpInputElement) {
  return Array.from(otp.querySelectorAll<HTMLInputElement>('[data-slot="otp-input-cell"]'));
}

function type(cell: HTMLInputElement, value: string) {
  cell.value = value;
  cell.dispatchEvent(new Event('input', { bubbles: true }));
}

function paste(cell: HTMLInputElement, text: string) {
  const event = new Event('paste', { bubbles: true, cancelable: true }) as ClipboardEvent;
  Object.defineProperty(event, 'clipboardData', {
    value: { getData: () => text },
  });
  cell.dispatchEvent(event);
}

describe('GnomeOtpInputElement', () => {
  it('registers the custom element', () => {
    renderOtpInput();
    expect(customElements.get('gnome-otp-input')).toBe(GnomeOtpInputElement);
  });

  describe('rendering', () => {
    it('renders 6 cells by default', () => {
      const otp = renderOtpInput();
      expect(cells(otp)).toHaveLength(6);
    });

    it('renders a custom number of cells', () => {
      const otp = renderOtpInput((el) => {
        el.length = 4;
      });
      expect(cells(otp)).toHaveLength(4);
    });

    it('pre-fills cells from the value property', () => {
      const otp = renderOtpInput((el) => {
        el.value = '123';
      });
      const c = cells(otp);

      expect(c[0].value).toBe('1');
      expect(c[1].value).toBe('2');
      expect(c[2].value).toBe('3');
      expect(c[3].value).toBe('');
    });

    it('labels each cell with its position', () => {
      const otp = renderOtpInput((el) => {
        el.length = 4;
      });
      const c = cells(otp);

      expect(c[0].getAttribute('aria-label')).toBe('Digit 1 of 4');
      expect(c[3].getAttribute('aria-label')).toBe('Digit 4 of 4');
    });

    it('renders the label as a legend', () => {
      const otp = renderOtpInput((el) => {
        el.label = 'Verification code';
      });
      const legend = otp.querySelector('[data-slot="otp-input-legend"]');

      expect(legend?.tagName).toBe('LEGEND');
      expect(legend?.textContent).toBe('Verification code');
    });

    it('renders helper text', () => {
      const otp = renderOtpInput((el) => {
        el.helperText = 'Check your email.';
      });
      expect(otp.querySelector('[data-slot="otp-input-hint"]')?.textContent).toBe(
        'Check your email.',
      );
    });

    it('renders error message instead of helper text', () => {
      const otp = renderOtpInput((el) => {
        el.helperText = 'Helper';
        el.error = 'Invalid code.';
      });
      expect(otp.querySelector('[data-slot="otp-input-hint"]')?.textContent).toBe('Invalid code.');
    });
  });

  describe('typing', () => {
    it('calls gnome-change with the digit placed at the correct position', () => {
      const otp = renderOtpInput((el) => {
        el.length = 4;
      });
      const listener = vi.fn<(event: CustomEvent<GnomeOtpInputChangeDetail>) => void>();
      otp.addEventListener('gnome-change', listener);

      type(cells(otp)[0], '5');

      expect(listener.mock.calls[0]?.[0].detail).toEqual({ value: '5' });
    });

    it('auto-advances focus to the next cell after typing a digit', () => {
      const otp = renderOtpInput((el) => {
        el.length = 4;
      });
      const c = cells(otp);

      type(c[0], '5');

      expect(document.activeElement).toBe(c[1]);
    });

    it('does not advance focus past the last cell', () => {
      const otp = renderOtpInput((el) => {
        el.length = 3;
        el.value = '12';
      });
      const c = cells(otp);

      c[2].focus();
      type(c[2], '3');

      expect(document.activeElement).toBe(c[2]);
    });

    it('strips non-digit characters', () => {
      const otp = renderOtpInput((el) => {
        el.length = 4;
      });
      const listener = vi.fn<(event: CustomEvent<GnomeOtpInputChangeDetail>) => void>();
      otp.addEventListener('gnome-change', listener);

      type(cells(otp)[0], 'a');

      expect(listener).not.toHaveBeenCalled();
    });

    it('fills a middle cell when typed into directly, preserving other cells', () => {
      const otp = renderOtpInput((el) => {
        el.length = 4;
        el.value = '1_3';
      });
      const listener = vi.fn<(event: CustomEvent<GnomeOtpInputChangeDetail>) => void>();
      otp.addEventListener('gnome-change', listener);

      type(cells(otp)[1], '2');

      expect(listener.mock.calls[0]?.[0].detail).toEqual({ value: '123' });
    });
  });

  describe('gnome-complete', () => {
    it('fires once the value reaches the configured length', () => {
      const otp = renderOtpInput((el) => {
        el.length = 6;
        el.value = '12345';
      });
      const listener = vi.fn<(event: CustomEvent<GnomeOtpInputCompleteDetail>) => void>();
      otp.addEventListener('gnome-complete', listener);

      otp.value = '123456';

      expect(listener).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({ detail: { value: '123456' } }),
      );
    });

    it('does not fire when the value is below length', () => {
      const otp = renderOtpInput((el) => {
        el.length = 6;
      });
      const listener = vi.fn();
      otp.addEventListener('gnome-complete', listener);

      otp.value = '123';

      expect(listener).not.toHaveBeenCalled();
    });

    it('does not fire again when re-set to the same complete value', () => {
      const otp = renderOtpInput((el) => {
        el.length = 6;
        el.value = '123456';
      });
      const listener = vi.fn();
      otp.addEventListener('gnome-complete', listener);

      otp.value = '123456';

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('backspace', () => {
    it('clears the current cell if it has a value', () => {
      const otp = renderOtpInput((el) => {
        el.length = 4;
        el.value = '12';
      });
      const listener = vi.fn<(event: CustomEvent<GnomeOtpInputChangeDetail>) => void>();
      otp.addEventListener('gnome-change', listener);
      const c = cells(otp);

      c[1].focus();
      c[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }));

      expect(listener.mock.calls[0]?.[0].detail).toEqual({ value: '1' });
    });

    it('clears the previous cell and moves focus back when the current cell is empty', () => {
      const otp = renderOtpInput((el) => {
        el.length = 4;
        el.value = '12';
      });
      const listener = vi.fn<(event: CustomEvent<GnomeOtpInputChangeDetail>) => void>();
      otp.addEventListener('gnome-change', listener);
      const c = cells(otp);

      c[2].focus();
      c[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }));

      expect(listener.mock.calls[0]?.[0].detail).toEqual({ value: '1' });
      expect(document.activeElement).toBe(c[1]);
    });

    it('does nothing on the first empty cell', () => {
      const otp = renderOtpInput((el) => {
        el.length = 4;
      });
      const listener = vi.fn();
      otp.addEventListener('gnome-change', listener);
      const c = cells(otp);

      c[0].focus();
      c[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }));

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('arrow navigation', () => {
    it('ArrowRight moves focus to the next cell', () => {
      const otp = renderOtpInput((el) => {
        el.length = 4;
      });
      const c = cells(otp);

      c[0].focus();
      c[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));

      expect(document.activeElement).toBe(c[1]);
    });

    it('ArrowLeft moves focus to the previous cell', () => {
      const otp = renderOtpInput((el) => {
        el.length = 4;
      });
      const c = cells(otp);

      c[2].focus();
      c[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));

      expect(document.activeElement).toBe(c[1]);
    });
  });

  describe('paste', () => {
    it('distributes a pasted code across the cells starting at the focused cell', () => {
      const otp = renderOtpInput((el) => {
        el.length = 6;
      });
      const listener = vi.fn<(event: CustomEvent<GnomeOtpInputChangeDetail>) => void>();
      otp.addEventListener('gnome-change', listener);

      paste(cells(otp)[0], '123456');

      expect(listener.mock.calls[0]?.[0].detail).toEqual({ value: '123456' });
    });

    it('truncates a pasted code that is longer than the remaining cells', () => {
      const otp = renderOtpInput((el) => {
        el.length = 4;
        el.value = '1';
      });
      const listener = vi.fn<(event: CustomEvent<GnomeOtpInputChangeDetail>) => void>();
      otp.addEventListener('gnome-change', listener);

      paste(cells(otp)[1], '23456789');

      expect(listener.mock.calls[0]?.[0].detail).toEqual({ value: '1234' });
    });

    it('ignores a paste with no digits', () => {
      const otp = renderOtpInput((el) => {
        el.length = 4;
      });
      const listener = vi.fn();
      otp.addEventListener('gnome-change', listener);

      paste(cells(otp)[0], 'abc');

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('masked', () => {
    it('renders text cells by default', () => {
      const otp = renderOtpInput();
      expect(cells(otp).every((c) => c.type === 'text')).toBe(true);
    });

    it('renders password-type cells when masked', () => {
      const otp = renderOtpInput((el) => {
        el.masked = true;
      });
      expect(cells(otp).every((c) => c.type === 'password')).toBe(true);
    });
  });

  describe('disabled', () => {
    it('disables every cell', () => {
      const otp = renderOtpInput((el) => {
        el.disabled = true;
      });
      expect(cells(otp).every((c) => c.disabled)).toBe(true);
    });
  });

  describe('accessibility', () => {
    it('sets aria-invalid on cells when error is present', () => {
      const otp = renderOtpInput((el) => {
        el.error = 'Invalid code.';
      });
      expect(cells(otp).every((c) => c.getAttribute('aria-invalid') === 'true')).toBe(true);
    });

    it('sets aria-describedby on the fieldset when helperText is present', () => {
      const otp = renderOtpInput((el) => {
        el.helperText = 'Check your email.';
      });
      expect(
        otp.querySelector('[data-slot="otp-input-fieldset"]')?.hasAttribute('aria-describedby'),
      ).toBe(true);
    });
  });
});
