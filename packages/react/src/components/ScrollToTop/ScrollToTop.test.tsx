import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ScrollToTop } from './ScrollToTop';

function setScrollY(value: number) {
  Object.defineProperty(window, 'scrollY', { value, configurable: true });
}

function triggerScroll() {
  act(() => {
    window.dispatchEvent(new Event('scroll'));
  });
}

describe('ScrollToTop', () => {
  beforeEach(() => {
    setScrollY(0);
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });

  describe('rendering', () => {
    it('renders a button with accessible label "Scroll to top"', () => {
      render(<ScrollToTop visible="always" />);
      expect(screen.getByRole('button', { name: 'Scroll to top' })).toBeInTheDocument();
    });

    it('renders a GoUp svg icon inside the button', () => {
      render(<ScrollToTop visible="always" />);
      const button = screen.getByRole('button', { name: 'Scroll to top' });
      expect(button.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('visible="always"', () => {
    it('is in the DOM regardless of scroll position', () => {
      setScrollY(0);
      render(<ScrollToTop visible="always" />);
      expect(screen.getByRole('button', { name: 'Scroll to top' })).toBeInTheDocument();
    });

    it('remains visible after a scroll event', () => {
      render(<ScrollToTop visible="always" />);
      setScrollY(500);
      triggerScroll();
      expect(screen.getByRole('button', { name: 'Scroll to top' })).toBeInTheDocument();
    });
  });

  describe('visible="auto"', () => {
    it('is hidden initially when scrollY is 0', () => {
      render(<ScrollToTop visible="auto" />);
      expect(screen.queryByRole('button', { name: 'Scroll to top' })).not.toBeInTheDocument();
    });

    it('appears after scrolling past the default threshold (300px)', () => {
      render(<ScrollToTop visible="auto" />);
      setScrollY(301);
      triggerScroll();
      expect(screen.getByRole('button', { name: 'Scroll to top' })).toBeInTheDocument();
    });

    it('hides again when scrolling back below the threshold', () => {
      render(<ScrollToTop visible="auto" />);

      setScrollY(301);
      triggerScroll();
      expect(screen.getByRole('button', { name: 'Scroll to top' })).toBeInTheDocument();

      setScrollY(100);
      triggerScroll();
      expect(screen.queryByRole('button', { name: 'Scroll to top' })).not.toBeInTheDocument();
    });

    it('respects a custom threshold', () => {
      render(<ScrollToTop visible="auto" threshold={100} />);

      setScrollY(50);
      triggerScroll();
      expect(screen.queryByRole('button', { name: 'Scroll to top' })).not.toBeInTheDocument();

      setScrollY(101);
      triggerScroll();
      expect(screen.getByRole('button', { name: 'Scroll to top' })).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('calls window.scrollTo({ top: 0, behavior: "smooth" }) on click', async () => {
      render(<ScrollToTop visible="always" />);
      await userEvent.click(screen.getByRole('button', { name: 'Scroll to top' }));
      expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    });
  });

  describe('position', () => {
    it.each([
      'bottom-right',
      'bottom-left',
      'bottom-center',
      'top-right',
      'top-left',
      'top-center',
    ] as const)('applies "%s" position class to root container', (position) => {
      render(<ScrollToTop visible="always" position={position} />);
      const root = screen.getByRole('button', { name: 'Scroll to top' }).parentElement!;
      const expectedClass = position.replace(/-/g, '_');
      expect(root.className).toMatch(new RegExp(expectedClass));
    });
  });

  describe('prop forwarding', () => {
    it('forwards className to root element', () => {
      render(<ScrollToTop visible="always" className="my-custom" />);
      const root = screen.getByRole('button', { name: 'Scroll to top' }).parentElement!;
      expect(root).toHaveClass('my-custom');
    });

    it('forwards style to root element', () => {
      render(<ScrollToTop visible="always" style={{ zIndex: 5000 }} />);
      const root = screen.getByRole('button', { name: 'Scroll to top' }).parentElement!;
      expect(root).toHaveStyle({ zIndex: 5000 });
    });
  });

  describe('cleanup', () => {
    it('removes the scroll listener on unmount', () => {
      const removeSpy = vi.spyOn(window, 'removeEventListener');
      const { unmount } = render(<ScrollToTop visible="auto" />);
      unmount();
      expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    });
  });
});
