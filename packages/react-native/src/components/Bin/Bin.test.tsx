import { render, screen } from '@testing-library/react-native';
import type { View } from 'react-native';
import { StyleSheet, Text } from 'react-native';

import { Bin } from './Bin';

describe('Bin', () => {
  it('renders its child', async () => {
    await render(
      <Bin>
        <Text>content</Text>
      </Bin>,
    );

    expect(screen.getByText('content')).toBeOnTheScreen();
  });

  it('forwards style', async () => {
    await render(<Bin testID="bin" style={{ padding: 12 }} />);

    expect(StyleSheet.flatten(screen.getByTestId('bin').props.style).padding).toBe(12);
  });

  it('forwards arbitrary view props', async () => {
    await render(<Bin testID="bin" accessibilityLabel="wrapper" />);

    expect(screen.getByTestId('bin').props.accessibilityLabel).toBe('wrapper');
  });

  it('forwards a ref to the underlying view', async () => {
    const ref = { current: null as View | null };
    await render(<Bin ref={ref} />);

    expect(ref.current).not.toBeNull();
  });
});
