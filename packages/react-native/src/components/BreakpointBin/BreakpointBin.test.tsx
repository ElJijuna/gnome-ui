import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { BreakpointBin, type BreakpointBinState } from './BreakpointBin';

const layout = (width: number) => ({ nativeEvent: { layout: { x: 0, y: 0, width, height: 100 } } });

const breakpoints = [
  { name: 'compact', maxWidth: 400 },
  { name: 'narrow', maxWidth: 600 },
];

function renderState(state: BreakpointBinState) {
  return (
    <Text testID="state">{`active: ${state.activeBreakpoint ?? 'none'} width: ${state.width}`}</Text>
  );
}

describe('BreakpointBin', () => {
  it('reports width 0 and no active breakpoint before the first layout', async () => {
    await render(
      <BreakpointBin breakpoints={breakpoints} testID="bin">
        {renderState}
      </BreakpointBin>,
    );

    expect(screen.getByTestId('state')).toHaveTextContent('active: compact width: 0');
  });

  it('updates the render-prop state when the measured width crosses a threshold', async () => {
    await render(
      <BreakpointBin breakpoints={breakpoints} testID="bin">
        {renderState}
      </BreakpointBin>,
    );

    await fireEvent(screen.getByTestId('bin'), 'layout', layout(350));

    expect(screen.getByTestId('state')).toHaveTextContent('active: compact width: 350');
  });

  it('picks the smallest matching breakpoint regardless of declaration order', async () => {
    await render(
      <BreakpointBin breakpoints={[...breakpoints].reverse()} testID="bin">
        {renderState}
      </BreakpointBin>,
    );

    await fireEvent(screen.getByTestId('bin'), 'layout', layout(500));

    expect(screen.getByTestId('state')).toHaveTextContent('active: narrow width: 500');
  });

  it('has no active breakpoint when wider than all thresholds', async () => {
    await render(
      <BreakpointBin breakpoints={breakpoints} testID="bin">
        {renderState}
      </BreakpointBin>,
    );

    await fireEvent(screen.getByTestId('bin'), 'layout', layout(800));

    expect(screen.getByTestId('state')).toHaveTextContent('active: none width: 800');
  });

  it('re-evaluates on subsequent layout notifications', async () => {
    await render(
      <BreakpointBin breakpoints={breakpoints} testID="bin">
        {renderState}
      </BreakpointBin>,
    );

    await fireEvent(screen.getByTestId('bin'), 'layout', layout(350));
    expect(screen.getByTestId('state')).toHaveTextContent('active: compact width: 350');

    await fireEvent(screen.getByTestId('bin'), 'layout', layout(800));
    expect(screen.getByTestId('state')).toHaveTextContent('active: none width: 800');
  });

  it('forwards the caller-supplied onLayout handler alongside its own measurement', async () => {
    const onLayout = jest.fn();

    await render(
      <BreakpointBin breakpoints={breakpoints} testID="bin" onLayout={onLayout}>
        {renderState}
      </BreakpointBin>,
    );

    await fireEvent(screen.getByTestId('bin'), 'layout', layout(350));

    expect(onLayout).toHaveBeenCalledTimes(1);
  });
});
