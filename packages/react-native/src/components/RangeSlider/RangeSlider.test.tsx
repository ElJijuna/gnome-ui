import { fireEvent, render, screen } from '@testing-library/react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { RangeSlider } from './RangeSlider';

const layout = (width: number) => ({ nativeEvent: { layout: { x: 0, y: 0, width, height: 22 } } });

// Same `PanResponder`/`touchHistory` stub `Slider`'s own test file already
// established — `onResponderGrant`/`onResponderMove` read `touchHistory`
// for internal bookkeeping before ever calling our config callbacks, which
// only ever read `nativeEvent.locationX`.
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

describe('RangeSlider', () => {
  it('exposes min/max/now via accessibilityValue on both thumbs', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <RangeSlider value={[20, 80]} onChange={jest.fn()} />
      </GnomeProvider>,
    );

    const min = screen.getByRole('adjustable', { name: 'Minimum value' });
    const max = screen.getByRole('adjustable', { name: 'Maximum value' });

    expect(min.props.accessibilityValue).toEqual({ min: 0, max: 80, now: 20 });
    expect(max.props.accessibilityValue).toEqual({ min: 20, max: 100, now: 80 });
  });

  it('accepts custom minLabel/maxLabel', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <RangeSlider
          value={[20, 80]}
          onChange={jest.fn()}
          minLabel="Low price"
          maxLabel="High price"
        />
      </GnomeProvider>,
    );

    expect(screen.getByRole('adjustable', { name: 'Low price' })).toBeOnTheScreen();
    expect(screen.getByRole('adjustable', { name: 'High price' })).toBeOnTheScreen();
  });

  it('drags the nearest thumb to the touched position once laid out', async () => {
    const onChange = jest.fn();

    await render(
      <GnomeProvider colorScheme="light">
        <RangeSlider value={[0, 100]} onChange={onChange} testID="range" />
      </GnomeProvider>,
    );

    const track = screen.getByTestId('range-track');

    await fireEvent(track, 'layout', layout(200));
    // Touch near the lower thumb (at x=0) — nearest thumb is index 0.
    await fireEvent(track, 'responderGrant', touchEvent(10));

    expect(onChange).toHaveBeenCalledWith([5, 100]);
  });

  it('picks the nearer thumb when touching close to the upper bound', async () => {
    const onChange = jest.fn();

    await render(
      <GnomeProvider colorScheme="light">
        <RangeSlider value={[0, 100]} onChange={onChange} testID="range" />
      </GnomeProvider>,
    );

    const track = screen.getByTestId('range-track');

    await fireEvent(track, 'layout', layout(200));
    await fireEvent(track, 'responderGrant', touchEvent(190));

    expect(onChange).toHaveBeenCalledWith([0, 95]);
  });

  it('does nothing before the track has a measured width', async () => {
    const onChange = jest.fn();

    await render(
      <GnomeProvider colorScheme="light">
        <RangeSlider value={[0, 100]} onChange={onChange} testID="range" />
      </GnomeProvider>,
    );

    await fireEvent(screen.getByTestId('range-track'), 'responderGrant', touchEvent(10));

    expect(onChange).not.toHaveBeenCalled();
  });

  it('keeps the thumb chosen at touch-down locked for the whole drag', async () => {
    const onChange = jest.fn();

    await render(
      <GnomeProvider colorScheme="light">
        <RangeSlider value={[0, 100]} onChange={onChange} testID="range" />
      </GnomeProvider>,
    );

    const track = screen.getByTestId('range-track');

    await fireEvent(track, 'layout', layout(200));
    // Grabs the lower thumb (near x=0)...
    await fireEvent(track, 'responderGrant', touchEvent(5));
    // ...then drags past the midpoint, closer to the upper thumb — the
    // lower thumb must keep following, not hand off to the upper one.
    await fireEvent(track, 'responderMove', touchEvent(180));

    expect(onChange).toHaveBeenNthCalledWith(1, [3, 100]);
    expect(onChange).toHaveBeenNthCalledWith(2, [90, 100]);
  });

  it('enforces minDistance between the two thumbs', async () => {
    const onChange = jest.fn();

    await render(
      <GnomeProvider colorScheme="light">
        <RangeSlider value={[40, 50]} onChange={onChange} minDistance={10} testID="range" />
      </GnomeProvider>,
    );

    const track = screen.getByTestId('range-track');

    await fireEvent(track, 'layout', layout(200));
    // Drag the lower thumb (nearest to x=80, i.e. value 40) far to the right.
    await fireEvent(track, 'responderGrant', touchEvent(80));
    await fireEvent(track, 'responderMove', touchEvent(150));

    expect(onChange).toHaveBeenLastCalledWith([40, 50]);
  });

  it('snaps to the nearest step', async () => {
    const onChange = jest.fn();

    await render(
      <GnomeProvider colorScheme="light">
        <RangeSlider value={[0, 100]} onChange={onChange} step={10} testID="range" />
      </GnomeProvider>,
    );

    const track = screen.getByTestId('range-track');

    await fireEvent(track, 'layout', layout(100));
    await fireEvent(track, 'responderGrant', touchEvent(7));

    expect(onChange).toHaveBeenCalledWith([10, 100]);
  });

  it('does not commit a drag when disabled', async () => {
    const onChange = jest.fn();

    await render(
      <GnomeProvider colorScheme="light">
        <RangeSlider value={[0, 100]} onChange={onChange} disabled testID="range" />
      </GnomeProvider>,
    );

    const track = screen.getByTestId('range-track');

    await fireEvent(track, 'layout', layout(200));
    await fireEvent(track, 'responderGrant', touchEvent(10));

    expect(onChange).not.toHaveBeenCalled();
    expect(
      screen.getByRole('adjustable', { name: 'Minimum value' }).props.accessibilityState,
    ).toEqual({
      disabled: true,
    });
  });

  describe('accessibility actions', () => {
    it('increments/decrements the lower thumb by one step', async () => {
      const onChange = jest.fn();

      await render(
        <GnomeProvider colorScheme="light">
          <RangeSlider value={[20, 80]} onChange={onChange} step={5} />
        </GnomeProvider>,
      );

      const min = screen.getByRole('adjustable', { name: 'Minimum value' });

      await fireEvent(min, 'accessibilityAction', { nativeEvent: { actionName: 'increment' } });
      await fireEvent(min, 'accessibilityAction', { nativeEvent: { actionName: 'decrement' } });

      expect(onChange).toHaveBeenNthCalledWith(1, [25, 80]);
      expect(onChange).toHaveBeenNthCalledWith(2, [15, 80]);
    });

    it('increments/decrements the upper thumb by one step', async () => {
      const onChange = jest.fn();

      await render(
        <GnomeProvider colorScheme="light">
          <RangeSlider value={[20, 80]} onChange={onChange} step={5} />
        </GnomeProvider>,
      );

      const max = screen.getByRole('adjustable', { name: 'Maximum value' });

      await fireEvent(max, 'accessibilityAction', { nativeEvent: { actionName: 'increment' } });

      expect(onChange).toHaveBeenCalledWith([20, 85]);
    });

    it('ignores accessibility actions when disabled', async () => {
      const onChange = jest.fn();

      await render(
        <GnomeProvider colorScheme="light">
          <RangeSlider value={[20, 80]} onChange={onChange} disabled />
        </GnomeProvider>,
      );

      const min = screen.getByRole('adjustable', { name: 'Minimum value' });

      await fireEvent(min, 'accessibilityAction', { nativeEvent: { actionName: 'increment' } });

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  it('renders mark labels', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <RangeSlider
          value={[20, 80]}
          onChange={jest.fn()}
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
