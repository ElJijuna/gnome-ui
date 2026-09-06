import { fireEvent, render, screen } from '@testing-library/react-native';
import { createRef } from 'react';
import type { View } from 'react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { CoachMarkTour, type CoachMarkTourProps } from './CoachMarkTour';

const a = createRef<View>();
const b = createRef<View>();
const c = createRef<View>();

const steps = [
  { targetRef: a, title: 'First', description: 'Step one.' },
  { targetRef: b, title: 'Second', description: 'Step two.' },
  { targetRef: c, title: 'Third', description: 'Step three.' },
];

const renderTour = (props: Partial<CoachMarkTourProps> = {}) =>
  render(
    <GnomeProvider colorScheme="light">
      <CoachMarkTour steps={steps} open {...props} />
    </GnomeProvider>,
  );

describe('CoachMarkTour', () => {
  it('shows the first step with a counter', async () => {
    await renderTour();

    expect(screen.getByText('First')).toBeOnTheScreen();
    expect(screen.getByText('1 of 3')).toBeOnTheScreen();
  });

  it('offers Skip (not Back) on the first step', async () => {
    await renderTour();

    expect(screen.getByRole('button', { name: 'Skip' })).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeOnTheScreen();
  });

  it('advances with Next and reports the step change', async () => {
    const onStepChange = jest.fn();

    await renderTour({ onStepChange });

    await fireEvent.press(screen.getByRole('button', { name: 'Next' }));

    expect(onStepChange).toHaveBeenCalledWith(1);
    expect(screen.getByText('2 of 3')).toBeOnTheScreen();
    expect(screen.getByText('Second')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Back' })).toBeOnTheScreen();
  });

  it('goes Back to the previous step', async () => {
    await renderTour();

    await fireEvent.press(screen.getByRole('button', { name: 'Next' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Back' }));

    expect(screen.getByText('1 of 3')).toBeOnTheScreen();
  });

  it('shows Done on the last step and finishes', async () => {
    const onFinish = jest.fn();

    await renderTour({ onFinish });

    await fireEvent.press(screen.getByRole('button', { name: 'Next' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('3 of 3')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Done' }));
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it('skips from the first step', async () => {
    const onSkip = jest.fn();

    await renderTour({ onSkip });

    await fireEvent.press(screen.getByRole('button', { name: 'Skip' }));
    expect(onSkip).toHaveBeenCalledTimes(1);
  });

  it('restarts at the first step when reopened', async () => {
    const { rerender } = await renderTour();

    await fireEvent.press(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('2 of 3')).toBeOnTheScreen();

    await rerender(
      <GnomeProvider colorScheme="light">
        <CoachMarkTour steps={steps} open={false} />
      </GnomeProvider>,
    );
    await rerender(
      <GnomeProvider colorScheme="light">
        <CoachMarkTour steps={steps} open />
      </GnomeProvider>,
    );

    expect(screen.getByText('1 of 3')).toBeOnTheScreen();
  });

  it('applies custom labels', async () => {
    await renderTour({ labels: { next: 'Continuar', skip: 'Omitir' } });

    expect(screen.getByRole('button', { name: 'Continuar' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Omitir' })).toBeOnTheScreen();
  });

  it('renders nothing when there are no steps', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <CoachMarkTour steps={[]} open />
      </GnomeProvider>,
    );

    expect(screen.queryByRole('dialog')).not.toBeOnTheScreen();
  });
});
