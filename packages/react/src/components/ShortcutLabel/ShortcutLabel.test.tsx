import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ShortcutLabel } from './ShortcutLabel';

describe('ShortcutLabel', () => {
  describe('key rendering', () => {
    it('renders a single key as one <kbd>', () => {
      const { container } = render(<ShortcutLabel shortcut="S" />);

      expect(container.querySelectorAll('kbd')).toHaveLength(1);
      expect(container.querySelector('kbd')?.textContent).toBe('S');
    });

    it('renders multiple keys — one <kbd> per token', () => {
      const { container } = render(<ShortcutLabel shortcut="Ctrl+S" />);

      expect(container.querySelectorAll('kbd')).toHaveLength(2);
    });

    it('renders three tokens for Ctrl+Shift+Z', () => {
      const { container } = render(<ShortcutLabel shortcut="Ctrl+Shift+Z" />);

      expect(container.querySelectorAll('kbd')).toHaveLength(3);
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
      const { container } = render(<ShortcutLabel shortcut={token} />);

      expect(container.querySelector('kbd')?.textContent).toBe(symbol);
    });

    it('leaves unknown tokens unchanged', () => {
      const { container } = render(<ShortcutLabel shortcut="F5" />);

      expect(container.querySelector('kbd')?.textContent).toBe('F5');
    });
  });

  describe('symbols=false', () => {
    it('shows raw token text instead of symbols', () => {
      const { container } = render(<ShortcutLabel shortcut="Ctrl+S" symbols={false} />);
      const keys = container.querySelectorAll('kbd');

      expect(keys[0].textContent).toBe('Ctrl');
      expect(keys[1].textContent).toBe('S');
    });
  });

  describe('accessibility', () => {
    it('sets aria-label to the full shortcut string', () => {
      const { container } = render(<ShortcutLabel shortcut="Ctrl+Shift+Z" />);

      expect(container.querySelector('span')).toHaveAttribute('aria-label', 'Ctrl+Shift+Z');
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className to the root span', () => {
      const { container } = render(<ShortcutLabel shortcut="S" className="custom" />);

      expect(container.querySelector('span')).toHaveClass('custom');
    });

    it('forwards data attributes', () => {
      const { container } = render(<ShortcutLabel shortcut="S" data-testid="sc" />);

      expect(container.querySelector('span')).toHaveAttribute('data-testid', 'sc');
    });
  });
});
