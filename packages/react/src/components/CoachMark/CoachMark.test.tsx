import { fireEvent, render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CoachMark, type CoachMarkProps } from './CoachMark';
import { computeBubblePosition, padRect } from './coachMarkUtils';

beforeEach(() => {
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    cb(0);
    return 1;
  });
  vi.stubGlobal('cancelAnimationFrame', () => {});
});

// CoachMark takes a ref to an element rendered elsewhere; this harness wires one.
const Harness = (props: Omit<CoachMarkProps, 'targetRef'>) => {
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <div>
      <button ref={ref} type="button">
        Target
      </button>
      <CoachMark {...props} targetRef={ref} />
    </div>
  );
};

describe('CoachMark', () => {
  it('renders nothing while closed', () => {
    render(<Harness open={false} title="Hi" />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders a labelled dialog with title and description when open', () => {
    render(<Harness open title="Sync your files" description="Keep devices in step." />);
    const dialog = screen.getByRole('dialog');

    expect(dialog).toHaveAccessibleName('Sync your files');
    expect(dialog).toHaveAccessibleDescription('Keep devices in step.');
  });

  it('renders a step counter when step and stepCount are provided', () => {
    render(<Harness open title="Step" step={2} stepCount={4} />);
    expect(screen.getByText('2 of 4')).toBeInTheDocument();
  });

  it('calls the primary action', () => {
    const onClick = vi.fn();
    render(<Harness open title="T" primaryAction={{ label: 'Got it', onClick }} />);

    fireEvent.click(screen.getByRole('button', { name: 'Got it' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('calls the secondary action', () => {
    const onClick = vi.fn();
    render(<Harness open title="T" secondaryAction={{ label: 'Back', onClick }} />);

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('dismisses on Escape', () => {
    const onDismiss = vi.fn();
    render(<Harness open title="T" onDismiss={onDismiss} />);

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  describe('spotlight', () => {
    it('renders a backdrop by default', () => {
      const { container } = render(<Harness open title="T" />);
      // The backdrop is an aria-hidden portal layer.
      expect(
        container.ownerDocument.querySelector('[data-coachmark-backdrop]'),
      ).toBeInTheDocument();
    });

    it('omits the backdrop when spotlight is false', () => {
      render(<Harness open title="T" spotlight={false} />);
      expect(document.querySelector('[data-coachmark-backdrop]')).not.toBeInTheDocument();
    });

    it('dismisses on backdrop click when dismissOnBackdrop is set', () => {
      const onDismiss = vi.fn();
      render(<Harness open title="T" dismissOnBackdrop onDismiss={onDismiss} />);

      const backdrop = document.querySelector('[data-coachmark-backdrop]') as HTMLElement;
      fireEvent.click(backdrop);
      expect(onDismiss).toHaveBeenCalledOnce();
    });

    it('does not dismiss on backdrop click by default (guided)', () => {
      const onDismiss = vi.fn();
      render(<Harness open title="T" onDismiss={onDismiss} />);

      const backdrop = document.querySelector('[data-coachmark-backdrop]') as HTMLElement;
      fireEvent.click(backdrop);
      expect(onDismiss).not.toHaveBeenCalled();
    });
  });
});

// The flip maths carries the layout weight and jsdom reports zero-sized rects,
// so the positioner is asserted directly.
describe('coachMarkUtils', () => {
  const viewport = { width: 1000, height: 800 };
  const bubble = { width: 300, height: 160 };

  it('padRect grows a rect on every side', () => {
    expect(padRect({ top: 100, left: 100, width: 40, height: 20 }, 8)).toEqual({
      top: 92,
      left: 92,
      width: 56,
      height: 36,
    });
  });

  it('places below when the preferred side fits', () => {
    const target = { top: 100, left: 400, width: 80, height: 40 };
    const pos = computeBubblePosition(target, bubble, viewport, 'bottom');
    expect(pos.placement).toBe('bottom');
    expect(pos.top).toBe(100 + 40 + 12); // below the target + gap
  });

  it('flips to the opposite side when the preferred side would overflow', () => {
    // Target hugs the top edge: a top-placed bubble cannot fit, so it flips down.
    const target = { top: 8, left: 400, width: 80, height: 40 };
    const pos = computeBubblePosition(target, bubble, viewport, 'top');
    expect(pos.placement).toBe('bottom');
  });

  it('keeps the arrow pointing at the target after clamping the cross axis', () => {
    // Top-right corner: only a clamped bottom placement fits, so the bubble is
    // pushed left of the target and the arrow shifts right to stay on centre.
    const target = { top: 8, left: 960, width: 30, height: 30 };
    const pos = computeBubblePosition(target, bubble, viewport, 'bottom');
    expect(pos.placement).toBe('bottom');
    expect(pos.left + pos.arrowOffset).toBeCloseTo(975, 0); // ≈ target centre (960 + 15)
  });
});
