import { render, screen } from '@testing-library/react-native';
import { createRef } from 'react';
import type { View } from 'react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { Text } from '../Text';
import { BoxedList } from './BoxedList';

describe('BoxedList', () => {
  describe('rendering', () => {
    it('renders children', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <BoxedList>
            <Text>First row</Text>
            <Text>Second row</Text>
          </BoxedList>
        </GnomeProvider>,
      );
      expect(screen.getByText('First row')).toBeOnTheScreen();
      expect(screen.getByText('Second row')).toBeOnTheScreen();
    });

    it('filters out empty children', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <BoxedList>
            {null}
            <Text>Visible row</Text>
            {false}
          </BoxedList>
        </GnomeProvider>,
      );
      expect(screen.queryAllByTestId('boxed-list-separator')).toHaveLength(0);
      expect(screen.getByText('Visible row')).toBeOnTheScreen();
    });

    it('has a list accessibility role', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <BoxedList testID="list">
            <Text>Row</Text>
          </BoxedList>
        </GnomeProvider>,
      );
      expect(screen.getByRole('list')).toBeOnTheScreen();
    });
  });

  describe('separators', () => {
    it('inserts a separator between default rows', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <BoxedList>
            <Text>First row</Text>
            <Text>Second row</Text>
            <Text>Third row</Text>
          </BoxedList>
        </GnomeProvider>,
      );
      expect(screen.getAllByTestId('boxed-list-separator')).toHaveLength(2);
    });

    it('renders no separators for a single row', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <BoxedList>
            <Text>Only row</Text>
          </BoxedList>
        </GnomeProvider>,
      );
      expect(screen.queryAllByTestId('boxed-list-separator')).toHaveLength(0);
    });

    it('renders no separators in the separate variant', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <BoxedList variant="separate">
            <Text>First row</Text>
            <Text>Second row</Text>
          </BoxedList>
        </GnomeProvider>,
      );
      expect(screen.queryAllByTestId('boxed-list-separator')).toHaveLength(0);
    });
  });

  describe('color', () => {
    it('uses the light theme divider color for the border', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <BoxedList testID="list">
            <Text>Row</Text>
          </BoxedList>
        </GnomeProvider>,
      );
      expect(screen.getByTestId('list')).toHaveStyle({
        backgroundColor: '#fff',
        borderColor: 'rgba(0, 0, 0, 0.07)',
      });
    });

    it('uses the dark theme divider color for the border', async () => {
      await render(
        <GnomeProvider colorScheme="dark">
          <BoxedList testID="list">
            <Text>Row</Text>
          </BoxedList>
        </GnomeProvider>,
      );
      expect(screen.getByTestId('list')).toHaveStyle({
        backgroundColor: '#383838',
        borderColor: 'rgba(255, 255, 255, 0.07)',
      });
    });
  });

  describe('prop forwarding', () => {
    it('merges a custom style over the list', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <BoxedList style={{ marginTop: 8 }} testID="list">
            <Text>Row</Text>
          </BoxedList>
        </GnomeProvider>,
      );
      expect(screen.getByTestId('list')).toHaveStyle({ marginTop: 8 });
    });

    it('forwards testID', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <BoxedList testID="my-list">
            <Text>Row</Text>
          </BoxedList>
        </GnomeProvider>,
      );
      expect(screen.getByTestId('my-list')).toBeOnTheScreen();
    });

    it('forwards a ref to the underlying View', async () => {
      const ref = createRef<View>();

      await render(
        <GnomeProvider colorScheme="light">
          <BoxedList ref={ref}>
            <Text>Row</Text>
          </BoxedList>
        </GnomeProvider>,
      );
      expect(ref.current).not.toBeNull();
    });
  });
});
