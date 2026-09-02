import { fireEvent, render, screen } from '@testing-library/react-native';
import { createRef } from 'react';
import { Text, View } from 'react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { ActionRow } from './ActionRow';

describe('ActionRow', () => {
  describe('rendering', () => {
    it('renders title and subtitle', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <ActionRow title="Wi-Fi" subtitle="Connected" />
        </GnomeProvider>,
      );
      expect(screen.getByText('Wi-Fi')).toBeOnTheScreen();
      expect(screen.getByText('Connected')).toBeOnTheScreen();
    });

    it('renders without a subtitle', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <ActionRow title="Sound" />
        </GnomeProvider>,
      );
      expect(screen.getByText('Sound')).toBeOnTheScreen();
    });

    it('renders leading and trailing slots', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <ActionRow
            title="Bluetooth"
            leading={<Text testID="leading">B</Text>}
            trailing={<Text testID="trailing">Configure</Text>}
          />
        </GnomeProvider>,
      );
      expect(screen.getByTestId('leading')).toBeOnTheScreen();
      expect(screen.getByTestId('trailing')).toBeOnTheScreen();
    });

    it('has no button role by default', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <ActionRow title="Sound" testID="row" />
        </GnomeProvider>,
      );
      expect(screen.queryByRole('button')).toBeNull();
    });

    it('has a button role when interactive', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <ActionRow title="Network" interactive testID="row" />
        </GnomeProvider>,
      );
      expect(screen.getByRole('button')).toBeOnTheScreen();
    });
  });

  describe('interactive', () => {
    it('calls onPress when pressed', async () => {
      const onPress = jest.fn();

      await render(
        <GnomeProvider colorScheme="light">
          <ActionRow title="Network" interactive onPress={onPress} testID="row" />
        </GnomeProvider>,
      );
      await fireEvent.press(screen.getByTestId('row'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('reflects disabled in accessibilityState', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <ActionRow title="Network" interactive disabled testID="row" />
        </GnomeProvider>,
      );
      expect(screen.getByTestId('row').props.accessibilityState).toMatchObject({
        disabled: true,
      });
    });
  });

  describe('property variant', () => {
    it('renders the title small/dim and subtitle prominent', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <ActionRow title="OS Version" subtitle="GNOME 50" variant="property" />
        </GnomeProvider>,
      );
      expect(screen.getByText('OS Version')).toHaveStyle({ fontSize: 12 });
      expect(screen.getByText('GNOME 50')).toHaveStyle({ fontSize: 16 });
    });

    it('renders the default variant with the opposite hierarchy', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <ActionRow title="Wi-Fi" subtitle="Connected" />
        </GnomeProvider>,
      );
      expect(screen.getByText('Wi-Fi')).toHaveStyle({ fontSize: 16 });
      expect(screen.getByText('Connected')).toHaveStyle({ fontSize: 12 });
    });
  });

  describe('prop forwarding', () => {
    it('merges a custom style over the row', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <ActionRow title="Power" style={{ marginTop: 8 }} testID="row" />
        </GnomeProvider>,
      );
      expect(screen.getByTestId('row')).toHaveStyle({ marginTop: 8 });
    });

    it('forwards testID', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <ActionRow title="Power" testID="my-row" />
        </GnomeProvider>,
      );
      expect(screen.getByTestId('my-row')).toBeOnTheScreen();
    });

    it('forwards a ref to the underlying View', async () => {
      const ref = createRef<View>();

      await render(
        <GnomeProvider colorScheme="light">
          <ActionRow title="Power" ref={ref} />
        </GnomeProvider>,
      );
      expect(ref.current).not.toBeNull();
    });

    it('forwards a ref to the underlying Pressable when interactive', async () => {
      const ref = createRef<View>();

      await render(
        <GnomeProvider colorScheme="light">
          <ActionRow title="Power" interactive ref={ref} />
        </GnomeProvider>,
      );
      expect(ref.current).not.toBeNull();
    });
  });
});
