import { fireEvent, render, screen } from '@testing-library/react-native';

import { ScrollToTop } from './ScrollToTop';

describe('ScrollToTop', () => {
  describe('rendering', () => {
    it('renders a button with accessible label "Scroll to top"', async () => {
      await render(<ScrollToTop visible="always" onPress={() => {}} />);
      expect(screen.getByRole('button', { name: 'Scroll to top' })).toBeOnTheScreen();
    });
  });

  describe('visible="always"', () => {
    it('is rendered regardless of scrollY', async () => {
      await render(<ScrollToTop visible="always" scrollY={0} onPress={() => {}} />);
      expect(screen.getByRole('button', { name: 'Scroll to top' })).toBeOnTheScreen();
    });
  });

  describe('visible="auto"', () => {
    it('is hidden initially when scrollY is 0', async () => {
      await render(<ScrollToTop visible="auto" onPress={() => {}} />);
      expect(screen.queryByRole('button', { name: 'Scroll to top' })).not.toBeOnTheScreen();
    });

    it('appears once scrollY exceeds the default threshold (300)', async () => {
      await render(<ScrollToTop visible="auto" scrollY={301} onPress={() => {}} />);
      expect(screen.getByRole('button', { name: 'Scroll to top' })).toBeOnTheScreen();
    });

    it('hides again once scrollY drops back below the threshold', async () => {
      const { rerender } = await render(
        <ScrollToTop visible="auto" scrollY={301} onPress={() => {}} />,
      );
      expect(screen.getByRole('button', { name: 'Scroll to top' })).toBeOnTheScreen();

      await rerender(<ScrollToTop visible="auto" scrollY={100} onPress={() => {}} />);
      expect(screen.queryByRole('button', { name: 'Scroll to top' })).not.toBeOnTheScreen();
    });

    it('respects a custom threshold', async () => {
      await render(<ScrollToTop visible="auto" threshold={100} scrollY={50} onPress={() => {}} />);
      expect(screen.queryByRole('button', { name: 'Scroll to top' })).not.toBeOnTheScreen();
    });
  });

  describe('interactions', () => {
    it('calls onPress when pressed', async () => {
      const onPress = jest.fn();
      await render(<ScrollToTop visible="always" onPress={onPress} />);

      await fireEvent.press(screen.getByRole('button', { name: 'Scroll to top' }));

      expect(onPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('position', () => {
    it.each([
      'bottom-right',
      'bottom-left',
      'bottom-center',
      'top-right',
      'top-left',
      'top-center',
    ] as const)('renders without crashing for position="%s"', async (position) => {
      await render(<ScrollToTop visible="always" position={position} onPress={() => {}} />);
      expect(screen.getByRole('button', { name: 'Scroll to top' })).toBeOnTheScreen();
    });
  });

  describe('prop forwarding', () => {
    it('forwards testID to the root container', async () => {
      await render(<ScrollToTop visible="always" onPress={() => {}} testID="scroll-to-top" />);
      expect(screen.getByTestId('scroll-to-top')).toBeOnTheScreen();
    });

    it('forwards a ref to the root container', async () => {
      const ref = { current: null };
      await render(<ScrollToTop visible="always" onPress={() => {}} ref={ref} />);
      expect(ref.current).not.toBeNull();
    });
  });
});
