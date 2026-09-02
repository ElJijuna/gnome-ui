import { fireEvent, render, screen } from '@testing-library/react-native';
import { createRef, type ReactElement } from 'react';
import type { View } from 'react-native';
import { Linking } from 'react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { Link } from './Link';

function renderWithProvider(ui: ReactElement) {
  return render(<GnomeProvider colorScheme="light">{ui}</GnomeProvider>);
}

describe('Link', () => {
  describe('rendering', () => {
    it('renders with the link accessibility role', async () => {
      await renderWithProvider(<Link href="https://gnome.org">GNOME</Link>);
      expect(screen.getByRole('link')).toBeOnTheScreen();
    });

    it('renders children', async () => {
      await renderWithProvider(<Link href="https://gnome.org">Visit us</Link>);
      expect(screen.getByText('Visit us')).toBeOnTheScreen();
    });

    it('renders in the accent color', async () => {
      await renderWithProvider(<Link href="https://gnome.org">GNOME</Link>);
      expect(screen.getByText('GNOME')).toHaveStyle({ color: '#3584e4' });
    });

    it('has no underline while idle', async () => {
      await renderWithProvider(<Link href="https://gnome.org">GNOME</Link>);
      expect(screen.getByText('GNOME')).toHaveStyle({ textDecorationLine: 'none' });
    });
  });

  describe('press behaviour', () => {
    it('opens href via Linking.openURL by default', async () => {
      const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);

      await renderWithProvider(<Link href="https://gnome.org">GNOME</Link>);
      await fireEvent.press(screen.getByRole('link'));

      expect(openURL).toHaveBeenCalledWith('https://gnome.org');
      openURL.mockRestore();
    });

    it('calls a custom onPress instead of opening the URL', async () => {
      const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
      const onPress = jest.fn();

      await renderWithProvider(
        <Link href="https://gnome.org" onPress={onPress}>
          GNOME
        </Link>,
      );
      await fireEvent.press(screen.getByRole('link'));

      expect(onPress).toHaveBeenCalledTimes(1);
      expect(openURL).not.toHaveBeenCalled();
      openURL.mockRestore();
    });
  });

  describe('external', () => {
    it('appends a trailing external indicator', async () => {
      await renderWithProvider(
        <Link href="https://gnome.org" external>
          GNOME
        </Link>,
      );
      expect(screen.getByText(/↗/, { includeHiddenElements: true })).toBeOnTheScreen();
    });

    it('hides the indicator from accessibility, matching the "Opens in browser" hint', async () => {
      await renderWithProvider(
        <Link href="https://gnome.org" external>
          GNOME
        </Link>,
      );
      expect(screen.queryByText(/↗/)).toBeNull();
    });

    it('sets an "Opens in browser" accessibility hint', async () => {
      await renderWithProvider(
        <Link href="https://gnome.org" external>
          GNOME
        </Link>,
      );
      expect(screen.getByRole('link').props.accessibilityHint).toBe('Opens in browser');
    });

    it('does not add the indicator or hint when external is false', async () => {
      await renderWithProvider(<Link href="/about">About</Link>);
      expect(screen.queryByText(/↗/)).toBeNull();
      expect(screen.getByRole('link').props.accessibilityHint).toBeUndefined();
    });

    it('still opens via Linking.openURL when external', async () => {
      const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);

      await renderWithProvider(
        <Link href="https://gnome.org" external>
          GNOME
        </Link>,
      );
      await fireEvent.press(screen.getByRole('link'));

      expect(openURL).toHaveBeenCalledWith('https://gnome.org');
      openURL.mockRestore();
    });
  });

  describe('prop forwarding', () => {
    it('merges a custom style over the pressable', async () => {
      await renderWithProvider(
        <Link href="/about" style={{ opacity: 0.5 }}>
          About
        </Link>,
      );
      expect(screen.getByRole('link')).toHaveStyle({ opacity: 0.5 });
    });

    it('merges a custom textStyle over the label', async () => {
      await renderWithProvider(
        <Link href="/about" textStyle={{ fontSize: 20 }}>
          About
        </Link>,
      );
      expect(screen.getByText('About')).toHaveStyle({ fontSize: 20 });
    });

    it('forwards testID', async () => {
      await renderWithProvider(
        <Link href="/about" testID="my-link">
          About
        </Link>,
      );
      expect(screen.getByTestId('my-link')).toBeOnTheScreen();
    });

    it('forwards a ref to the underlying Pressable', async () => {
      const ref = createRef<View>();

      await renderWithProvider(
        <Link href="/about" ref={ref}>
          About
        </Link>,
      );
      expect(ref.current).not.toBeNull();
    });
  });
});
