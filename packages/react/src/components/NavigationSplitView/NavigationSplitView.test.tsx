import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { NavigationSplitView } from './NavigationSplitView';

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

describe('NavigationSplitView', () => {
  describe('wide layout (> 400px)', () => {
    it('renders both sidebar and content panes visible', () => {
      setViewportWidth(1024);

      render(
        <NavigationSplitView sidebar={<div>Sidebar pane</div>} content={<div>Content pane</div>} />,
      );

      expect(screen.getByText('Sidebar pane')).toBeInTheDocument();
      expect(screen.getByText('Content pane')).toBeInTheDocument();
      expect(screen.getByText('Sidebar pane').parentElement).toHaveAttribute(
        'aria-hidden',
        'false',
      );
      expect(screen.getByText('Content pane').parentElement).toHaveAttribute(
        'aria-hidden',
        'false',
      );
    });

    it('renders an empty divider element between the panes', () => {
      setViewportWidth(1024);

      const { container } = render(<NavigationSplitView sidebar="Sidebar" content="Content" />);

      const divider = Array.from(container.querySelectorAll('[aria-hidden="true"]')).find(
        (el) => el.textContent === '',
      );

      expect(divider).toBeInTheDocument();
    });

    it('ignores showContent on wide screens — both panes stay visible', () => {
      setViewportWidth(1024);

      render(
        <NavigationSplitView
          showContent
          sidebar={<div>Sidebar pane</div>}
          content={<div>Content pane</div>}
        />,
      );

      expect(screen.getByText('Sidebar pane').parentElement).not.toHaveAttribute(
        'aria-hidden',
        'true',
      );
    });
  });

  describe('narrow layout (<= 400px)', () => {
    it('shows the sidebar and hides content when showContent is false', () => {
      setViewportWidth(400);

      render(
        <NavigationSplitView
          showContent={false}
          sidebar={<div>Sidebar pane</div>}
          content={<div>Content pane</div>}
        />,
      );

      expect(screen.getByText('Sidebar pane').parentElement).toHaveAttribute(
        'aria-hidden',
        'false',
      );
      expect(screen.getByText('Content pane').parentElement).toHaveAttribute('aria-hidden', 'true');
    });

    it('shows the content and hides the sidebar when showContent is true', () => {
      setViewportWidth(400);

      render(
        <NavigationSplitView
          showContent
          sidebar={<div>Sidebar pane</div>}
          content={<div>Content pane</div>}
        />,
      );

      expect(screen.getByText('Sidebar pane').parentElement).toHaveAttribute('aria-hidden', 'true');
      expect(screen.getByText('Content pane').parentElement).toHaveAttribute(
        'aria-hidden',
        'false',
      );
    });

    it('omits the divider', () => {
      setViewportWidth(400);

      const { container } = render(<NavigationSplitView sidebar="Sidebar" content="Content" />);

      const divider = Array.from(container.querySelectorAll('[aria-hidden="true"]')).find(
        (el) => el.textContent === '',
      );

      expect(divider).toBeUndefined();
    });
  });

  describe('sidebar width', () => {
    it('drives --sidebar-width from min/max/fraction props', () => {
      setViewportWidth(1024);

      const { container } = render(
        <NavigationSplitView
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
        <NavigationSplitView sidebar="Sidebar" content="Content" className="custom" />,
      );

      expect(container.firstElementChild).toHaveClass('custom');
    });
  });
});
