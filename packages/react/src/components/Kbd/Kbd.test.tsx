import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Kbd } from './Kbd';

describe('Kbd', () => {
  describe('rendering', () => {
    it('renders a single <kbd> element', () => {
      const { container } = render(<Kbd>A</Kbd>);

      expect(container.querySelectorAll('kbd')).toHaveLength(1);
      expect(container.querySelector('kbd')?.textContent).toBe('A');
    });

    it('leaves unknown key names unchanged', () => {
      const { container } = render(<Kbd>F5</Kbd>);
      expect(container.querySelector('kbd')?.textContent).toBe('F5');
    });
  });

  describe('symbol normalization (symbols=true by default)', () => {
    it.each([
      ['Ctrl', '⌃'],
      ['Control', '⌃'],
      ['Shift', '⇧'],
      ['Alt', '⌥'],
      ['Option', '⌥'],
      ['Super', '⊞'],
      ['Win', '⊞'],
      ['Cmd', '⌘'],
      ['Command', '⌘'],
      ['Meta', '⌘'],
      ['Up', '↑'],
      ['Down', '↓'],
      ['Left', '←'],
      ['Right', '→'],
      ['Enter', '↵'],
      ['Return', '↵'],
      ['Backspace', '⌫'],
      ['Delete', '⌦'],
      ['Escape', '⎋'],
      ['Esc', '⎋'],
      ['Tab', '⇥'],
      ['Space', '␣'],
    ])('%s → %s', (token, symbol) => {
      const { container } = render(<Kbd>{token}</Kbd>);
      expect(container.querySelector('kbd')?.textContent).toBe(symbol);
    });
  });

  describe('symbols=false', () => {
    it('shows the raw key name instead of the symbol', () => {
      const { container } = render(<Kbd symbols={false}>Enter</Kbd>);
      expect(container.querySelector('kbd')?.textContent).toBe('Enter');
    });
  });

  describe('accessibility', () => {
    it('sets aria-label to the semantic key name when a symbol is substituted', () => {
      const { container } = render(<Kbd>Enter</Kbd>);
      expect(container.querySelector('kbd')).toHaveAttribute('aria-label', 'Enter');
    });

    it('omits aria-label when no symbol substitution occurs', () => {
      const { container } = render(<Kbd>A</Kbd>);
      expect(container.querySelector('kbd')).not.toHaveAttribute('aria-label');
    });

    it('omits aria-label when symbols is false', () => {
      const { container } = render(<Kbd symbols={false}>Enter</Kbd>);
      expect(container.querySelector('kbd')).not.toHaveAttribute('aria-label');
    });
  });

  describe('inline usage', () => {
    it('renders inline within surrounding text', () => {
      const { getByText } = render(
        <p>
          Press <Kbd>Enter</Kbd> to continue
        </p>,
      );

      expect(getByText(/Press/)).toBeInTheDocument();
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className', () => {
      const { container } = render(<Kbd className="custom">A</Kbd>);
      expect(container.querySelector('kbd')).toHaveClass('custom');
    });

    it('forwards data attributes', () => {
      const { container } = render(<Kbd data-testid="key-a">A</Kbd>);
      expect(container.querySelector('kbd')).toHaveAttribute('data-testid', 'key-a');
    });
  });
});
