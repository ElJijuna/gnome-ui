import { render, screen } from '@testing-library/react-native';
import { createRef } from 'react';
import { Text, type View } from 'react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { HeaderBar } from './HeaderBar';

describe('HeaderBar', () => {
  describe('rendering', () => {
    it('renders a string title', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <HeaderBar title="My App" />
        </GnomeProvider>,
      );
      expect(screen.getByText('My App')).toBeOnTheScreen();
    });

    it('renders a ReactNode title', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <HeaderBar title={<Text testID="custom-title">Files</Text>} />
        </GnomeProvider>,
      );
      expect(screen.getByTestId('custom-title')).toBeOnTheScreen();
    });

    it('renders start slot content', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <HeaderBar start={<Text testID="back">Back</Text>} />
        </GnomeProvider>,
      );
      expect(screen.getByTestId('back')).toBeOnTheScreen();
    });

    it('renders end slot content', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <HeaderBar end={<Text testID="menu">Menu</Text>} />
        </GnomeProvider>,
      );
      expect(screen.getByTestId('menu')).toBeOnTheScreen();
    });
  });

  describe('flat', () => {
    it('has a bottom border by default', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <HeaderBar testID="bar" />
        </GnomeProvider>,
      );
      expect(screen.getByTestId('bar')).toHaveStyle({ borderBottomWidth: 1 });
    });

    it('removes the bottom border when flat', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <HeaderBar flat testID="bar" />
        </GnomeProvider>,
      );
      expect(screen.getByTestId('bar')).toHaveStyle({ borderBottomWidth: 0 });
    });
  });

  describe('color', () => {
    it('uses the light theme header bar colors', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <HeaderBar testID="bar" />
        </GnomeProvider>,
      );
      expect(screen.getByTestId('bar')).toHaveStyle({
        backgroundColor: '#ebebeb',
        borderBottomColor: 'rgba(0, 0, 0, 0.12)',
      });
    });

    it('uses the dark theme header bar colors', async () => {
      await render(
        <GnomeProvider colorScheme="dark">
          <HeaderBar testID="bar" />
        </GnomeProvider>,
      );
      expect(screen.getByTestId('bar')).toHaveStyle({
        backgroundColor: '#303030',
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
      });
    });
  });

  describe('prop forwarding', () => {
    it('merges a custom style over the bar', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <HeaderBar style={{ marginTop: 8 }} testID="bar" />
        </GnomeProvider>,
      );
      expect(screen.getByTestId('bar')).toHaveStyle({ marginTop: 8 });
    });

    it('forwards testID', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <HeaderBar testID="my-bar" />
        </GnomeProvider>,
      );
      expect(screen.getByTestId('my-bar')).toBeOnTheScreen();
    });

    it('forwards a ref to the underlying View', async () => {
      const ref = createRef<View>();

      await render(
        <GnomeProvider colorScheme="light">
          <HeaderBar ref={ref} />
        </GnomeProvider>,
      );
      expect(ref.current).not.toBeNull();
    });
  });
});
