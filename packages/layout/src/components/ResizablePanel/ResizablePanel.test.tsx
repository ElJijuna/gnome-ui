import { fireEvent, render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { ResizablePanel } from './ResizablePanel';

beforeAll(() => {
  // jsdom does not implement the Pointer Events capture API.
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.hasPointerCapture = vi.fn(() => true);
  Element.prototype.releasePointerCapture = vi.fn();
});

function mockContainerRect(container: HTMLElement, { width = 200, height = 200 } = {}) {
  vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({
    left: 0,
    top: 0,
    width,
    height,
    right: width,
    bottom: height,
    x: 0,
    y: 0,
    toJSON: () => {},
  });
}

describe('ResizablePanel', () => {
  describe('rendering', () => {
    it('renders every panel', () => {
      render(
        <ResizablePanel>
          <div>A</div>
          <div>B</div>
          <div>C</div>
        </ResizablePanel>,
      );

      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('B')).toBeInTheDocument();
      expect(screen.getByText('C')).toBeInTheDocument();
    });

    it('renders one divider fewer than the number of panels', () => {
      render(
        <ResizablePanel>
          <div>A</div>
          <div>B</div>
          <div>C</div>
        </ResizablePanel>,
      );

      expect(screen.getAllByRole('separator')).toHaveLength(2);
    });

    it('renders no dividers for a single panel', () => {
      render(
        <ResizablePanel>
          <div>A</div>
        </ResizablePanel>,
      );

      expect(screen.queryByRole('separator')).not.toBeInTheDocument();
    });

    it('splits panels equally when defaultSizes is omitted', () => {
      const { container } = render(
        <ResizablePanel>
          <div>A</div>
          <div>B</div>
        </ResizablePanel>,
      );
      const panels = container.querySelectorAll('[class*="panel"]');

      expect((panels[0] as HTMLElement).style.flexBasis).toBe('50%');
      expect((panels[1] as HTMLElement).style.flexBasis).toBe('50%');
    });

    it('applies defaultSizes when it matches the panel count', () => {
      const { container } = render(
        <ResizablePanel defaultSizes={[30, 70]}>
          <div>A</div>
          <div>B</div>
        </ResizablePanel>,
      );
      const panels = container.querySelectorAll('[class*="panel"]');

      expect((panels[0] as HTMLElement).style.flexBasis).toBe('30%');
      expect((panels[1] as HTMLElement).style.flexBasis).toBe('70%');
    });

    it('falls back to an equal split when defaultSizes length does not match', () => {
      const { container } = render(
        <ResizablePanel defaultSizes={[20, 30, 50]}>
          <div>A</div>
          <div>B</div>
        </ResizablePanel>,
      );
      const panels = container.querySelectorAll('[class*="panel"]');

      expect((panels[0] as HTMLElement).style.flexBasis).toBe('50%');
      expect((panels[1] as HTMLElement).style.flexBasis).toBe('50%');
    });
  });

  describe('accessibility', () => {
    it('sets aria-orientation="vertical" on dividers in horizontal layout', () => {
      render(
        <ResizablePanel direction="horizontal">
          <div>A</div>
          <div>B</div>
        </ResizablePanel>,
      );

      expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical');
    });

    it('sets aria-orientation="horizontal" on dividers in vertical layout', () => {
      render(
        <ResizablePanel direction="vertical">
          <div>A</div>
          <div>B</div>
        </ResizablePanel>,
      );

      expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'horizontal');
    });

    it('exposes aria-valuenow/min/max on the divider', () => {
      render(
        <ResizablePanel defaultSizes={[30, 70]} minSize={15}>
          <div>A</div>
          <div>B</div>
        </ResizablePanel>,
      );
      const divider = screen.getByRole('separator');

      expect(divider).toHaveAttribute('aria-valuenow', '30');
      expect(divider).toHaveAttribute('aria-valuemin', '15');
      expect(divider).toHaveAttribute('aria-valuemax', '85');
    });
  });

  describe('pointer drag', () => {
    it('resizes the adjacent pair when the divider is dragged', () => {
      const onResize = vi.fn();

      const { container } = render(
        <ResizablePanel defaultSizes={[50, 50]} onResize={onResize}>
          <div>A</div>
          <div>B</div>
        </ResizablePanel>,
      );

      mockContainerRect(container.firstChild as HTMLElement);
      const divider = screen.getByRole('separator');

      fireEvent.pointerDown(divider, { clientX: 100, pointerId: 1 });
      fireEvent.pointerMove(divider, { clientX: 140, pointerId: 1 });

      // 40px delta / 200px container width = +20%
      expect(onResize).toHaveBeenLastCalledWith([70, 30]);
    });

    it('does not shrink a panel below minSize', () => {
      const onResize = vi.fn();

      const { container } = render(
        <ResizablePanel defaultSizes={[50, 50]} minSize={20} onResize={onResize}>
          <div>A</div>
          <div>B</div>
        </ResizablePanel>,
      );

      mockContainerRect(container.firstChild as HTMLElement);
      const divider = screen.getByRole('separator');

      fireEvent.pointerDown(divider, { clientX: 100, pointerId: 1 });
      fireEvent.pointerMove(divider, { clientX: 300, pointerId: 1 });

      expect(onResize).toHaveBeenLastCalledWith([80, 20]);
    });

    it('ignores pointermove before pointerdown captured that divider', () => {
      const onResize = vi.fn();

      const { container } = render(
        <ResizablePanel defaultSizes={[50, 50]} onResize={onResize}>
          <div>A</div>
          <div>B</div>
        </ResizablePanel>,
      );

      mockContainerRect(container.firstChild as HTMLElement);
      const divider = screen.getByRole('separator');

      fireEvent.pointerMove(divider, { clientX: 140, pointerId: 1 });
      expect(onResize).not.toHaveBeenCalled();
    });
  });

  describe('keyboard resize', () => {
    it('ArrowRight grows the leading panel in horizontal layout', () => {
      const onResize = vi.fn();

      render(
        <ResizablePanel defaultSizes={[50, 50]} onResize={onResize}>
          <div>A</div>
          <div>B</div>
        </ResizablePanel>,
      );

      fireEvent.keyDown(screen.getByRole('separator'), { key: 'ArrowRight' });
      expect(onResize).toHaveBeenLastCalledWith([52, 48]);
    });

    it('ArrowLeft shrinks the leading panel in horizontal layout', () => {
      const onResize = vi.fn();

      render(
        <ResizablePanel defaultSizes={[50, 50]} onResize={onResize}>
          <div>A</div>
          <div>B</div>
        </ResizablePanel>,
      );

      fireEvent.keyDown(screen.getByRole('separator'), { key: 'ArrowLeft' });
      expect(onResize).toHaveBeenLastCalledWith([48, 52]);
    });

    it('ArrowDown grows the leading panel in vertical layout', () => {
      const onResize = vi.fn();

      render(
        <ResizablePanel direction="vertical" defaultSizes={[50, 50]} onResize={onResize}>
          <div>A</div>
          <div>B</div>
        </ResizablePanel>,
      );

      fireEvent.keyDown(screen.getByRole('separator'), { key: 'ArrowDown' });
      expect(onResize).toHaveBeenLastCalledWith([52, 48]);
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className to the container', () => {
      const { container } = render(
        <ResizablePanel className="custom">
          <div>A</div>
          <div>B</div>
        </ResizablePanel>,
      );

      expect(container.firstElementChild).toHaveClass('custom');
    });

    it('forwards data attributes', () => {
      render(
        <ResizablePanel data-testid="split">
          <div>A</div>
          <div>B</div>
        </ResizablePanel>,
      );

      expect(screen.getByTestId('split')).toBeInTheDocument();
    });
  });
});
