import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Portal } from './Portal';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Portal', () => {
  describe('default container', () => {
    it('renders children into document.body', () => {
      render(<Portal>Hello from a portal</Portal>);
      expect(screen.getByText('Hello from a portal')).toBeInTheDocument();
    });

    it('renders children outside of the local render container', () => {
      const { container } = render(<Portal>Hello from a portal</Portal>);
      expect(container).not.toContainElement(screen.getByText('Hello from a portal'));
    });

    it('renders children as a direct child of document.body', () => {
      render(<Portal>Hello from a portal</Portal>);
      expect(document.body).toContainElement(screen.getByText('Hello from a portal'));
    });
  });

  describe('custom container', () => {
    it('renders children into the provided container instead of document.body', () => {
      const target = document.createElement('div');
      target.setAttribute('data-testid', 'custom-target');
      document.body.appendChild(target);

      render(<Portal container={target}>Custom target content</Portal>);

      expect(target).toContainElement(screen.getByText('Custom target content'));

      document.body.removeChild(target);
    });
  });

  describe('SSR', () => {
    it('renders children inline instead of portaling when document is unavailable', () => {
      vi.stubGlobal('document', undefined);

      const result = Portal({ children: 'Server-rendered content' });

      expect(result).toBe('Server-rendered content');
    });
  });
});
