import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Overlay } from './Overlay';

beforeEach(() => {
  // jsdom does not implement matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('Overlay', () => {
  describe('rendering', () => {
    it('renders nothing when closed', () => {
      render(
        <Overlay open={false}>
          <div>Content</div>
        </Overlay>,
      );

      expect(screen.queryByText('Content')).toBeNull();
    });

    it('renders children when open', () => {
      render(
        <Overlay open>
          <div>Content</div>
        </Overlay>,
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('renders into document.body by default', () => {
      render(
        <Overlay open>
          <div data-testid="content">Content</div>
        </Overlay>,
      );

      expect(document.body.contains(screen.getByTestId('content'))).toBe(true);
    });

    it('renders into a custom container', () => {
      const customContainer = document.createElement('div');
      document.body.appendChild(customContainer);

      render(
        <Overlay open container={customContainer}>
          <div data-testid="content">Content</div>
        </Overlay>,
      );

      expect(customContainer.contains(screen.getByTestId('content'))).toBe(true);
    });
  });

  describe('dismiss', () => {
    it('clicking the backdrop calls onDismiss', () => {
      const onDismiss = vi.fn();

      render(
        <Overlay open onDismiss={onDismiss}>
          <div>Content</div>
        </Overlay>,
      );

      fireEvent.click(screen.getByText('Content').parentElement as HTMLElement);

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('clicking content inside the overlay does not call onDismiss', () => {
      const onDismiss = vi.fn();

      render(
        <Overlay open onDismiss={onDismiss}>
          <div>Content</div>
        </Overlay>,
      );

      fireEvent.click(screen.getByText('Content'));

      expect(onDismiss).not.toHaveBeenCalled();
    });

    it('does not throw when onDismiss is omitted and the backdrop is clicked', () => {
      render(
        <Overlay open>
          <div>Content</div>
        </Overlay>,
      );

      expect(() =>
        fireEvent.click(screen.getByText('Content').parentElement as HTMLElement),
      ).not.toThrow();
    });
  });

  describe('scroll lock', () => {
    it('locks body scroll while open and restores it on close', () => {
      const { rerender } = render(
        <Overlay open>
          <div>Content</div>
        </Overlay>,
      );

      expect(document.body.style.overflow).toBe('hidden');

      rerender(<Overlay open={false} />);

      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('exit animation', () => {
    it('applies the closing class when open flips to false', () => {
      const { container, rerender } = render(
        <Overlay open>
          <div>Content</div>
        </Overlay>,
      );

      rerender(<Overlay open={false}>Content</Overlay>);

      const backdrop = container.ownerDocument.body.querySelector("[class*='backdrop']");

      // Overlay should still be mounted (exit animation in progress)
      expect(backdrop).toBeInTheDocument();
      expect(backdrop?.className).toMatch(/closing/);
    });

    it('unmounts after the exit animation duration elapses', () => {
      vi.useFakeTimers();

      const { rerender } = render(
        <Overlay open>
          <div>Content</div>
        </Overlay>,
      );

      rerender(<Overlay open={false} />);

      act(() => {
        vi.runAllTimers();
      });

      expect(screen.queryByText('Content')).toBeNull();
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className to the backdrop', () => {
      render(<Overlay open className="custom" />);

      const backdrop = document.body.querySelector("[class*='backdrop']");

      expect(backdrop).toHaveClass('custom');
    });
  });
});
