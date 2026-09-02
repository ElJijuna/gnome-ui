import { fireEvent, render, screen } from '@testing-library/react-native';
import { createRef, type ReactElement } from 'react';
import { View } from 'react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { Button } from './Button';

function renderWithProvider(ui: ReactElement) {
  return render(<GnomeProvider colorScheme="light">{ui}</GnomeProvider>);
}

describe('Button', () => {
  describe('rendering', () => {
    it('renders with the button accessibility role', async () => {
      await renderWithProvider(<Button>Click</Button>);
      expect(screen.getByRole('button')).toBeOnTheScreen();
    });

    it('renders string children as text', async () => {
      await renderWithProvider(<Button>Save</Button>);
      expect(screen.getByText('Save')).toBeOnTheScreen();
    });

    it('renders leadingIcon before children', async () => {
      await renderWithProvider(<Button leadingIcon={<View testID="icon" />}>Label</Button>);
      expect(screen.getByTestId('icon')).toBeOnTheScreen();
    });

    it('renders trailingIcon after children', async () => {
      await renderWithProvider(<Button trailingIcon={<View testID="icon" />}>Label</Button>);
      expect(screen.getByTestId('icon')).toBeOnTheScreen();
    });
  });

  describe('variants', () => {
    it('applies the accent background for the suggested variant', async () => {
      await renderWithProvider(<Button variant="suggested">X</Button>);
      expect(screen.getByRole('button')).toHaveStyle({ backgroundColor: '#3584e4' });
    });

    it('applies the destructive background for the destructive variant', async () => {
      await renderWithProvider(<Button variant="destructive">X</Button>);
      expect(screen.getByRole('button')).toHaveStyle({ backgroundColor: '#e01b24' });
    });

    it('applies a transparent background for the flat variant', async () => {
      await renderWithProvider(<Button variant="flat">X</Button>);
      expect(screen.getByRole('button')).toHaveStyle({ backgroundColor: 'transparent' });
    });
  });

  describe('shapes', () => {
    it('applies a pill border radius', async () => {
      await renderWithProvider(<Button shape="pill">X</Button>);
      expect(screen.getByRole('button')).toHaveStyle({ borderRadius: 9999 });
    });

    it('applies equal width/height for circular buttons', async () => {
      await renderWithProvider(
        <Button shape="circular" size="lg">
          X
        </Button>,
      );
      expect(screen.getByRole('button')).toHaveStyle({ width: 42, height: 42 });
    });
  });

  describe('osd', () => {
    it('applies the OSD overlay background when osd is true', async () => {
      await renderWithProvider(<Button osd>X</Button>);
      expect(screen.getByRole('button')).toHaveStyle({ backgroundColor: 'rgba(0, 0, 0, 0.65)' });
    });
  });

  describe('interactions', () => {
    it('calls onPress when pressed', async () => {
      const onPress = jest.fn();

      await renderWithProvider(<Button onPress={onPress}>Click</Button>);
      await fireEvent.press(screen.getByRole('button'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('does not call onPress when disabled', async () => {
      const onPress = jest.fn();

      await renderWithProvider(
        <Button disabled onPress={onPress}>
          Click
        </Button>,
      );
      await fireEvent.press(screen.getByRole('button'));
      expect(onPress).not.toHaveBeenCalled();
    });

    it('is disabled when the disabled prop is set', async () => {
      await renderWithProvider(<Button disabled>Click</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('prop forwarding', () => {
    it('forwards testID', async () => {
      await renderWithProvider(<Button testID="custom">X</Button>);
      expect(screen.getByTestId('custom')).toBeOnTheScreen();
    });

    it('forwards accessibilityLabel', async () => {
      await renderWithProvider(<Button accessibilityLabel="Close dialog">X</Button>);
      expect(screen.getByLabelText('Close dialog')).toBeOnTheScreen();
    });

    it('forwards refs', async () => {
      const ref = createRef<View>();

      await renderWithProvider(<Button ref={ref}>Save</Button>);
      expect(ref.current).not.toBeNull();
    });
  });
});
