import { fireEvent, render, screen } from '@testing-library/react-native';
import { createRef } from 'react';
import type { View } from 'react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { ViewSwitcher } from './ViewSwitcher';
import { ViewSwitcherItem } from './ViewSwitcherItem';

describe('ViewSwitcher', () => {
  describe('rendering', () => {
    it('renders as a radiogroup with a default accessible label', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <ViewSwitcher />
        </GnomeProvider>,
      );
      expect(screen.getByRole('radiogroup', { name: 'View switcher' })).toBeOnTheScreen();
    });

    it('accepts a custom accessibilityLabel', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <ViewSwitcher accessibilityLabel="Library views" />
        </GnomeProvider>,
      );
      expect(screen.getByRole('radiogroup', { name: 'Library views' })).toBeOnTheScreen();
    });

    it('renders items with role=radio', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <ViewSwitcher>
            <ViewSwitcherItem label="All" active />
            <ViewSwitcherItem label="Photos" />
          </ViewSwitcher>
        </GnomeProvider>,
      );
      expect(screen.getAllByRole('radio')).toHaveLength(2);
    });
  });

  describe('ViewSwitcherItem', () => {
    it('marks the active item checked and others not', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <ViewSwitcher>
            <ViewSwitcherItem label="All" active />
            <ViewSwitcherItem label="Photos" />
          </ViewSwitcher>
        </GnomeProvider>,
      );

      expect(screen.getByRole('radio', { name: 'All' }).props.accessibilityState).toMatchObject({
        checked: true,
      });
      expect(screen.getByRole('radio', { name: 'Photos' }).props.accessibilityState).toMatchObject({
        checked: false,
      });
    });

    it('calls onPress when pressed', async () => {
      const onPress = jest.fn();

      await render(
        <GnomeProvider colorScheme="light">
          <ViewSwitcher>
            <ViewSwitcherItem label="All" onPress={onPress} />
          </ViewSwitcher>
        </GnomeProvider>,
      );
      await fireEvent.press(screen.getByRole('radio', { name: 'All' }));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('can be disabled', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <ViewSwitcher>
            <ViewSwitcherItem label="All" disabled />
          </ViewSwitcher>
        </GnomeProvider>,
      );
      expect(screen.getByRole('radio', { name: 'All' }).props.accessibilityState).toMatchObject({
        disabled: true,
      });
    });
  });

  describe('prop forwarding', () => {
    it('merges a custom style over the switcher', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <ViewSwitcher style={{ marginTop: 8 }} testID="switcher" />
        </GnomeProvider>,
      );
      expect(screen.getByTestId('switcher')).toHaveStyle({ marginTop: 8 });
    });

    it('forwards testID on ViewSwitcher', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <ViewSwitcher testID="my-switcher" />
        </GnomeProvider>,
      );
      expect(screen.getByTestId('my-switcher')).toBeOnTheScreen();
    });

    it('forwards a ref to the underlying View', async () => {
      const ref = createRef<View>();

      await render(
        <GnomeProvider colorScheme="light">
          <ViewSwitcher ref={ref} />
        </GnomeProvider>,
      );
      expect(ref.current).not.toBeNull();
    });

    it('forwards a ref on ViewSwitcherItem', async () => {
      const ref = createRef<View>();

      await render(
        <GnomeProvider colorScheme="light">
          <ViewSwitcherItem label="All" ref={ref} />
        </GnomeProvider>,
      );
      expect(ref.current).not.toBeNull();
    });
  });
});
