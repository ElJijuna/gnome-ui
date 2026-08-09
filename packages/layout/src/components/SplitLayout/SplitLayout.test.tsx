import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SplitLayout } from './SplitLayout';

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

describe('SplitLayout', () => {
  describe('panes', () => {
    it('renders sidebar and detail content', () => {
      render(<SplitLayout sidebar={<div>Mail list</div>} detail={<div>Mail detail</div>} />);

      expect(screen.getByText('Mail list')).toBeInTheDocument();
      expect(screen.getByText('Mail detail')).toBeInTheDocument();
    });
  });

  describe('headers', () => {
    it('renders sidebarTitle in a header bar', () => {
      render(<SplitLayout sidebarTitle="Mail" sidebar="List" detail="Detail" />);
      expect(screen.getByText('Mail')).toBeInTheDocument();
    });

    it('renders detailTitle in a header bar', () => {
      render(<SplitLayout detailTitle="Inbox" sidebar="List" detail="Detail" />);
      expect(screen.getByText('Inbox')).toBeInTheDocument();
    });

    it('renders sidebarActions', () => {
      render(
        <SplitLayout
          sidebar="List"
          detail="Detail"
          sidebarActions={<button type="button">Compose</button>}
        />,
      );

      expect(screen.getByRole('button', { name: 'Compose' })).toBeInTheDocument();
    });

    it('renders detailActions', () => {
      render(
        <SplitLayout
          sidebar="List"
          detail="Detail"
          detailActions={<button type="button">Delete</button>}
        />,
      );

      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    });

    it('omits the sidebar header entirely when no title/actions are given', () => {
      const { container } = render(<SplitLayout sidebar="List" detail="Detail" />);

      expect(container.querySelectorAll('header')).toHaveLength(0);
    });
  });

  describe('mobile back button', () => {
    it('does not render a back button on wide screens even with onBack + showDetail', () => {
      setViewportWidth(1024);

      render(
        <SplitLayout
          sidebar="List"
          detail="Detail"
          showDetail
          onBack={vi.fn()}
          detailTitle="Message"
        />,
      );

      expect(screen.queryByRole('button', { name: 'Back' })).toBeNull();
    });

    it('renders a back button on narrow screens when showDetail and onBack are set', () => {
      setViewportWidth(400);

      render(<SplitLayout sidebar="List" detail="Detail" showDetail onBack={vi.fn()} />);

      expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
    });

    it('does not render a back button when showDetail is false', () => {
      setViewportWidth(400);

      render(<SplitLayout sidebar="List" detail="Detail" onBack={vi.fn()} />);

      expect(screen.queryByRole('button', { name: 'Back' })).toBeNull();
    });

    it('does not render a back button when onBack is omitted', () => {
      setViewportWidth(400);

      render(<SplitLayout sidebar="List" detail="Detail" showDetail />);

      expect(screen.queryByRole('button', { name: 'Back' })).toBeNull();
    });

    it('calls onBack when the back button is clicked', async () => {
      setViewportWidth(400);
      const onBack = vi.fn();

      render(<SplitLayout sidebar="List" detail="Detail" showDetail onBack={onBack} />);

      screen.getByRole('button', { name: 'Back' }).click();
      expect(onBack).toHaveBeenCalledOnce();
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className to the underlying NavigationSplitView', () => {
      const { container } = render(
        <SplitLayout sidebar="List" detail="Detail" className="custom-split" />,
      );

      expect(container.firstElementChild).toHaveClass('custom-split');
    });
  });
});
