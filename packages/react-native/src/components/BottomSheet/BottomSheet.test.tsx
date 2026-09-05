import { fireEvent, render, screen } from '@testing-library/react-native';

import { Text } from '@/components/Text';
import { GnomeProvider } from '@/GnomeProvider';
import { BottomSheet } from './BottomSheet';

const layout = (height: number) => ({
  nativeEvent: { layout: { x: 0, y: 0, width: 320, height } },
});

// `PanResponder`'s `gestureState.dy` is computed from `y0` (the touch's
// `currentPageY` captured at grant time) vs. the touch's `currentPageY` on
// each subsequent move — both read off the SAME `touchBank` entry, not a
// fresh one per event. A brand-new `touchHistory` object per `fireEvent`
// call (the pattern `Slider`'s own tests use, since `Slider` only reads
// `nativeEvent.locationX` and never touches `gestureState`) always computes
// `dy = 0` here, confirmed empirically — this stub instead mutates one
// shared `touchBank` entry across grant/move/release so `y0` is captured
// once and later moves compute a real, non-zero `dy` against it.
let ts = 0;
const bank = {
  touchActive: true,
  startPageX: 0,
  startPageY: 0,
  startTimeStamp: 0,
  currentPageX: 0,
  currentPageY: 0,
  currentTimeStamp: 0,
  previousPageX: 0,
  previousPageY: 0,
  previousTimeStamp: 0,
};
const touchHistory = {
  touchBank: [bank],
  numberActiveTouches: 1,
  indexOfSingleActiveTouch: 0,
  mostRecentTimeStamp: 0,
};
const touchEvent = (pageY: number) => {
  ts += 16;
  bank.previousPageX = bank.currentPageX;
  bank.previousPageY = bank.currentPageY;
  bank.previousTimeStamp = bank.currentTimeStamp;
  bank.currentPageY = pageY;
  bank.currentTimeStamp = ts;
  touchHistory.mostRecentTimeStamp = ts;

  return { nativeEvent: { pageX: 0, pageY }, touchHistory };
};

describe('BottomSheet', () => {
  it('is not rendered when closed', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <BottomSheet open={false} onClose={jest.fn()}>
          <Text>Content</Text>
        </BottomSheet>
      </GnomeProvider>,
    );

    expect(screen.queryByRole('dialog')).not.toBeOnTheScreen();
  });

  it('renders the title and content when open', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <BottomSheet open title="Options" onClose={jest.fn()}>
          <Text>Content</Text>
        </BottomSheet>
      </GnomeProvider>,
    );

    expect(screen.getByRole('dialog')).toBeOnTheScreen();
    expect(screen.getByText('Options')).toBeOnTheScreen();
    expect(screen.getByText('Content')).toBeOnTheScreen();
  });

  it('wraps a plain string children in Text', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <BottomSheet open onClose={jest.fn()}>
          Plain string content
        </BottomSheet>
      </GnomeProvider>,
    );

    expect(screen.getByText('Plain string content')).toBeOnTheScreen();
  });

  it('closes on a backdrop press', async () => {
    const onClose = jest.fn();

    await render(
      <GnomeProvider colorScheme="light">
        <BottomSheet open onClose={onClose} testID="backdrop">
          <Text>Content</Text>
        </BottomSheet>
      </GnomeProvider>,
    );

    await fireEvent.press(screen.getByTestId('backdrop'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close on backdrop press when closeOnBackdrop is false', async () => {
    const onClose = jest.fn();

    await render(
      <GnomeProvider colorScheme="light">
        <BottomSheet open onClose={onClose} closeOnBackdrop={false} testID="backdrop">
          <Text>Content</Text>
        </BottomSheet>
      </GnomeProvider>,
    );

    await fireEvent.press(screen.getByTestId('backdrop'));

    expect(onClose).not.toHaveBeenCalled();
  });

  it('a tap on the sheet itself never bubbles to the backdrop', async () => {
    const onClose = jest.fn();

    await render(
      <GnomeProvider colorScheme="light">
        <BottomSheet open onClose={onClose}>
          <Text>Content</Text>
        </BottomSheet>
      </GnomeProvider>,
    );

    await fireEvent.press(screen.getByRole('dialog'));

    expect(onClose).not.toHaveBeenCalled();
  });

  describe('drag-to-dismiss', () => {
    it('calls onClose after dragging past the 150px threshold', async () => {
      const onClose = jest.fn();

      await render(
        <GnomeProvider colorScheme="light">
          <BottomSheet open onClose={onClose}>
            <Text>Content</Text>
          </BottomSheet>
        </GnomeProvider>,
      );

      await fireEvent(screen.getByRole('dialog'), 'layout', layout(400));

      const handle = screen.getByTestId('bottom-sheet-handle', { includeHiddenElements: true });

      await fireEvent(handle, 'responderGrant', touchEvent(0));
      await fireEvent(handle, 'responderMove', touchEvent(200));
      await fireEvent(handle, 'responderRelease', touchEvent(200));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not close when dragged less than the threshold', async () => {
      const onClose = jest.fn();

      await render(
        <GnomeProvider colorScheme="light">
          <BottomSheet open onClose={onClose}>
            <Text>Content</Text>
          </BottomSheet>
        </GnomeProvider>,
      );

      await fireEvent(screen.getByRole('dialog'), 'layout', layout(400));

      const handle = screen.getByTestId('bottom-sheet-handle', { includeHiddenElements: true });

      await fireEvent(handle, 'responderGrant', touchEvent(0));
      await fireEvent(handle, 'responderMove', touchEvent(50));
      await fireEvent(handle, 'responderRelease', touchEvent(50));

      expect(onClose).not.toHaveBeenCalled();
    });
  });
});
