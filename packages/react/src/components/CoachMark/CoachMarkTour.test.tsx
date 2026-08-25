import { fireEvent, render, screen } from '@testing-library/react';
import { useRef, useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CoachMarkTour, type CoachMarkTourProps } from './CoachMarkTour';

beforeEach(() => {
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    cb(0);
    return 1;
  });
  vi.stubGlobal('cancelAnimationFrame', () => {});
});

// Wires three real target elements and forwards tour props.
const Harness = (props: Omit<CoachMarkTourProps, 'steps' | 'open'> & { open?: boolean }) => {
  const a = useRef<HTMLButtonElement>(null);
  const b = useRef<HTMLButtonElement>(null);
  const c = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(props.open ?? true);

  return (
    <div>
      <button ref={a} type="button">
        A
      </button>
      <button ref={b} type="button">
        B
      </button>
      <button ref={c} type="button">
        C
      </button>
      <button type="button" onClick={() => setOpen(true)}>
        reopen
      </button>
      <CoachMarkTour
        {...props}
        open={open}
        steps={[
          { targetRef: a, title: 'First', description: 'Step one.' },
          { targetRef: b, title: 'Second', description: 'Step two.' },
          { targetRef: c, title: 'Third', description: 'Step three.' },
        ]}
        onFinish={() => {
          setOpen(false);
          props.onFinish?.();
        }}
        onSkip={() => {
          setOpen(false);
          props.onSkip?.();
        }}
      />
    </div>
  );
};

describe('CoachMarkTour', () => {
  it('shows the first step with a counter', () => {
    render(<Harness />);
    expect(screen.getByRole('dialog')).toHaveAccessibleName('First');
    expect(screen.getByText('1 of 3')).toBeInTheDocument();
  });

  it('offers Skip (not Back) on the first step', () => {
    render(<Harness />);
    expect(screen.getByRole('button', { name: 'Skip' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument();
  });

  it('advances with Next and reports the step change', () => {
    const onStepChange = vi.fn();
    render(<Harness onStepChange={onStepChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    expect(onStepChange).toHaveBeenCalledWith(1);
    expect(screen.getByText('2 of 3')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveAccessibleName('Second');
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
  });

  it('goes Back to the previous step', () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));

    expect(screen.getByText('1 of 3')).toBeInTheDocument();
  });

  it('shows Done on the last step and finishes', () => {
    const onFinish = vi.fn();
    render(<Harness onFinish={onFinish} />);

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('3 of 3')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(onFinish).toHaveBeenCalledOnce();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('skips from the first step', () => {
    const onSkip = vi.fn();
    render(<Harness onSkip={onSkip} />);

    fireEvent.click(screen.getByRole('button', { name: 'Skip' }));
    expect(onSkip).toHaveBeenCalledOnce();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('skips on Escape', () => {
    const onSkip = vi.fn();
    render(<Harness onSkip={onSkip} />);

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onSkip).toHaveBeenCalledOnce();
  });

  it('restarts at the first step when reopened', () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('2 of 3')).toBeInTheDocument();

    // Skip closes the tour, then reopen it.
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    fireEvent.click(screen.getByRole('button', { name: 'Skip' }));
    fireEvent.click(screen.getByRole('button', { name: 'reopen' }));

    expect(screen.getByText('1 of 3')).toBeInTheDocument();
  });

  it('applies custom labels', () => {
    render(<Harness labels={{ next: 'Continuar', skip: 'Omitir' }} />);
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Omitir' })).toBeInTheDocument();
  });
});
