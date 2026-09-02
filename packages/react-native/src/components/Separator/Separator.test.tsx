import { render, screen } from '@testing-library/react-native';
import { createRef } from 'react';
import type { View } from 'react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { Separator } from './Separator';

describe('Separator', () => {
  describe('orientation', () => {
    it('defaults to horizontal sizing', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Separator testID="sep" />
        </GnomeProvider>,
      );
      expect(screen.getByTestId('sep')).toHaveStyle({ width: '100%', height: 1 });
    });

    it('applies vertical sizing when orientation="vertical"', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Separator orientation="vertical" testID="sep" />
        </GnomeProvider>,
      );
      expect(screen.getByTestId('sep')).toHaveStyle({
        width: 1,
        height: '100%',
        alignSelf: 'stretch',
      });
    });
  });

  describe('color', () => {
    it('uses the light theme card shade color', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Separator testID="sep" />
        </GnomeProvider>,
      );
      expect(screen.getByTestId('sep')).toHaveStyle({ backgroundColor: 'rgba(0, 0, 0, 0.12)' });
    });

    it('uses the dark theme card shade color', async () => {
      await render(
        <GnomeProvider colorScheme="dark">
          <Separator testID="sep" />
        </GnomeProvider>,
      );
      expect(screen.getByTestId('sep')).toHaveStyle({
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
      });
    });
  });

  describe('accessibility', () => {
    it('is excluded from the accessibility tree', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Separator testID="sep" />
        </GnomeProvider>,
      );
      expect(screen.getByTestId('sep').props.accessible).toBe(false);
    });
  });

  describe('prop forwarding', () => {
    it('merges a custom style over the separator', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Separator style={{ marginVertical: 8 }} testID="sep" />
        </GnomeProvider>,
      );
      expect(screen.getByTestId('sep')).toHaveStyle({ marginVertical: 8 });
    });

    it('forwards testID', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Separator testID="my-separator" />
        </GnomeProvider>,
      );
      expect(screen.getByTestId('my-separator')).toBeOnTheScreen();
    });

    it('forwards a ref to the underlying View', async () => {
      const ref = createRef<View>();

      await render(
        <GnomeProvider colorScheme="light">
          <Separator ref={ref} />
        </GnomeProvider>,
      );
      expect(ref.current).not.toBeNull();
    });
  });
});
