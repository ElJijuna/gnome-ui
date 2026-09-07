import { render, screen } from '@testing-library/react-native';
import type { View } from 'react-native';
import { StyleSheet, Text } from 'react-native';

import { Clamp } from './Clamp';

/** `style` arrives as a nested array — flatten before asserting on it. */
const styleOf = (testID: string) => StyleSheet.flatten(screen.getByTestId(testID).props.style);

describe('Clamp', () => {
  it('renders its children', async () => {
    await render(
      <Clamp>
        <Text>content</Text>
      </Clamp>,
    );

    expect(screen.getByText('content')).toBeOnTheScreen();
  });

  it('applies the default maximum size of 600', async () => {
    await render(<Clamp testID="clamp" />);

    expect(styleOf('clamp').maxWidth).toBe(600);
  });

  it('applies a custom maximumSize', async () => {
    await render(<Clamp testID="clamp" maximumSize={800} />);

    expect(styleOf('clamp').maxWidth).toBe(800);
  });

  it('centers itself horizontally', async () => {
    await render(<Clamp testID="clamp" />);

    expect(styleOf('clamp').alignSelf).toBe('center');
  });

  it('fills the available width by default', async () => {
    await render(<Clamp testID="clamp" />);

    expect(styleOf('clamp').width).toBe('100%');
  });

  it('uses tighteningThreshold as a fractional width', async () => {
    await render(<Clamp testID="clamp" tighteningThreshold={0.9} />);

    expect(styleOf('clamp').width).toBe('90%');
  });

  it('clamps an out-of-range tighteningThreshold into 0–1', async () => {
    await render(
      <>
        <Clamp testID="over" tighteningThreshold={1.5} />
        <Clamp testID="under" tighteningThreshold={-1} />
      </>,
    );

    expect(styleOf('over').width).toBe('100%');
    expect(styleOf('under').width).toBe('0%');
  });

  it('merges a consumer style over its own', async () => {
    await render(<Clamp testID="clamp" style={{ maxWidth: 320 }} />);

    expect(styleOf('clamp').maxWidth).toBe(320);
  });

  it('forwards extra view props', async () => {
    await render(<Clamp testID="clamp" accessibilityLabel="Settings content" />);

    expect(screen.getByTestId('clamp').props.accessibilityLabel).toBe('Settings content');
  });

  it('forwards a ref to the underlying view', async () => {
    const ref = { current: null as View | null };
    await render(<Clamp ref={ref} />);

    expect(ref.current).not.toBeNull();
  });
});
