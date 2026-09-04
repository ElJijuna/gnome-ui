import { fireEvent, render, screen } from '@testing-library/react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { Slider } from './Slider';

const layout = (width: number) => ({ nativeEvent: { layout: { x: 0, y: 0, width, height: 22 } } });

// `PanResponder`'s own `onResponderGrant`/`onResponderMove` wrappers read
// `event.touchHistory` (a sibling of `nativeEvent`, not our component's own
// `event.nativeEvent.locationX`) to update their internal gesture-state
// bookkeeping *before* ever calling our `onPanResponder*` config callbacks —
// a bare `{ nativeEvent: { locationX } }` throws deep inside
// `TouchHistoryMath` ("Cannot read properties of undefined (reading
// 'touchBank')") because that machinery is missing entirely. This stub
// supplies just enough of that shape (a single active touch bank entry) to
// satisfy `PanResponder`'s bookkeeping, even though our own handlers only
// ever read `nativeEvent.locationX`.
let touchTimeStamp = 0;
const touchEvent = (locationX: number) => {
  touchTimeStamp += 16;

  return {
    nativeEvent: { locationX },
    touchHistory: {
      touchBank: [
        {
          touchActive: true,
          currentPageX: locationX,
          currentPageY: 0,
          currentTimeStamp: touchTimeStamp,
          previousPageX: locationX,
          previousPageY: 0,
          previousTimeStamp: touchTimeStamp,
        },
      ],
      numberActiveTouches: 1,
      indexOfSingleActiveTouch: 0,
      mostRecentTimeStamp: touchTimeStamp,
    },
  };
};

describe('Slider', () => {
  it('exposes min/max/now via accessibilityValue', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Slider value={30} onChange={jest.fn()} accessibilityLabel="Volume" />
      </GnomeProvider>,
    );

    const track = screen.getByRole('adjustable', { name: 'Volume' });

    expect(track.props.accessibilityValue).toEqual({ min: 0, max: 100, now: 30 });
  });

  it('clamps the reported value to min/max', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Slider value={150} onChange={jest.fn()} accessibilityLabel="Volume" />
      </GnomeProvider>,
    );

    expect(screen.getByRole('adjustable', { name: 'Volume' }).props.accessibilityValue.now).toBe(
      100,
    );
  });

  it('commits a value from a drag position once the track is laid out', async () => {
    const onChange = jest.fn();

    await render(
      <GnomeProvider colorScheme="light">
        <Slider value={0} onChange={onChange} accessibilityLabel="Volume" />
      </GnomeProvider>,
    );

    const track = screen.getByRole('adjustable', { name: 'Volume' });

    await fireEvent(track, 'layout', layout(200));
    await fireEvent(track, 'responderGrant', touchEvent(100));

    expect(onChange).toHaveBeenCalledWith(50);
  });

  it('does nothing before the track has a measured width', async () => {
    const onChange = jest.fn();

    await render(
      <GnomeProvider colorScheme="light">
        <Slider value={0} onChange={onChange} accessibilityLabel="Volume" />
      </GnomeProvider>,
    );

    await fireEvent(
      screen.getByRole('adjustable', { name: 'Volume' }),
      'responderGrant',
      touchEvent(100),
    );

    expect(onChange).not.toHaveBeenCalled();
  });

  it('snaps to the nearest step', async () => {
    const onChange = jest.fn();

    await render(
      <GnomeProvider colorScheme="light">
        <Slider value={0} onChange={onChange} step={10} accessibilityLabel="Volume" />
      </GnomeProvider>,
    );

    const track = screen.getByRole('adjustable', { name: 'Volume' });

    await fireEvent(track, 'layout', layout(100));
    await fireEvent(track, 'responderGrant', touchEvent(37));

    expect(onChange).toHaveBeenCalledWith(40);
  });

  it('updates continuously while dragging', async () => {
    const onChange = jest.fn();

    await render(
      <GnomeProvider colorScheme="light">
        <Slider value={0} onChange={onChange} accessibilityLabel="Volume" />
      </GnomeProvider>,
    );

    const track = screen.getByRole('adjustable', { name: 'Volume' });

    await fireEvent(track, 'layout', layout(200));
    await fireEvent(track, 'responderGrant', touchEvent(20));
    await fireEvent(track, 'responderMove', touchEvent(180));

    expect(onChange).toHaveBeenNthCalledWith(1, 10);
    expect(onChange).toHaveBeenNthCalledWith(2, 90);
  });

  it('does not commit a drag when disabled', async () => {
    const onChange = jest.fn();

    await render(
      <GnomeProvider colorScheme="light">
        <Slider value={0} onChange={onChange} disabled accessibilityLabel="Volume" />
      </GnomeProvider>,
    );

    const track = screen.getByRole('adjustable', { name: 'Volume' });

    await fireEvent(track, 'layout', layout(200));
    await fireEvent(track, 'responderGrant', touchEvent(100));

    expect(onChange).not.toHaveBeenCalled();
    expect(track.props.accessibilityState).toEqual({ disabled: true });
  });

  it('increments and decrements by one step via the adjustable accessibility action', async () => {
    const onChange = jest.fn();

    await render(
      <GnomeProvider colorScheme="light">
        <Slider value={50} onChange={onChange} step={5} accessibilityLabel="Volume" />
      </GnomeProvider>,
    );

    const track = screen.getByRole('adjustable', { name: 'Volume' });

    await fireEvent(track, 'accessibilityAction', { nativeEvent: { actionName: 'increment' } });
    await fireEvent(track, 'accessibilityAction', { nativeEvent: { actionName: 'decrement' } });

    expect(onChange).toHaveBeenNthCalledWith(1, 55);
    expect(onChange).toHaveBeenNthCalledWith(2, 45);
  });

  it('ignores accessibility actions when disabled', async () => {
    const onChange = jest.fn();

    await render(
      <GnomeProvider colorScheme="light">
        <Slider value={50} onChange={onChange} disabled accessibilityLabel="Volume" />
      </GnomeProvider>,
    );

    const track = screen.getByRole('adjustable', { name: 'Volume' });

    await fireEvent(track, 'accessibilityAction', { nativeEvent: { actionName: 'increment' } });

    expect(onChange).not.toHaveBeenCalled();
  });

  it('renders mark labels', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Slider
          value={50}
          onChange={jest.fn()}
          accessibilityLabel="Volume"
          marks={[
            { value: 0, label: 'Min' },
            { value: 100, label: 'Max' },
          ]}
        />
      </GnomeProvider>,
    );

    expect(screen.getByText('Min')).toBeOnTheScreen();
    expect(screen.getByText('Max')).toBeOnTheScreen();
  });
});
