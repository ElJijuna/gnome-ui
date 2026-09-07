import { render, screen } from '@testing-library/react-native';
import type { View } from 'react-native';
import { StyleSheet, Text } from 'react-native';

import { Box } from './Box';

/** `style` arrives as a nested array — flatten before asserting on it. */
const styleOf = (testID: string) => StyleSheet.flatten(screen.getByTestId(testID).props.style);

describe('Box', () => {
  it('renders its children', async () => {
    await render(
      <Box>
        <Text>item</Text>
      </Box>,
    );

    expect(screen.getByText('item')).toBeOnTheScreen();
  });

  describe('orientation', () => {
    it('defaults to a column', async () => {
      await render(<Box testID="box" />);

      expect(styleOf('box').flexDirection).toBe('column');
    });

    it('renders a row when horizontal', async () => {
      await render(<Box testID="box" orientation="horizontal" />);

      expect(styleOf('box').flexDirection).toBe('row');
    });
  });

  describe('spacing', () => {
    it('defaults to the HIG standard 6', async () => {
      await render(<Box testID="box" />);

      expect(styleOf('box').gap).toBe(6);
    });

    it('applies a custom spacing as gap', async () => {
      await render(<Box testID="box" spacing={24} />);

      expect(styleOf('box').gap).toBe(24);
    });
  });

  describe('padding', () => {
    it('is not applied when omitted', async () => {
      await render(<Box testID="box" />);

      expect(styleOf('box').padding).toBeUndefined();
    });

    it('applies to all sides when provided', async () => {
      await render(<Box testID="box" padding={12} />);

      expect(styleOf('box').padding).toBe(12);
    });
  });

  describe('align', () => {
    it('defaults to stretch when vertical', async () => {
      await render(<Box testID="box" />);

      expect(styleOf('box').alignItems).toBe('stretch');
    });

    it('defaults to center when horizontal', async () => {
      await render(<Box testID="box" orientation="horizontal" />);

      expect(styleOf('box').alignItems).toBe('center');
    });

    it('maps the CSS start/end keywords onto Yoga flex-start/flex-end', async () => {
      await render(
        <>
          <Box testID="start" align="start" />
          <Box testID="end" align="end" />
        </>,
      );

      expect(styleOf('start').alignItems).toBe('flex-start');
      expect(styleOf('end').alignItems).toBe('flex-end');
    });

    it('passes baseline through unchanged', async () => {
      await render(<Box testID="box" align="baseline" />);

      expect(styleOf('box').alignItems).toBe('baseline');
    });
  });

  describe('justify', () => {
    it('defaults to start', async () => {
      await render(<Box testID="box" />);

      expect(styleOf('box').justifyContent).toBe('flex-start');
    });

    it('maps end onto flex-end', async () => {
      await render(<Box testID="box" justify="end" />);

      expect(styleOf('box').justifyContent).toBe('flex-end');
    });

    it('passes the space-* values through unchanged', async () => {
      await render(<Box testID="box" justify="space-between" />);

      expect(styleOf('box').justifyContent).toBe('space-between');
    });
  });

  it('merges a consumer style over its own', async () => {
    await render(<Box testID="box" spacing={6} style={{ gap: 32 }} />);

    expect(styleOf('box').gap).toBe(32);
  });

  it('forwards extra view props', async () => {
    await render(<Box testID="box" accessibilityLabel="Device list" />);

    expect(screen.getByTestId('box').props.accessibilityLabel).toBe('Device list');
  });

  it('forwards a ref to the underlying view', async () => {
    const ref = { current: null as View | null };
    await render(<Box ref={ref} />);

    expect(ref.current).not.toBeNull();
  });
});
