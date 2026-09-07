import { render, screen } from '@testing-library/react-native';
import type { View } from 'react-native';
import { StyleSheet, Text } from 'react-native';

import { WrapBox } from './WrapBox';

/** `style` arrives as a nested array — flatten before asserting on it. */
const styleOf = (testID: string) => StyleSheet.flatten(screen.getByTestId(testID).props.style);

describe('WrapBox', () => {
  it('renders its children', async () => {
    await render(
      <WrapBox>
        <Text>tag</Text>
      </WrapBox>,
    );

    expect(screen.getByText('tag')).toBeOnTheScreen();
  });

  it('lays children out as a wrapping row', async () => {
    await render(<WrapBox testID="wrap" />);
    const style = styleOf('wrap');

    expect(style.flexDirection).toBe('row');
    expect(style.flexWrap).toBe('wrap');
  });

  it('sets alignContent to stretch so align="stretch" behaves as it does on the web', async () => {
    // CSS defaults align-content to stretch; Yoga defaults it to flex-start,
    // which collapses the line to zero height before alignItems can stretch
    // anything into it.
    await render(<WrapBox testID="wrap" align="stretch" />);

    expect(styleOf('wrap').alignContent).toBe('stretch');
  });

  it('wraps in reverse when wrapReverse is set', async () => {
    await render(<WrapBox testID="wrap" wrapReverse />);

    expect(styleOf('wrap').flexWrap).toBe('wrap-reverse');
  });

  describe('spacing', () => {
    it('defaults both gaps to the HIG standard 6', async () => {
      await render(<WrapBox testID="wrap" />);
      const style = styleOf('wrap');

      expect(style.columnGap).toBe(6);
      expect(style.rowGap).toBe(6);
    });

    it('applies childSpacing to both gaps when lineSpacing is omitted', async () => {
      await render(<WrapBox testID="wrap" childSpacing={12} />);
      const style = styleOf('wrap');

      expect(style.columnGap).toBe(12);
      expect(style.rowGap).toBe(12);
    });

    it('separates the line gap from the child gap when lineSpacing is given', async () => {
      await render(<WrapBox testID="wrap" childSpacing={6} lineSpacing={24} />);
      const style = styleOf('wrap');

      expect(style.columnGap).toBe(6);
      expect(style.rowGap).toBe(24);
    });

    it('honours a lineSpacing of 0 rather than falling back to childSpacing', async () => {
      await render(<WrapBox testID="wrap" childSpacing={12} lineSpacing={0} />);

      expect(styleOf('wrap').rowGap).toBe(0);
    });
  });

  describe('justify', () => {
    it('defaults to start', async () => {
      await render(<WrapBox testID="wrap" />);

      expect(styleOf('wrap').justifyContent).toBe('flex-start');
    });

    it('maps end onto flex-end', async () => {
      await render(<WrapBox testID="wrap" justify="end" />);

      expect(styleOf('wrap').justifyContent).toBe('flex-end');
    });

    it('passes the space-* values through unchanged', async () => {
      await render(<WrapBox testID="wrap" justify="space-evenly" />);

      expect(styleOf('wrap').justifyContent).toBe('space-evenly');
    });
  });

  describe('align', () => {
    it('defaults to center', async () => {
      await render(<WrapBox testID="wrap" />);

      expect(styleOf('wrap').alignItems).toBe('center');
    });

    it('maps the CSS start/end keywords onto Yoga flex-start/flex-end', async () => {
      await render(
        <>
          <WrapBox testID="start" align="start" />
          <WrapBox testID="end" align="end" />
        </>,
      );

      expect(styleOf('start').alignItems).toBe('flex-start');
      expect(styleOf('end').alignItems).toBe('flex-end');
    });

    it('passes stretch through unchanged', async () => {
      await render(<WrapBox testID="wrap" align="stretch" />);

      expect(styleOf('wrap').alignItems).toBe('stretch');
    });
  });

  it('merges a consumer style over its own', async () => {
    await render(<WrapBox testID="wrap" childSpacing={6} style={{ columnGap: 18 }} />);

    expect(styleOf('wrap').columnGap).toBe(18);
  });

  it('forwards extra view props', async () => {
    await render(<WrapBox testID="wrap" accessibilityLabel="Active filters" />);

    expect(screen.getByTestId('wrap').props.accessibilityLabel).toBe('Active filters');
  });

  it('forwards a ref to the underlying view', async () => {
    const ref = { current: null as View | null };
    await render(<WrapBox ref={ref} />);

    expect(ref.current).not.toBeNull();
  });
});
