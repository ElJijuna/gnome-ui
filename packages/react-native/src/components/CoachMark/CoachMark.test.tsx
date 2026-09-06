import { fireEvent, render, screen } from '@testing-library/react-native';
import { createRef, type RefObject } from 'react';
import type { View } from 'react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { CoachMark } from './CoachMark';

/**
 * A fake ref with a spied `measureInWindow`, standing in for a real
 * `RefObject<View>`. `CoachMark` only ever calls
 * `targetRef.current?.measureInWindow(...)`, so a plain object shaped
 * like that is enough — no real `View` needed. Real `View` instances in
 * this package's Jest environment don't fully resolve a usable position
 * either way (`measureInWindow` never invokes its callback on one, and
 * downstream `onLayout`-based sizing doesn't settle without a real native
 * surface — the same established `Tooltip`/`Popover`/`Dropdown`
 * measurement gotcha), so the meaningful, testable assertion here is
 * "did a *new* measurement actually get requested" via a spy's call
 * count, not the resulting pixel position.
 */
function fakeTargetRef() {
  return {
    current: { measureInWindow: jest.fn() },
  } as unknown as RefObject<View> & { current: { measureInWindow: jest.Mock } };
}

// `measureInWindow` never invokes its callback in this package's Jest
// environment (no real native view to measure — the same established
// `Tooltip`/`Popover`/`Dropdown` gotcha), so `targetRect`/`pos` never
// resolve here. A bare `{ current: null }` ref exercises exactly the same
// code path as a real-but-unmeasurable target, without needing a rendered
// target element the way the web version's test harness does.
const targetRef = createRef<View>();

describe('CoachMark', () => {
  it('renders nothing while closed', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <CoachMark open={false} targetRef={targetRef} title="Hi" />
      </GnomeProvider>,
    );

    expect(screen.queryByRole('dialog')).not.toBeOnTheScreen();
  });

  it('renders a labelled dialog with title and description when open', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <CoachMark
          open
          targetRef={targetRef}
          title="Sync your files"
          description="Keep devices in step."
        />
      </GnomeProvider>,
    );

    expect(screen.getByRole('dialog')).toBeOnTheScreen();
    expect(screen.getByText('Sync your files')).toBeOnTheScreen();
    expect(screen.getByText('Keep devices in step.')).toBeOnTheScreen();
  });

  it('renders a step counter when step and stepCount are provided', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <CoachMark open targetRef={targetRef} title="Step" step={2} stepCount={4} />
      </GnomeProvider>,
    );

    expect(screen.getByText('2 of 4')).toBeOnTheScreen();
  });

  it('calls the primary action', async () => {
    const onPress = jest.fn();

    await render(
      <GnomeProvider colorScheme="light">
        <CoachMark
          open
          targetRef={targetRef}
          title="T"
          primaryAction={{ label: 'Got it', onPress }}
        />
      </GnomeProvider>,
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Got it' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('calls the secondary action', async () => {
    const onPress = jest.fn();

    await render(
      <GnomeProvider colorScheme="light">
        <CoachMark
          open
          targetRef={targetRef}
          title="T"
          secondaryAction={{ label: 'Back', onPress }}
        />
      </GnomeProvider>,
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Back' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  describe('spotlight', () => {
    it('renders a backdrop by default', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <CoachMark open targetRef={targetRef} title="T" testID="backdrop" />
        </GnomeProvider>,
      );

      expect(screen.getByTestId('backdrop', { includeHiddenElements: true })).toBeOnTheScreen();
    });

    it('omits the backdrop when spotlight is false', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <CoachMark open targetRef={targetRef} title="T" spotlight={false} testID="backdrop" />
        </GnomeProvider>,
      );

      expect(screen.queryByTestId('backdrop')).not.toBeOnTheScreen();
    });

    it('dismisses on backdrop press when dismissOnBackdrop is set', async () => {
      const onDismiss = jest.fn();

      await render(
        <GnomeProvider colorScheme="light">
          <CoachMark
            open
            targetRef={targetRef}
            title="T"
            dismissOnBackdrop
            onDismiss={onDismiss}
            testID="backdrop"
          />
        </GnomeProvider>,
      );

      await fireEvent.press(screen.getByTestId('backdrop', { includeHiddenElements: true }));
      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('does not dismiss on backdrop press by default (guided)', async () => {
      const onDismiss = jest.fn();

      await render(
        <GnomeProvider colorScheme="light">
          <CoachMark open targetRef={targetRef} title="T" onDismiss={onDismiss} testID="backdrop" />
        </GnomeProvider>,
      );

      await fireEvent.press(screen.getByTestId('backdrop', { includeHiddenElements: true }));
      expect(onDismiss).not.toHaveBeenCalled();
    });
  });

  describe('re-measuring on target change', () => {
    it('re-measures and repositions when targetRef changes while open (CoachMarkTour step change)', async () => {
      const first = fakeTargetRef();
      const second = fakeTargetRef();

      const { rerender } = await render(
        <GnomeProvider colorScheme="light">
          <CoachMark open targetRef={first} title="Step 1" />
        </GnomeProvider>,
      );

      await new Promise((resolve) => setTimeout(resolve, 60));
      expect(first.current.measureInWindow).toHaveBeenCalledTimes(1);
      expect(second.current.measureInWindow).not.toHaveBeenCalled();

      // Same `open`, a different `targetRef` — mirrors `CoachMarkTour`
      // advancing to a step with a different target, the exact scenario
      // that regressed when the measurement effect only depended on
      // `open`: the second target was never re-measured, so the spotlight
      // and bubble stayed stuck on the first step.
      await rerender(
        <GnomeProvider colorScheme="light">
          <CoachMark open targetRef={second} title="Step 2" />
        </GnomeProvider>,
      );

      await new Promise((resolve) => setTimeout(resolve, 60));
      expect(second.current.measureInWindow).toHaveBeenCalledTimes(1);
      // The first ref isn't re-measured just because a sibling step changed.
      expect(first.current.measureInWindow).toHaveBeenCalledTimes(1);
    });
  });
});
