import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BreakpointBin, type BreakpointBinState } from './BreakpointBin';

class ResizeObserverMock {
  static instances: ResizeObserverMock[] = [];

  constructor(private callback: ResizeObserverCallback) {
    ResizeObserverMock.instances.push(this);
  }

  observe() {}
  unobserve() {}
  disconnect() {}

  trigger(width: number) {
    this.callback(
      [{ contentRect: { width } as DOMRectReadOnly } as ResizeObserverEntry],
      this as unknown as ResizeObserver,
    );
  }
}

beforeEach(() => {
  ResizeObserverMock.instances = [];
  vi.stubGlobal('ResizeObserver', ResizeObserverMock);
});

const breakpoints = [
  { name: 'compact', maxWidth: 400 },
  { name: 'narrow', maxWidth: 600 },
];

function renderState(state: BreakpointBinState) {
  return (
    <div>
      <span>active: {state.activeBreakpoint ?? 'none'}</span>
      <span>width: {state.width}</span>
    </div>
  );
}

describe('BreakpointBin', () => {
  it('measures the initial container width via offsetWidth', () => {
    render(
      <BreakpointBin breakpoints={breakpoints}>
        {(state) => {
          expect(state.width).toBe(0);
          return renderState(state);
        }}
      </BreakpointBin>,
    );
  });

  it('matches the smallest breakpoint on initial mount (jsdom reports offsetWidth 0)', () => {
    render(<BreakpointBin breakpoints={breakpoints}>{renderState}</BreakpointBin>);
    expect(screen.getByText('active: compact')).toBeInTheDocument();
  });

  it('sets data-breakpoint and the render-prop state when the width crosses a threshold', () => {
    const { container } = render(
      <BreakpointBin breakpoints={breakpoints}>{renderState}</BreakpointBin>,
    );

    act(() => ResizeObserverMock.instances[0].trigger(350));

    expect(container.firstElementChild).toHaveAttribute('data-breakpoint', 'compact');
    expect(screen.getByText('active: compact')).toBeInTheDocument();
    expect(screen.getByText('width: 350')).toBeInTheDocument();
  });

  it('picks the smallest matching breakpoint regardless of declaration order', () => {
    const { container } = render(
      <BreakpointBin breakpoints={[...breakpoints].reverse()}>{renderState}</BreakpointBin>,
    );

    act(() => ResizeObserverMock.instances[0].trigger(500));

    expect(container.firstElementChild).toHaveAttribute('data-breakpoint', 'narrow');
  });

  it('has no active breakpoint (and no data-breakpoint attribute) when wider than all thresholds', () => {
    const { container } = render(
      <BreakpointBin breakpoints={breakpoints}>{renderState}</BreakpointBin>,
    );

    act(() => ResizeObserverMock.instances[0].trigger(800));

    expect(container.firstElementChild).not.toHaveAttribute('data-breakpoint');
    expect(screen.getByText('active: none')).toBeInTheDocument();
  });

  it('re-evaluates on subsequent resize notifications', () => {
    render(<BreakpointBin breakpoints={breakpoints}>{renderState}</BreakpointBin>);

    act(() => ResizeObserverMock.instances[0].trigger(350));
    expect(screen.getByText('active: compact')).toBeInTheDocument();

    act(() => ResizeObserverMock.instances[0].trigger(800));
    expect(screen.getByText('active: none')).toBeInTheDocument();
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className', () => {
      const { container } = render(
        <BreakpointBin breakpoints={breakpoints} className="custom">
          {renderState}
        </BreakpointBin>,
      );

      expect(container.firstElementChild).toHaveClass('custom');
    });
  });
});
