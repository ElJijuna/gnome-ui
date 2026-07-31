import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { OverlaySplitView } from './OverlaySplitView';

const originalInnerWidth = window.innerWidth;

function setViewportWidth(width: number) {
  act(() => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: width });
    window.dispatchEvent(new Event('resize'));
  });
}

afterEach(() => {
  setViewportWidth(originalInnerWidth);
});

describe('OverlaySplitView', () => {
  describe('wide layout (> 400px)', () => {
    it('renders sidebar and content side by side with no backdrop', () => {
      setViewportWidth(1024);

      const { container } = render(
        <OverlaySplitView sidebar={<div>Sidebar</div>} content={<div>Content</div>} />,
      );

      expect(screen.getByText('Sidebar')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
      expect(container.querySelector('[aria-hidden="true"]')).not.toBeInTheDocument();
    });

    it('ignores showSidebar on wide screens — sidebar is always visible', () => {
      setViewportWidth(1024);

      render(
        <OverlaySplitView
          showSidebar={false}
          sidebar={<div>Sidebar</div>}
          content={<div>Content</div>}
        />,
      );

      expect(screen.getByText('Sidebar').parentElement).toHaveAttribute('aria-hidden', 'false');
    });

    it('applies a collapsed class when collapsed is true', () => {
      setViewportWidth(1024);

      const { container } = render(
        <OverlaySplitView collapsed sidebar="Sidebar" content="Content" />,
      );

      expect(container.firstElementChild?.className).toMatch(/collapsed/);
    });
  });

  describe('narrow layout (<= 400px)', () => {
    it('hides the sidebar (aria-hidden) when showSidebar is false', () => {
      setViewportWidth(400);

      render(
        <OverlaySplitView
          showSidebar={false}
          sidebar={<div>Sidebar</div>}
          content={<div>Content</div>}
        />,
      );

      expect(screen.getByText('Sidebar').parentElement).toHaveAttribute('aria-hidden', 'true');
    });

    it('reveals the sidebar when showSidebar is true', () => {
      setViewportWidth(400);

      render(
        <OverlaySplitView
          showSidebar
          sidebar={<div>Sidebar</div>}
          content={<div>Content</div>}
        />,
      );

      expect(screen.getByText('Sidebar').parentElement).toHaveAttribute('aria-hidden', 'false');
    });

    it('renders a backdrop', () => {
      setViewportWidth(400);

      const { container } = render(<OverlaySplitView sidebar="Sidebar" content="Content" />);

      expect(container.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThan(0);
    });

    it('calls onClose when the backdrop is clicked', () => {
      setViewportWidth(400);
      const onClose = vi.fn();

      const { container } = render(
        <OverlaySplitView showSidebar onClose={onClose} sidebar="Sidebar" content="Content" />,
      );

      const backdrop = container.querySelector('[aria-hidden="true"]') as HTMLElement;
      fireEvent.click(backdrop);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose on Escape while the overlay is open', () => {
      setViewportWidth(400);
      const onClose = vi.fn();

      render(
        <OverlaySplitView showSidebar onClose={onClose} sidebar="Sidebar" content="Content" />,
      );

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose on Escape while the overlay is closed', () => {
      setViewportWidth(400);
      const onClose = vi.fn();

      render(
        <OverlaySplitView
          showSidebar={false}
          onClose={onClose}
          sidebar="Sidebar"
          content="Content"
        />,
      );

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).not.toHaveBeenCalled();
    });

    it('focuses the first focusable element in the sidebar when opened', () => {
      setViewportWidth(400);

      render(
        <OverlaySplitView
          showSidebar
          sidebar={<button type="button">First</button>}
          content="Content"
        />,
      );

      expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();
    });

    it('calls onClose on a swipe gesture in the close direction', () => {
      setViewportWidth(400);
      const onClose = vi.fn();

      render(
        <OverlaySplitView
          showSidebar
          onClose={onClose}
          sidebar={<div>Sidebar</div>}
          content="Content"
        />,
      );

      const sidebarEl = screen.getByText('Sidebar').parentElement as HTMLElement;

      fireEvent.touchStart(sidebarEl, { touches: [{ clientX: 200 }] });
      fireEvent.touchEnd(sidebarEl, { changedTouches: [{ clientX: 50 }] });

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose on a small swipe below the threshold', () => {
      setViewportWidth(400);
      const onClose = vi.fn();

      render(
        <OverlaySplitView
          showSidebar
          onClose={onClose}
          sidebar={<div>Sidebar</div>}
          content="Content"
        />,
      );

      const sidebarEl = screen.getByText('Sidebar').parentElement as HTMLElement;

      fireEvent.touchStart(sidebarEl, { touches: [{ clientX: 200 }] });
      fireEvent.touchEnd(sidebarEl, { changedTouches: [{ clientX: 180 }] });

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('sidebarPosition', () => {
    it('applies an end-position class when sidebarPosition is "end"', () => {
      const { container } = render(
        <OverlaySplitView sidebarPosition="end" sidebar="Sidebar" content="Content" />,
      );

      expect(container.firstElementChild?.className).toMatch(/end/);
    });
  });

  describe('sidebar width', () => {
    it('drives --sidebar-width from min/max/fraction props', () => {
      const { container } = render(
        <OverlaySplitView
          sidebar="Sidebar"
          content="Content"
          minSidebarWidth={200}
          maxSidebarWidth={300}
          sidebarWidthFraction={0.3}
        />,
      );

      const root = container.firstElementChild as HTMLElement;
      expect(root.style.getPropertyValue('--sidebar-width')).toBe('clamp(200px, 30%, 300px)');
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className', () => {
      const { container } = render(
        <OverlaySplitView sidebar="Sidebar" content="Content" className="custom" />,
      );

      expect(container.firstElementChild).toHaveClass('custom');
    });
  });
});
