import { fireEvent, render, screen } from '@testing-library/react-native';
import { createRef } from 'react';
import type { View } from 'react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { Text } from '../Text';
import { Card } from './Card';

describe('Card', () => {
  describe('rendering', () => {
    it('renders children', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Card>
            <Text>Content</Text>
          </Card>
        </GnomeProvider>,
      );
      expect(screen.getByText('Content')).toBeOnTheScreen();
    });

    it('has no button role by default', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Card testID="card">
            <Text>Content</Text>
          </Card>
        </GnomeProvider>,
      );
      expect(screen.queryByRole('button')).toBeNull();
    });

    it('has a button role when interactive', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Card interactive testID="card">
            <Text>Content</Text>
          </Card>
        </GnomeProvider>,
      );
      expect(screen.getByRole('button')).toBeOnTheScreen();
    });
  });

  describe('padding', () => {
    it.each([
      ['none', 0],
      ['sm', 12],
      ['md', 24],
      ['lg', 36],
    ] as const)('applies padding %s as %dpx', async (padding, expected) => {
      await render(
        <GnomeProvider colorScheme="light">
          <Card padding={padding} testID="card">
            <Text>Content</Text>
          </Card>
        </GnomeProvider>,
      );
      expect(screen.getByTestId('card')).toHaveStyle({ padding: expected });
    });

    it('defaults to md padding', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Card testID="card">
            <Text>Content</Text>
          </Card>
        </GnomeProvider>,
      );
      expect(screen.getByTestId('card')).toHaveStyle({ padding: 24 });
    });
  });

  describe('interactive', () => {
    it('calls onPress when pressed', async () => {
      const onPress = jest.fn();

      await render(
        <GnomeProvider colorScheme="light">
          <Card interactive onPress={onPress} testID="card">
            <Text>Content</Text>
          </Card>
        </GnomeProvider>,
      );
      await fireEvent.press(screen.getByTestId('card'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('reflects disabled in accessibilityState', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Card interactive disabled testID="card">
            <Text>Content</Text>
          </Card>
        </GnomeProvider>,
      );
      expect(screen.getByTestId('card').props.accessibilityState).toMatchObject({
        disabled: true,
      });
    });

    it('reduces opacity when disabled', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Card interactive disabled testID="card">
            <Text>Content</Text>
          </Card>
        </GnomeProvider>,
      );
      expect(screen.getByTestId('card')).toHaveStyle({ opacity: 0.5 });
    });
  });

  describe('color', () => {
    it('uses the light theme card colors', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Card testID="card">
            <Text>Content</Text>
          </Card>
        </GnomeProvider>,
      );
      expect(screen.getByTestId('card')).toHaveStyle({
        backgroundColor: '#fff',
        borderColor: 'rgba(0, 0, 0, 0.12)',
      });
    });

    it('uses the dark theme card colors', async () => {
      await render(
        <GnomeProvider colorScheme="dark">
          <Card testID="card">
            <Text>Content</Text>
          </Card>
        </GnomeProvider>,
      );
      expect(screen.getByTestId('card')).toHaveStyle({
        backgroundColor: '#383838',
        borderColor: 'rgba(255, 255, 255, 0.12)',
      });
    });
  });

  describe('prop forwarding', () => {
    it('merges a custom style over the card', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Card style={{ marginTop: 8 }} testID="card">
            <Text>Content</Text>
          </Card>
        </GnomeProvider>,
      );
      expect(screen.getByTestId('card')).toHaveStyle({ marginTop: 8 });
    });

    it('forwards testID', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <Card testID="my-card">
            <Text>Content</Text>
          </Card>
        </GnomeProvider>,
      );
      expect(screen.getByTestId('my-card')).toBeOnTheScreen();
    });

    it('forwards a ref to the underlying View', async () => {
      const ref = createRef<View>();

      await render(
        <GnomeProvider colorScheme="light">
          <Card ref={ref}>
            <Text>Content</Text>
          </Card>
        </GnomeProvider>,
      );
      expect(ref.current).not.toBeNull();
    });

    it('forwards a ref to the underlying Pressable when interactive', async () => {
      const ref = createRef<View>();

      await render(
        <GnomeProvider colorScheme="light">
          <Card interactive ref={ref}>
            <Text>Content</Text>
          </Card>
        </GnomeProvider>,
      );
      expect(ref.current).not.toBeNull();
    });
  });
});
