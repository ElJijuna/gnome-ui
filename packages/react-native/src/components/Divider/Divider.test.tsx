import { render, screen } from '@testing-library/react-native';
import { View } from 'react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { Divider } from './Divider';

describe('Divider', () => {
  describe('without a label', () => {
    it('renders as role=separator', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Divider testID="divider" />
        </GnomeProvider>,
      );

      expect(screen.getByRole('separator')).toBeOnTheScreen();
    });

    it('does not set an accessibility label', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Divider />
        </GnomeProvider>,
      );

      expect(screen.getByRole('separator').props.accessibilityLabel).toBeUndefined();
    });
  });

  describe('with a label', () => {
    it('renders the label text', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Divider>OR</Divider>
        </GnomeProvider>,
      );

      expect(screen.getByText('OR')).toBeOnTheScreen();
    });

    it('sets accessibilityLabel to the string label', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Divider>Continue with</Divider>
        </GnomeProvider>,
      );

      expect(screen.getByRole('separator').props.accessibilityLabel).toBe('Continue with');
    });

    it('accepts a non-string label without setting accessibilityLabel', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Divider>
            <View testID="custom" />
          </Divider>
        </GnomeProvider>,
      );

      expect(screen.getByTestId('custom')).toBeOnTheScreen();
      expect(screen.getByRole('separator').props.accessibilityLabel).toBeUndefined();
    });

    it('accepts an explicit accessibilityLabel override', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Divider accessibilityLabel="Custom name">OR</Divider>
        </GnomeProvider>,
      );

      expect(screen.getByRole('separator').props.accessibilityLabel).toBe('Custom name');
    });
  });
});
