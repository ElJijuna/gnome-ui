import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Toast } from './Toast';
import { Toaster } from './Toaster';

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('Toast', () => {
  describe('rendering', () => {
    it('renders the title', () => {
      render(<Toast title="File saved" />);
      expect(screen.getByText('File saved')).toBeInTheDocument();
    });

    it('renders as role=status with aria-live=polite and aria-atomic=true', () => {
      render(<Toast title="File saved" />);
      const toast = screen.getByRole('status');

      expect(toast).toHaveAttribute('aria-live', 'polite');
      expect(toast).toHaveAttribute('aria-atomic', 'true');
    });

    it('does not render an action button without actionLabel', () => {
      render(<Toast title="File saved" />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('renders an action button when actionLabel is provided', () => {
      render(<Toast title="Item deleted" actionLabel="Undo" onAction={vi.fn()} />);
      expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument();
    });

    it('does not render a dismiss button by default', () => {
      render(<Toast title="File saved" />);
      expect(screen.queryByRole('button', { name: 'Dismiss' })).not.toBeInTheDocument();
    });

    it('renders a dismiss button when dismissible is true', () => {
      render(<Toast title="File saved" dismissible onDismiss={vi.fn()} />);
      expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
    });
  });

  describe('auto-dismiss', () => {
    it('calls onDismiss after the default 3s duration', () => {
      const onDismiss = vi.fn();

      render(<Toast title="File saved" onDismiss={onDismiss} />);
      act(() => vi.advanceTimersByTime(3000));

      expect(onDismiss).toHaveBeenCalledOnce();
    });

    it('does not call onDismiss before the duration elapses', () => {
      const onDismiss = vi.fn();

      render(<Toast title="File saved" onDismiss={onDismiss} />);
      act(() => vi.advanceTimersByTime(2999));

      expect(onDismiss).not.toHaveBeenCalled();
    });

    it('respects a custom duration', () => {
      const onDismiss = vi.fn();

      render(<Toast title="File saved" duration={1000} onDismiss={onDismiss} />);
      act(() => vi.advanceTimersByTime(1000));

      expect(onDismiss).toHaveBeenCalledOnce();
    });

    it('never auto-dismisses when duration is 0', () => {
      const onDismiss = vi.fn();

      render(<Toast title="Background sync…" duration={0} onDismiss={onDismiss} />);
      act(() => vi.advanceTimersByTime(60000));

      expect(onDismiss).not.toHaveBeenCalled();
    });

    it('does not start a timer at all without an onDismiss handler', () => {
      // Should not throw even though there's nothing to call.
      expect(() => {
        render(<Toast title="File saved" />);
        act(() => vi.advanceTimersByTime(5000));
      }).not.toThrow();
    });
  });

  describe('pause on hover/focus', () => {
    it('pauses the timer on mouseenter and resumes the remaining time on mouseleave', () => {
      const onDismiss = vi.fn();

      render(<Toast title="File saved" duration={3000} onDismiss={onDismiss} />);
      const toast = screen.getByRole('status');

      act(() => vi.advanceTimersByTime(2000));
      act(() => {
        fireEvent.mouseEnter(toast);
      });

      // Fully elapse what would have been the remaining 1000ms — should not fire yet.
      act(() => vi.advanceTimersByTime(5000));
      expect(onDismiss).not.toHaveBeenCalled();

      act(() => {
        fireEvent.mouseLeave(toast);
      });

      // Only ~1000ms should have remained when paused.
      act(() => vi.advanceTimersByTime(999));
      expect(onDismiss).not.toHaveBeenCalled();

      act(() => vi.advanceTimersByTime(1));
      expect(onDismiss).toHaveBeenCalledOnce();
    });

    it('pauses on focus and resumes on blur', () => {
      const onDismiss = vi.fn();

      render(<Toast title="File saved" duration={2000} onDismiss={onDismiss} />);
      const toast = screen.getByRole('status');

      act(() => vi.advanceTimersByTime(1000));
      act(() => {
        fireEvent.focus(toast);
      });
      act(() => vi.advanceTimersByTime(5000));
      expect(onDismiss).not.toHaveBeenCalled();

      act(() => {
        fireEvent.blur(toast);
      });
      act(() => vi.advanceTimersByTime(1000));
      expect(onDismiss).toHaveBeenCalledOnce();
    });
  });

  describe('interactions', () => {
    it('calls onAction and onDismiss when the action button is clicked', async () => {
      vi.useRealTimers();
      const onAction = vi.fn();
      const onDismiss = vi.fn();

      render(
        <Toast title="Item deleted" actionLabel="Undo" onAction={onAction} onDismiss={onDismiss} />,
      );
      await userEvent.click(screen.getByRole('button', { name: 'Undo' }));

      expect(onAction).toHaveBeenCalledOnce();
      expect(onDismiss).toHaveBeenCalledOnce();
    });

    it('calls onDismiss (without onAction) when the dismiss button is clicked', async () => {
      vi.useRealTimers();
      const onAction = vi.fn();
      const onDismiss = vi.fn();

      render(
        <Toast title="File saved" dismissible actionLabel="Undo" onAction={onAction} onDismiss={onDismiss} />,
      );
      await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));

      expect(onDismiss).toHaveBeenCalledOnce();
      expect(onAction).not.toHaveBeenCalled();
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className', () => {
      render(<Toast title="File saved" className="custom" />);
      expect(screen.getByRole('status')).toHaveClass('custom');
    });
  });
});

describe('Toaster', () => {
  it('renders children into a document.body portal', () => {
    render(
      <Toaster>
        <Toast title="File saved" />
      </Toaster>,
    );

    expect(screen.getByText('File saved')).toBeInTheDocument();
    expect(screen.getByText('File saved').closest('[aria-label="Notifications"]')).toBe(
      document.body.querySelector('[aria-label="Notifications"]'),
    );
  });

  it('has an accessible name of "Notifications"', () => {
    render(<Toaster />);
    expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
  });

  it('renders into a custom container when provided', () => {
    const customContainer = document.createElement('div');
    document.body.appendChild(customContainer);

    render(
      <Toaster container={customContainer}>
        <Toast title="File saved" />
      </Toaster>,
    );

    expect(customContainer.querySelector('[aria-label="Notifications"]')).not.toBeNull();
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className', () => {
      render(<Toaster className="custom" />);
      expect(screen.getByLabelText('Notifications')).toHaveClass('custom');
    });
  });
});

